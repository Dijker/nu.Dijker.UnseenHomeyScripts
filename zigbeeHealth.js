/**
 * Check Homey's zigBee Health.
 * Please fill in two answers: 
 * - rate your happiness
 *   value 1-10 : 1 = poor 10 = Good/Best
 * - did you Reset Zigbee in v5 or start with v5? 
 *   value: true/false */
let userHappiness = 9            // your Happiness with Zigbee in Homey Firmware v5 
let userResetZigbeeOnv5 = false  // Did you Reset Zigbee in v5 or start with v5?
let anonymizeNames = false       // Show IDs, not names - value: true/false 
/* 
 * Check your Homey's zigbee Health (and maybe fix?).
 *
 * @file    0.1-zigbeeHealth.js by Geurt Dijker
 * @author  Geurt Dijker <Homey.Apps@dijker.nu>
 * @version 1.0.6
 * @link    https://github.com/Dijker/ (Link to be ceated)
 * @since
 * @license GNU General Public License v3.0 @see distribution
 * 20210307 First published on Community forum 
 * 20210307 Added Tips/Link for No Avtive Routers  
 * 20210306 Added logging active Routers (Thanks @Ted for sugestion)  
 * 20210306 test badroute device logging 
 * 20210228 Addes Routing info 
 * 2021~~~~ Manny versions and hours before 1.0.0
 */
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-[ Configure the checks ]-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
function main() {
  // Main Procedure. just (un-)comment the info you want or don't want.
  logIDInfo();
  var routes = zigBeeState.controllerState.routes;
  delete zigBeeState.controllerState.routes
  logLine('1: ZigBee controllerState RAW data')
  log('controllerState => ', JSON.stringify(zigBeeState.controllerState).split(',').join(',\n') + '\'');
  let nodes = objectLength(zigBeeState.nodes);
  let routers = filterObjects(zigBeeState.nodes, "type", "Router");
  let endDevice = filterObjects(zigBeeState.nodes, "type", "EndDevice");
  let manufacturerName = getKeys(zigBeeState.nodes, "manufacturerName");
  let modelId = getKeys(zigBeeState.nodes, "modelId");
  let IEEEAddress = zigBeeState.controllerState.IEEEAddress.split(':').join('');
  logStatInfo();
  logLine('3: Zigbee Network Data')
  log('# Nodes               : ' + nodes);
  log('# Routers             : ' + objectLength(routers));
  log('# EndDevice           : ' + objectLength(endDevice));
  log('# manufacturerNames   : ' + objectLength(manufacturerName));
  log('> manufacturerNames   : ' + JSON.stringify(manufacturerName));
  log('# modelIds            : ' + objectLength(modelId));
  log('> modelIds            : ' + JSON.stringify(modelId));
  let routesPerHops = analyzeRoutes(routes);
  logLine ('3b: routing is an ephemeral state and may change at any time ')
  log('# hops used for device-', ['B', 0, 1, 2, 3, 4]);
  log('result # Routes/hops  :', routesPerHops);
  if (objectLength(badRouteIDs) > 0) {
    logLine('4: Devices with Error in Route')
    listDevices(badRouteIDs);
  }
  logLine('5: Devices active Routing')
  if (objectLength(activeRouteIDs) > 0) {
    listDevices(activeRouteIDs);
  } else { 
    log ('Please add zigBee Routers to create a mesh network')
    log ('For more info read \n' + 
    ' https://support.athom.com/hc/en-us/articles/360019239879-Advice-on-building-a-stable-Zigbee-network')
  }
  var resultObj = [];
  resultObj.push( userHappiness, IEEEAddress, scriptVersion, userResetZigbeeOnv5, SysInfo.homeyModelName,
                  SysInfo.homeyVersion, zigBeeState.controllerState.networkAddress, 
                  zigBeeState.controllerState.channel, zigBeeState.controllerState.chipVersion,
                  zigBeeState.controllerState.transportRev, zigBeeState.controllerState.zstackVersion,
                  nodes, objectLength(routers), objectLength(endDevice), objectLength(manufacturerName),
                  objectLength(modelId), objectLength(activeRouteIDs))
  resultObj = resultObj.concat('#', routesPerHops);
  logLine('6: Zigbee Reporting Data')
  resultStr = JSON.stringify(resultObj).replace('[', '').replace(']', '')
  log('> reporting : ', resultStr, ', $');

  // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-[ Do NOT modify below this line!! ]-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
}; // end of main()

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-[ first get all Homey's info global ]-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
let scriptVersion = 2;
let resultStr = '';
let SysInfo = await Homey.system.getInfo();
let HomeyName = await Homey.system.getSystemName();
var badRouteIDs = [];
var activeRouteIDs = [];

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-[ functions ]-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
function filterObjects(objs, _key, value) {
  var result = [];
  _(objs).forEach(function (obj) {
    if (_key === "type" && obj.type === value) {
      result.push(obj);
    }
  });
  return result;
};

function getKeys(objs, _key) {
  var result = [];
  _(objs).forEach(function (obj) {
    if (_key === "manufacturerName") {
      result.push(obj.manufacturerName);
    }
    if (_key === "modelId") {
      result.push(obj.modelId);
    }
  });
  return _.uniq(result);
};

function logLine(name) {
  var length = (120 - (name.length + 5)) / 4
  log('-='.repeat(length) + '-[ ' + name + ' ]-' + '=-'.repeat(length));
};

function objectLength(obj) {
  var result = 0;
  for (var prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      // or Object.prototype.hasOwnProperty.call(obj, prop)
      result++;
    }
  }
  return result;
};

