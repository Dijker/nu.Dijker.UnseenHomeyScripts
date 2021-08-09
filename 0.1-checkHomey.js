/**
 * Check Homey's Flows and Tags Health.
 *
 * Check your Homey's Flows and Tags Health (and maybe fix?).
 *
 * @file    0.1-checkHomey.js by Geurt Dijker
 * @author  Geurt Dijker <Homey.Apps@dijker.nu>
 * @version 1.1.0
 * @link    https://github.com/Dijker/HomeyScript-GeekBackup
 * @since
 * @license GNU General Public License v3.0 @see distribution
 * 20181201 Added Homey v2.0 compatibility
 * 20181011 Added checkFlowUser @distribution
 * 2018~~~~ Manny versions and hours before 1.0.0
 */
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-[ Configure the checks ]-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
function main() {
  // Main Procedure. just (un-)comment the info you want or don't want.
  getInfo();
  getFlowDeviceTagInfo();
  getTagUsageInfo();
  listTagUsage();
  analyseTagUsage();
  //* Log All Installed App IDs
  log( 'All Apps           :', objectLength(AllApps) , ' ', JSON.stringify(getIDs( AllApps)));
  // reInstallApps( reInstall ); // it won't install HomeyScript as that would break the Script!! ;-)

  //* listZoneNames();
  log( 'Zone Names         :', objectLength(zones) , ' ',JSON.stringify( getNames( zones )));

  //* listDevicenames();
  log( 'Device Names       :', objectLength(devices) , ' ',JSON.stringify( getNames( devices )));
  reportZonevsDevices('\n *** Conflicting Device(s) found with name identical to Zone ***\n ', getNames( devices ), getNames( zones )  );

  analyseFlowUsage() ;
  // reInstallApps( appsMissing ); // only works after analyseFlowUsage (); as it reports appsMissing back.
  checkFlowUser();
  getAlarmsInfo();
  checkFlowAlarms();
  // fixBLVars(); // tbd - fix Variables
  // fixCDTimers(); // tbd - Fix CountDown timers

  let report = true; // report flow names on actions below
  // filterObjects( Array_to_filter(flows), Key_to_check("enabled"), KeyValue_to_ Report(false), True_to_Repoert(true) );
  // Report on flows that are Disabled: // let flowsEnabled =
  filterObjects( flows, "enabled", false, report );
  filterObjects( flows, "broken", true, report );
  let flowsWarning = analyzeFlows( flows, report );
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-[ Do NOT modify below this line!! ]-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
}; // end of main()


// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-[ first get all Homey's info global ]-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
let SysInfo = await Homey.system.getInfo();
var homeyMajorVersion = 0;
if (!SysInfo.homeyVersion && SysInfo.homey_version ) {
    homeyMajorVersion = 1;
    // log ( "Version ", homeyMajorVersion, SysInfo.homey_version )
} else {
    if (SysInfo.homeyVersion && !SysInfo.homey_version ) {
        homeyMajorVersion = 2;
        // log ( "Version ", homeyMajorVersion, SysInfo.homeyVersion );
    }  else {
        log("Error!! no known homeyMajorVersion!",  homeyMajorVersion )
    }
};
let AllApps = await Homey.apps.getApps();
var appsMissing; // set Globaly from analyseFlowUsage();
if (homeyMajorVersion === 1) {
    var folders = await Homey.flow.getFolders();
    var tokens = await Homey.flow.getTokens();
} else { //assume homeyMajorVersion === 2
    var folders = await Homey.flow.getFlowFolders(); // v1 Homey.flow.getFolders();
    var tokens = await Homey.flowToken.getFlowTokens(); // v1 Homey.flow.getTokens()
}
let flows = await Homey.flow.getFlows();
let allTriggers = getTriggers ( flows );
let allConditions = getConditions ( flows );
let allActions = getActions ( flows );
let usedApps = getUsedApps (allTriggers);
    usedApps = usedApps.concat( getUsedApps (allConditions)) ;
    usedApps = usedApps.concat( getUsedApps (allActions) );
    usedApps = _.uniq( usedApps );
