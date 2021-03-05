/**
 * Check Homey's zigBee Health.
 * Please fill in two answers: 
 * rate your happiness / did you Reset Zigbee in v5 or start with v5?*/
let userHappiness = 9            // Rate your Happiness with Zigbee in Homey Firmware v5 
let userResetZigbeeOnv5 = false  // Did you Reset Zigbee in v5 or start with v5?
/* 
 * Check your Homey's zigbee Health (and maybe fix?).
 *
 * @file    0.1-zigbeeHealth.js by Geurt Dijker
 * @author  Geurt Dijker <Homey.Apps@dijker.nu>
 * @version 1.0.0
 * @link    https://github.com/Dijker/ (Link to be ceated)
 * @since
 * @license GNU General Public License v3.0 @see distribution
 * 20210228 First published on Community forum 
 * 20210228 Addes Routing info 
 * 2021~~~~ Manny versions and hours before 1.0.0
 */
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-[ Configure the checks ]-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
function main() {
  // Main Procedure. just (un-)comment the info you want or don't want.
  logIDInfo();
  var routes = zigBeeState.controllerState.routes;
  //log(JSON.stringify( zigBeeState.controllerState ));
  delete zigBeeState.controllerState.routes
  logLine('controllerState RAW data')
  log('controllerState => ' ,JSON.stringify (zigBeeState.controllerState ).split(',').join(',\n' ) + '\'' );
  let nodes = objectLength (zigBeeState.nodes);
  let routers = filterObjects( zigBeeState.nodes, "type", "Router" );
  let endDevice = filterObjects( zigBeeState.nodes, "type", "EndDevice" );
  let manufacturerName = getKeys ( zigBeeState.nodes, "manufacturerName"  );
  let modelId = getKeys ( zigBeeState.nodes, "modelId"  );
  let IEEEAddress = zigBeeState.controllerState.IEEEAddress.split(':').join('' );
  logStatInfo();
  logLine('Zigbee Network Data' )
  log ('# Nodes               : ' + nodes);
  log ('# Routers             : ' + objectLength( routers ));
  log ('# EndDevice           : ' + objectLength( endDevice ));
  log ('# manufacturerNames   : ' + objectLength( manufacturerName ));
  log ('> manufacturerNames   : ' +  JSON.stringify( manufacturerName ) );
  log ('# modelIds            : ' + objectLength( modelId ));
  log ('> modelIds            : ' + JSON.stringify( modelId )  );
  let routesPerHops = anlyzeRoutes(routes);
  // log ('Routers    : ', routers);
  // listDevicenames();
  // log( 'Device Names       :', objectLength(devices) , ' ',JSON.stringify( getNames( devices )));
  var enquete = [];
  enquete.push( userHappiness, IEEEAddress, scriptVersion, userResetZigbeeOnv5, SysInfo.homeyModelName, SysInfo.homeyVersion, zigBeeState.controllerState.networkAddress, zigBeeState.controllerState.channel, zigBeeState.controllerState.chipVersion, zigBeeState.controllerState.transportRev, zigBeeState.controllerState.zstackVersion, nodes, objectLength( routers ), objectLength( endDevice ), objectLength( manufacturerName ),objectLength( modelId ))
enquete = enquete.concat( '#', routesPerHops );
  logLine('Zigbee enquete Data')
  log ('> enquete            : ' , JSON.stringify(enquete) );


  // log ('routes', routes)
  // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-[ Do NOT modify below this line!! ]-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
}; // end of main()

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-[ first get all Homey's info global ]-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
let scriptVersion = 1;
let SysInfo = await Homey.system.getInfo();
let HomeyName = await Homey.system.getSystemName();

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-[ functions ]-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
function filterObjects(objs, _key, value) {
  var result=[];
  _(objs).forEach( function(obj) {
      if (_key === "type" && obj.type === value) {
      result.push(obj);
    }
  });
  return result;
};

function getKeys (objs, _key ) {
  var result=[];
  _(objs).forEach( function(obj) {
    if (_key === "manufacturerName" ) {
      result.push(obj.manufacturerName);
    }
    if (_key === "modelId" ) {
      result.push(obj.modelId);
    }
  });
  return _.uniq( result );
};

function logLine(name) {
  var length = (120-(name.length+5))/4
  log('-='.repeat(length) + '-[ '+ name +' ]-'+'=-'.repeat(length));
};

function objectLength(obj) {
    var result = 0;
    for(var prop in obj) {
        if (obj.hasOwnProperty(prop)) {
        // or Object.prototype.hasOwnProperty.call(obj, prop)
        result++;}}
    return result;
};

function anlyzeRoutes(obj) {
  var result = [];
  var list = [];
  // log ('Start anlyzeRoutes:', obj );
  var max = 1;
  _(obj).forEach( function (route) {
    if (objectLength(route) > max) {
      max=(objectLength (route)) 
    }
  })
  for(var i = 0; i <= (max+1); i++) {
    result.push(0);
  }
  for ( var property in obj ) {
    // log ('routeX ' + property )
    list.push(property)
  }
  // log ('NodeIDs = ', list );
  _(obj).forEach( function (route) { 
    // log ('(objectLength (route)', (objectLength (route)), route)
    result[(objectLength (route)+1)]++  ;
    _(route).forEach( function (routeID) { 
      // log ('routeID XX ', ''+routeID, list.indexOf(''+routeID) )
      if (list.indexOf(''+routeID) < 0) { result[0]++ }})
  })
  log ('# hops used for device-' , [ 'B',0,1,2,3,4] );
  log ('result # Routes/hops  :' , result );
  return result;
};

function logIDInfo(){
  logLine('logIDInfo'); // HomeyName
  log('Homey HostName        : ' + SysInfo.hostname);
  log('Homey HomeyName       : ' + HomeyName);
  log('Wifi                  : ' + SysInfo.wifiSsid , SysInfo.wifiMac  );  
  log('ifconfig              : ' + SysInfo.wifiAddress  ); // v1 network.wlan0[0].cidr
};

function logStatInfo(){
  logLine('logStatInfo'); // HomeyName
  log('Platform              : ' + SysInfo.platform, SysInfo.release , '   Node.JS', SysInfo.nodeVersion );
  log('Model                 : ' + SysInfo.homeyModelName , '-     Model ID ', SysInfo.homeyModelId );
  log('CPUs #/Model/Speed    : ' + objectLength(SysInfo.cpus), 'x', SysInfo.cpus[0].model, '-',  SysInfo.cpus[0].speed , 'Mhz.'  )
  log('Homey Firmware        : ' + SysInfo.homeyVersion);
  log('Memory       Total    : ' + Math.round( SysInfo.totalmem/1024/1024) ,  'MB  - Free : ', SysInfo.freememMachine/1024, 'KB - (' + SysInfo.freememHuman + ')', ); // v1 freemem = freememMachine  /  freemem_human = freememHuman
  log('Data and Time         : ' + SysInfo.dateHuman, ' Zone  ', SysInfo.timezone, ' [' + SysInfo.date + ']' ); // v1 date_human = dateHuman
  log('Uptime                : ' + SysInfo.uptime.toDDHHMMSS() );
};

Number.prototype.toDDHHMMSS = function() {
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

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-[ call main ]-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
let  zigBeeState = await Homey.zigBee.getState();
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-[ call main ]-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
main();
return 'Thanks'