function analyzeRoutes(obj) {
  var routingHopsUsed = [];
  var list = [];
  // log ('Start analyzeRoutes:', obj );
  var max = 1;
  _(obj).forEach(function (route) {
    if (objectLength(route) > max) {
      max = (objectLength(route))
    }
  })
  // activeRouteIDs.

  for (var i = 0; i <= (max + 1); i++) {
    routingHopsUsed.push(0);
  }
  for (var property in obj) {
    // log ('routeX ' + property )
    list.push(property)
  }
  // log ('NodeIDs = ', list );
  var i = 0
  _(obj).forEach(function (route) {
    // log ('(objectLength (route)', (objectLength (route)), route)
    routingHopsUsed[(objectLength(route) + 1)]++;
    _(route).forEach(function (routeID) {
      if (list.indexOf('' + routeID) < 0) {
        badRouteIDs.push(list[i])
        routingHopsUsed[0]++
      } else {
        // log ('rr ' , routeID );
        activeRouteIDs.push(routeID);
      }
    });
    i++
  })
  // log ('activeRouteIDs 1: ', activeRouteIDs);
  activeRouteIDs = _.uniq(activeRouteIDs);
  // log ('activeRouteIDs 2: ', activeRouteIDs);
  return routingHopsUsed;
};

function logIDInfo() {
  logLine('0: logIDInfo'); // HomeyName
  log('Homey HostName        : ' + SysInfo.hostname);
  log('Homey HomeyName       : ' + HomeyName);
  log('Wifi                  : ' + SysInfo.wifiSsid, SysInfo.wifiMac);
  log('ifconfig              : ' + SysInfo.wifiAddress); // v1 network.wlan0[0].cidr
};

function logStatInfo() {
  logLine('2: logStatInfo'); // HomeyName
  log('Platform              : ' + SysInfo.platform, SysInfo.release, '   Node.JS', SysInfo.nodeVersion);
  log('Model                 : ' + SysInfo.homeyModelName, '-     Model ID ', SysInfo.homeyModelId);
  log('CPUs #/Model/Speed    : ' + objectLength(SysInfo.cpus), 'x', SysInfo.cpus[0].model, '-', SysInfo.cpus[0].speed, 'Mhz.')
  log('Homey Firmware        : ' + SysInfo.homeyVersion);
  log('Memory       Total    : ' + Math.round(SysInfo.totalmem / 1024 / 1024), 'MB  - Free : ', SysInfo.freememMachine / 1024, 'KB - (' + SysInfo.freememHuman + ')',); // v1 freemem = freememMachine  /  freemem_human = freememHuman
  log('Data and Time         : ' + SysInfo.dateHuman, ' Zone  ', SysInfo.timezone, ' [' + SysInfo.date + ']'); // v1 date_human = dateHuman
  log('Uptime                : ' + SysInfo.uptime.toDDHHMMSS());
};

Number.prototype.toDDHHMMSS = function () {
  var seconds = this;
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return d + 'd + ' + [
    h > 9 ? h : '0' + h,
    m > 9 ? m : '0' + m,
    s > 9 ? s : '0' + s,
  ].filter(s => s).join(':');
}


function getDeviceDescription(deviceID) {
  var deviceDescription = '';
  _(zigBeeState.nodes).forEach(function (node) {
    if (node.nwkAddr == deviceID) {
      deviceDescription = '' + (anonymizeNames ? node.nwkAddr : node.name) + ' - (' + node.manufacturerName + ' - ' + node.modelId + ')'
    }
  })
  if (deviceDescription === '') {
      deviceDescription = 'Unknown device (' + deviceID + ')'
  }
  return deviceDescription
};

function listDevices(badIDs) {
  _(badIDs).forEach(function (ID) {
    log(getDeviceDescription(ID));
  })
};

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-[ call main ]-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
let zigBeeState = await Homey.zigBee.getState();
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-[ call main ]-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
main();
return 'Please report above text back on Community'