let tokensFlow = _.filter( tokens, {uri: 'homey:manager:logic'})
var brokenFlows = _.filter(flows, { broken: true} );
let zones = await Homey.zones.getZones();
let devices = await Homey.devices.getDevices();
let alarms = await Homey.alarms.getAlarms();
let users = await Homey.users.getUsers();

var usedHomeytags = getUsedTags( 'manager:logic' );
var usedBLtags = getUsedTags( 'app:net.i-dev.betterlogic' );
var usedCDtags = getUsedTags( 'app:nl.bevlogenheid.countdown' );
var usedHStags = getUsedTags( 'app:com.athom.homeyscript' );

var tokensFlowIDs = getIDs(tokensFlow);
var BLInstalled = (getIDs( AllApps ).indexOf('net.i-dev.betterlogic')  > -1)
if (BLInstalled) {
  let BLApp = await Homey.apps.getApp({ id: 'net.i-dev.betterlogic' } );
  var tokensBL = _.filter( tokens, {uri: 'homey:app:net.i-dev.betterlogic'})
  var usedBLtags = getUsedTags( 'app:net.i-dev.betterlogic' );
  var tokensBLIDs = getIDs(tokensBL);
};

var CDInstalled = (getIDs( AllApps ).indexOf('nl.bevlogenheid.countdown')  > -1);
if (CDInstalled) {
  let CDApp = await Homey.apps.getApp({ id: 'nl.bevlogenheid.countdown' } );
  var tokensCD = _.filter( tokens, {uri: 'homey:app:nl.bevlogenheid.countdown'})
  var usedCDtags = getUsedTags( 'app:nl.bevlogenheid.countdown' );
  var tokensCDIDs = getIDs(tokensCD);
};
// Yeah HomeyScript is installed !!! ;-)
let tokensHS = _.filter( tokens, {uri: 'homey:app:com.athom.homeyscript'})
var usedHStags = getUsedTags( 'app:com.athom.homeyscript' );
var tokensHSIDs = getIDs(tokensHS);

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-[ functions ]-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
function filterObjects(objs, key, value) {
  var result=[];
  _(objs).forEach( function(obj) {
    if (obj.broken === value) {
      result.push(obj);
    }
  });
  return result;
};

function checkFlowUser(  ) {
    logLine('checkFlowUsers');
    var myObjectIDs = [];
    var missingUsers = [];
    _( users ).forEach( function(myObject) {
        myObjectIDs.push(myObject.id);
    });
    _( flows ).forEach(  function(flow) {
        if ( (flow.trigger.uri  === 'homey:manager:presence') && flow.trigger.args.user  ) {
            if (myObjectIDs.indexOf( flow.trigger.args.user.id) === -1 ) {
                log('Flow "'+ flow.title+ '" refering to Trigger on an User ID that isn\'t authorized! Please Fix!' );
                missingUsers.push(flow.trigger.args.user);
                missingUsers[missingUsers.length -1 ].flow = flow.id;
            }
        }
        _(flow.conditions).forEach( function(condition) {
            if ( (condition.uri  === 'homey:manager:presence' ) && condition.args.user ) {
                if (myObjectIDs.indexOf( condition.args.user.id ) === -1 ) {
                    log('Flow "'+ flow.title+ '" refering to a Condition on an User ID that isn\'t authorized! Please Fix!' );
                    missingUsers.push(condition.args.user);
                    missingUsers[missingUsers.length -1 ].flow = flow.id;
                }
            }
        })
        _(flow.actions).forEach( function(action) {
            if ( (action.uri  === 'homey:manager:presence' ) && action.args.user ) {
                if (myObjectIDs.indexOf( action.args.user.id ) === -1 ) {
                    log('Flow "'+ flow.title+ '" refering to an Action on an User ID that isn\'t authorized! Please Fix!' );
                    missingUsers.push(action.args.user);
                    missingUsers[missingUsers.length -1 ].flow = flow.id;
                }
            }
        })
    });
    var missingUserIDs = [];
    logLine('User(s) in Flows Missing on Homey');
    _(missingUsers).forEach( function(missingUser) {
        if ( missingUserIDs.indexOf( missingUser.id ) === -1 ) {
            missingUserIDs.push(missingUser.id );
            delete missingUser.image;  // Beautify Output ....
            log(  missingUser.name, JSON.stringify( missingUser ));
        }
    })
}

