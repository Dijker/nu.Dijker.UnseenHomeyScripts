/**
 * Check your Homey's zigBee Mesh Health and report notifications
 *
 * @file    0.2-zigbeeHealthNotificatonReport.js by Geurt Dijker
 * @author  Geurt Dijker <Homey.Apps@dijker.nu>
 * @version 1.0.0
 * @link    https://github.com/Dijker/ (Link to be ceated)
 * @since
 * @license GNU General Public License v3.0 @see distribution
 * 20210310 First published on Community forum 
 * 20210306 test badroute device logging 
 */
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-[ Configure the checks ]-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
function main() {
  // Main Procedure. just (un-)comment the info you want or don't want.
  var routes = zigBeeState.controllerState.routes;
  delete zigBeeState.controllerState.routes

  let routesPerHops = anlyzeRoutes(routes);
  listBadRoutes(badRouteIDs);

  // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-[ Do NOT modify below this line!! ]-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
}; // end of main()

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-[ first get all Homey's info global ]-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
let  zigBeeState = await Homey.zigBee.getState();
var badRouteIDs = [];
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-[ functions ]-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-


function logLine(name) {
  var length = (100-(name.length+5))/4
  log('-='.repeat(length) + '-[ '+ name +' ]-'+'=-'.repeat(length));
};

function objectLength(obj) {
    var result = 0;
    for(var prop in obj) {
        if (obj.hasOwnProperty(prop)) {
        result++;}}
    return result;
};

function anlyzeRoutes(obj) {
  var result = [];
  var list = [];
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
    list.push(property)
  }
  var i = 0
  _(obj).forEach( function (route) { 
    result[(objectLength (route)+1)]++  ;
    _(route).forEach( function (routeID) { 
      if (list.indexOf(''+routeID) < 0) { 
        badRouteIDs.push(list[i])
        result[0]++ 
      }
    })
    i++
  })
  // log ('# hops used for device-' , [ 'B',0,1,2,3,4] );
  // log ('result # Routes/hops  :' , result );
  return result;
};


function getDeviceName(deviceID) {
  var result = '';
  _(zigBeeState.nodes).forEach( function (node ) { 
    if ( node.nwkAddr == deviceID ) {
      result = node.name
    }
  })
  return result
};

function listBadRoutes (badIDs) {
  logLine ('Devices with Error in Route')
  // log ('(badIDs:', badIDs)
  _(badIDs).forEach( async function (ID) {
    var devName = getDeviceName (ID);
    if (devName === '') {
      devName = 'Unknown device'
    } else {
       Homey.flow.runFlowCardAction({
        uri: 'homey:manager:notifications',
        id: 'create_notification',
        args: {
          text: 'myZigBeeHealth Device ' + devName + ' has BadRoute info'
        },
      });
    }
    log ( 'Error in route from: ' + devName );
  })
};


// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-[ call main ]-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
main();
return true
