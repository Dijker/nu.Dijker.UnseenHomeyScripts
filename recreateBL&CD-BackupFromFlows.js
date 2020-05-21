/**
 * Recreate Better Logic or CountDown backup sring from Flows on your Homey
 *
 * This scrip Check your Homey's Flows and prints a readable list of variables
 *  and a string to restore your missing variables.
 * (fe when you removed the app accicentaly)
 *
 * @file    0.5-recreateBL&CD-BackupFromFlows.js by Geurt Dijker
 * @author  Geurt Dijker <Homey.Apps@dijker.nu>
 * @version 1.0.0
 * @link    https://github.com/Dijker/
 * @since
 * @license GNU General Public License v3.0 @see distribution
 * 20181212 First public version
 * 2018~~~~ Manny versions and hours before 1.0.0
 */
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-[ Configure the checks ]-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
// App to Check: Choose one, Better Logic (Patrick Sannes) or CountDown (Ralf van Dooren)
// let appName = 'net.i-dev.betterlogic'
let appName = 'nl.bevlogenheid.countdown'
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-[ Do NOT modify below this line!! ]-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
logLine(' your' + appName + ' Var names and type: ');
let flows = await Homey.flow.getFlows();
var usedBLtags = getUsedTags( 'app:'+appName );
logLine(' your' + appName + ' Backup string: ');
log ( JSON.stringify( usedBLtags ).split('},{').join('},\n{' )  ) ;
logLine(' copy above block from [{  .... until the last }] and paste it in the App to restore ');
return '';

function getUsedTags( appUri ) {
  var allBLTags = [];
  _.forEach(flows, function(value, key) {
    if (value.trigger && value.trigger.uri === 'homey:'+ appUri ) {
      if (value.trigger.args.variable && value.trigger.args.variable.name) {
        var BLtag = value.trigger.args.variable;
        delete BLtag.label;
        allBLTags.push( BLtag );
      }
    };
    _.forEach(value.conditions, function(value, key) {
      if (value && value.uri === 'homey:'+ appUri ) {
        if (value.args.variable && value.args.variable) {
            var BLtag = value.args.variable;
            delete BLtag.label;
            allBLTags.push( BLtag );
        }
      }
    });
    _.forEach(value.actions, function(value, key) {
      if (value &&  value.uri === 'homey:'+ appUri  ) {
        if (value.args.variable && value.args.variable) {
            var BLtag = value.args.variable;
            delete BLtag.label;
            allBLTags.push( BLtag );
        }
      }
    })
  });
  uniqBLTags = [];
  uniqBLTagNames = [];
  _.forEach( allBLTags,  function(tag) {
    var nameType = tag.name+'-'+tag.type
    if (uniqBLTagNames.indexOf(nameType) < 0  ) {
        uniqBLTagNames.push(nameType);
        uniqBLTags.push(tag);
    }
  })
  log (uniqBLTagNames)
  return _.uniq( uniqBLTags )
};

function logLine(name) {
  var length = (120-(name.length+5))/4
  log('-='.repeat(length) + '-[ '+ name +' ]'+'-='.repeat(length) + '-');
};