function checkFlowAlarms() {
    logLine('checkFlowAlarms');
    var alarmIDs = [];
    var missingAlarms = [];
    _( alarms ).forEach( function(alarm) {
        alarmIDs.push(alarm.id);
    });
    _( flows ).forEach(  function(flow) {
        if ( (flow.trigger.uri  === 'homey:manager:alarms') && flow.trigger.args && flow.trigger.args.alarm  ) {
            if (alarmIDs.indexOf( flow.trigger.args.alarm.id) === -1 ) {
                log('Flow "'+ flow.title+ '" refering to Trigger on an Alarm ID that isn\'t defined! Please Fix!' );
                missingAlarms.push(flow.trigger.args.alarm);
                missingAlarms[missingAlarms.length -1 ].flow = flow.id;
            }
        }
        _(flow.actions).forEach( function(action) {
            if ( (action.uri  === 'homey:manager:alarms' ) && action.args.alarm ) {
                if (alarmIDs.indexOf( action.args.alarm.id ) === -1 ) {
                    log('Flow "'+ flow.title+ '" refering to Actions on an Alarm ID that isn\'t defined! Please Fix!' );
                    missingAlarms.push(action.args.alarm);
                    missingAlarms[missingAlarms.length -1 ].flow = flow.id;
                }
            }
        })
    })
}

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

function getUsedTags( appUri ) {
  var allBLTags = [];
  //log(flows);
  _.forEach(flows, function(value, key) {
    // console.log('k', key );
    // console.log('t', value.trigger );
    if (value.trigger && value.trigger.uri === 'homey:'+ appUri ) {
      if (value.trigger.args.variable && value.trigger.args.variable.name) {
        // console.log('tn ', value.trigger.args.variable.name );
        allBLTags.push(value.trigger.args.variable.name);
      } else {
        if (value.trigger.args.name) {
          // console.log('tn ', value.trigger.args.name );
          allBLTags.push(value.trigger.args.name);
        }
      }
    };
    _.forEach(value.conditions, function(value, key) {
      // droptoken ==   droptoken: 'homey:app:net.i-dev.betterlogic|YellowUp',
      if (value && value.droptoken ) {
        // console.log('cdn ', value.droptoken );
        if (value.droptoken.indexOf('homey:'+ appUri ) === 0 ) {
          // console.log('cdn tag ', value.droptoken.replace('homey:'+ appUri  + '|','') );
          allBLTags.push(value.droptoken.replace('homey:'+ appUri  + '|',''));
        }
      };
      if (value && value.uri === 'homey:'+ appUri ) {
        if (value.args.variable && value.args.variable.name) {
          // console.log('dn ', value.args.variable.name );
          allBLTags.push(value.args.variable.name);
        } else {
            if (value.args.name) {
              // console.log('dn ', value.args.name );
              allBLTags.push(value.args.name);
            }
        }
      }
    });
    _.forEach(value.actions, function(value, key) {
      if (value &&  value.uri === 'homey:'+ appUri  ) {
        if (value.args.variable && value.args.variable.name) {
          // console.log('an ', value.args.variable.name );
          allBLTags.push(value.args.variable.name);
        } else {
            if (value.args.name) {
              // console.log('an ', value.args.name );
              allBLTags.push(value.args.name);
            }
        }
      }
    })
  });
  return _.uniq( allBLTags )
};

