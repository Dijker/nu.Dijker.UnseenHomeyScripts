/**
 * Check Homey's Flows for Speech .
 *
 * @file    Speech Flows deprecated April 1st 2021.js by Geurt Dijker
 * @author  Geurt Dijker <Homey.Apps@dijker.nu>
 * @version 1.0.0
 * @link    https://github.com/Dijker/
 * 20210113 Initial versionb
 */
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-[ Configure the checks ]-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
function main() {
  // Main Procedure. just (un-)comment the info you want or don't want.
  let report = true; // report flow names 
  filter104Objects( flows, report );
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-[ Do NOT modify below this line!! ]-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
}; // end of main()

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-[ first get all Homey's info global ]-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
let flows = await Homey.flow.getFlows();

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

function filter104Objects(objs,  report) {
  var result=[];
  var FlowSpeech=false;
  if (report) {  logLine('Analyze Speech Flows deprecated after April 1st 2021' )};
  _(objs).forEach( function(obj) {
      FlowSpeech = false;
      if (obj.trigger.uri === "homey:manager:speech-output") { 
        if (obj.trigger.id != 'said') { 
          FlowSpeech = true;
          }};
      _(obj.conditions).forEach( function(objc) {
          if (objc.uri === "homey:manager:speech-output") { 
            FlowSpeech = true;
          }  
        })
      _(obj.actions).forEach( function(obja) {
        if (obja.uri === "homey:manager:speech-output") { 
          if (obja.id != 'say') { 
            FlowSpeech = true;
        }}
      })
      if (report && FlowSpeech) { 
        result.push(obj);
        log(obj.name) }
  });
  if (report) {
    logLine('Count' )
    log( 'Speech Flows deprecated April 1st 2021  :',  objectLength( result ) )
  }
  return result;
};

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-[ call main ]-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
main();
return ''