function objectLength(obj) {
    var result = 0;
    for(var prop in obj) {
        if (obj.hasOwnProperty(prop)) {
        // or Object.prototype.hasOwnProperty.call(obj, prop)
        result++;}}
    return result;
}

function logLine(name) {
  var length = (120-(name.length+5))/4
  log('-='.repeat(length) + '-[ '+ name +' ]-'+'=-'.repeat(length));
};

function getUsedApps( obj ) {
  var Apps = [];
    _( obj ).forEach(  function(value) {
      if (value.uriObj && value.uriObj.type && value.uriObj.id && value.uriObj.type === 'app') {
        Apps.push(value.uriObj.id);
      } else {
        if (value.uriObj && value.uriObj.type && value.uriObj.type === 'device' ) {
          if (value.tags && value.tags[0] != 'homey:manager:vdevice') {
            Apps.push( value.tags[0].replace('homey:app:','') );
          } // else { log('No Tags !!!' ); log( JSON.stringify(value) );  }; // Broken Device !!!
        } //else { log('No App No Device  !!!', value.uriObj.type  ) }  ;
      };
    })
    return  _.uniq( Apps );
};

function getIDs( obj ) {
  var IDs = [];
    _( obj ).forEach(  function(value) {
      IDs.push(value.id);
    })
    return IDs;
};

function getNames(_allObj) {
    var Names = [];
    _(_allObj).forEach(function(value) {
        Names.push(value.name);
    })
    return Names;
};

function getTriggers(_allObj) {
    var Triggers = [];
    _(_allObj).forEach(function(value) {
        Triggers.push(value.trigger);
    })
    return Triggers;
};

function getConditions(_allObj) {
    var Conditions = [];
    _(_allObj).forEach(function(value) {
        if (objectLength(value.conditions) > 0 ) {
          _(value.conditions).forEach(function(condition) {
              Conditions.push(condition);
          });
        };
    })
    return Conditions;
};

function getActions(_allObj) {
    var Actions = [];
    _(_allObj).forEach(function(value) {
        if (objectLength(value.actions) > 0 ) {
          _(value.actions).forEach(function(action) {
              Actions.push(action);
          });
        };
    })
    return Actions;
};

function reportZonevsDevices(name, baseTags, compareTags) {
    var tagsFound = [];
    _(baseTags).forEach(function(baseTag) {
        // console.log('check ', baseTag,  compareTags.indexOf(baseTag) )
        if (compareTags.indexOf(baseTag) >= 0) {
            tagsFound.push(baseTag);
        }
    });
    if (objectLength(tagsFound) > 0) {
        log(name + ' : ', JSON.stringify(tagsFound));
    };
};

function reportTagsvsUsed(name, baseTags, compareTags) {
    var tagsFound = [];
    _(baseTags).forEach(function(baseTag) {
        // console.log('check ', baseTag,  compareTags.indexOf(baseTag) )
        if (compareTags.indexOf(baseTag) < 0) {
            tagsFound.push(baseTag);
        }
    });
    if (objectLength(tagsFound) > 0) {
        log(name + ' :', JSON.stringify(tagsFound));
    };
    return tagsFound;
};

function getInfo(){
  logLine('getInfo');
  log('Homey HostName     : ' + SysInfo.hostname);
  // log('Platform           : ' + SysInfo.platform, SysInfo.release , ' Node.JS', SysInfo.node_version, 'Homey Firmware ', SysInfo.homey_version);
  log('Platform           : ' + SysInfo.platform, SysInfo.release , '   Node.JS', SysInfo.nodeVersion );
  log('Model              : ' + SysInfo.homeyModelName , '-     Model ID ', SysInfo.homeyModelId );
  log('CPUs #/Model/Speed : ' + objectLength(SysInfo.cpus), 'x', SysInfo.cpus[0].model, '-',  SysInfo.cpus[0].speed , 'Mhz.'  )
  log('Homey Firmware     : ' + SysInfo.homeyVersion);
  log('Memory       Total : ' + Math.round( SysInfo.totalmem/1024/1024) ,  'MB  - Free : ', SysInfo.freememMachine/1024, 'KB - (' + SysInfo.freememHuman + ')', ); // v1 freemem = freememMachine  /  freemem_human = freememHuman
  log('Data and Time      : ' + SysInfo.dateHuman, ' Zone  ', SysInfo.timezone, ' [' + SysInfo.date + ']' ); // v1 date_human = dateHuman
  log('Uptime             : ' + SysInfo.uptime.toDDHHMMSS() );
  if (homeyMajorVersion === 1) {
    log('Wifi               : ' + SysInfo.wifi_ssid , SysInfo.wifi_mac  );
    log('ifconfig           : ' + SysInfo.network.wlan0[0].cidr  );
  } else {
    log('Wifi               : ' + SysInfo.wifiSsid , SysInfo.wifiMac  );  // v1 wifi_ssid = wifiSsid , SysInfo.wifi_mac = wifiMac
    log('ifconfig           : ' + SysInfo.wifiAddress  ); // v1 network.wlan0[0].cidr
  }
  log('InstalledApps      : ' + objectLength(AllApps) );
  log('UsedApps in Flows  : ' + objectLength(usedApps) );

  log('Alarms defined     : ' + objectLength ( alarms ));
};

function getFlowDeviceTagInfo(){
  logLine('getFlowDeviceTagInfo');
  log('Folders            : ' + objectLength(folders) );
  log('Flows              : ' + objectLength(flows) );
  log('Broken Flows       : ' + objectLength(brokenFlows) );
  log('Tokens             : ' + objectLength(tokens) );
  log('Tokens HomeyFlow   : ' + objectLength(tokensFlow) );
  log('Tokens BL          : ' + objectLength(tokensBL) );
  log('Tokens CD          : ' + objectLength(tokensCD) );
  log('Tokens HomeyScript : ' + objectLength(tokensHS) );
  log('Zones              : ' + objectLength(zones) );
  log('Devices            : ' + objectLength(devices) );
};

function getTagUsageInfo(){
  logLine('getTagUsageInfo');
  log('UsedHomeytags      : ', JSON.stringify(usedHomeytags));
  log('UsedBLtags         : ', JSON.stringify(usedBLtags));
  log('UsedCDtags         : ', JSON.stringify(usedCDtags));
  log('UsedHStags         : ', JSON.stringify(usedHStags));
};

function listTagUsage(){
  logLine('listTagUsage');
  log('tokenFowIDs        : ', JSON.stringify(tokensFlowIDs));
  log('tokensBLIDs        : ', JSON.stringify(tokensBLIDs));
  log('tokensCDIDs        : ', JSON.stringify(tokensCDIDs));
  log('tokensHSIDs        : ', JSON.stringify(tokensHSIDs));
};

function analyseTagUsage(){
  logLine('analyseTagUsage');
  reportTagsvsUsed('Homey FlowTag not (yet) Defined       ', usedHomeytags, tokensFlowIDs );
  reportTagsvsUsed('Defined FlowTag not in use            ', tokensFlowIDs, usedHomeytags );
  reportTagsvsUsed('BL Tag used but not Defined (pls Fix) ', usedBLtags, tokensBLIDs );
  reportTagsvsUsed('Defined BL Tag(s) not in use          ', tokensBLIDs, usedBLtags );
  reportTagsvsUsed('CD Tag used but not Defined (pls Fix) ', usedCDtags, tokensCDIDs );
  reportTagsvsUsed('Defined CD Tag(s) not in use          ', tokensCDIDs, usedCDtags );
};

function analyseFlowUsage(){
  logLine('analyseFlowUsage');
  log( 'Triggers used      :', objectLength ( allTriggers));
  log( 'Conditions used    :', objectLength ( allConditions));
  log( 'Actions used       :', objectLength ( allActions));
  log( 'Apps used in Flows :', objectLength(usedApps) );
  reportTagsvsUsed('Apps not in use   ', getIDs(AllApps), usedApps );
  appsMissing = reportTagsvsUsed('Apps Missing      ', usedApps, getIDs(AllApps) );
};

function getAlarmsInfo(){
  logLine('getAlarmsInfo');
  log( 'Alarms defined     :', objectLength ( alarms ));
  //log( 'Alarms :', JSON.stringify ( alarms ));
    _( alarms ).forEach(  function(value) {
      // beautify
      delete value.__athom_api_type;
      delete value.id;
      log ( JSON.stringify( value ) );
    })
};

async function reInstallApps(reInstallAppList) {
    logLine('reInstallApps');
    var result;
    for (appID in reInstallAppList) {
        if (reInstallAppList[appID] === 'com.athom.homeyscript') {
            log('Not installing HomeyScript!!! ....')
        } else {
            log( 'installing :' , reInstallAppList[appID] );
            result = Homey.apps.installAppById( { id : reInstallAppList[appID] } );
        };
    };
};

function filterObjects(objs, key, value, report) {
  var result=[];
  if (report) {  logLine('Filter ' + key + " is " + value );};
  _(objs).forEach( function(obj) {
    if (key === "enabled" && obj.enabled === value) {
      result.push(obj);
      if (report) { log(obj.title) };
    }
    if (key === "broken" && obj.broken === value) {
      result.push(obj);
      if (report) { log(obj.title) };
    }
    if (key === "group" && obj.group === value) {
      result.push(obj);
      if (report) { log(obj.title) };
    }
  });
  if (report) {
    switch (key) {
      case "enabled":
        log( 'Disabled Flows                          :',  objectLength( result ) ); break;
      case "broken":
        log( 'Broken Flows                            :',  objectLength( result ) ); break;
      case "group":
      // Nothing
    }
  }
  return result;
};

function analyzeFlows(objs, report) {
  var result=[];
  if (report) {  logLine('analyzeFlows');};
  _(objs).forEach( function(obj) {
    cntTriggers = objectLength( obj.trigger );
    cntActions = objectLength( obj.actions );
    cntConditions = objectLength( obj.conditions );
    let actionsThen = filterObjects(obj.actions, "group", "then", false );
    let actionsElse = filterObjects(obj.actions, "group", "else", false );

    let conditionsGroup1 = filterObjects(obj.actions, "group", "group1", false );
    let conditionsGroup2 = filterObjects(obj.actions, "group", "group2", false );
    let conditionsGroup3 = filterObjects(obj.actions, "group", "group3", false );

    // find tf - Flow Without Trigger
    if ( cntTriggers === 0 ) {
      result.push(obj);
      if (report) { log("ERROR: Flow without Trigger             : " + obj.title) };
    }

    // find tf - Flow Without Action - Then / (with or without Else)
    if ( cntActions === 0 ) {
      result.push(obj);
        if (report) { log("ERROR: Flow without Actions             : " + obj.title) };
    } else {
    // find tf - Flow With Condition Without Then Action, with only Else!
      if ( (objectLength(actionsThen) === 0) && (cntConditions > 0))  {
        result.push(obj);
        if (report) { log("Geeky, !(Conditions) for Actions Else   : " + obj.title) };
      }
    }
    // find tf - Flow with Else Without Condition
    if ( (cntConditions === 0) && (objectLength(actionsElse) > 0) ) {
      result.push(obj);
      if (report) { log("ERROR: Flow with Else without Condition : " + obj.title) };
    }
  });
  if (report) {
    log( 'Warnings on Flows                       :',  objectLength( result ) );
  }
  return result;
};

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-[ call main ]-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
main();
return ''
