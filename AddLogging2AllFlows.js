// Name: AddLogging2AllFlows.js 
// Short: Add Papertrails logging to ALL your flows in the Then and Else Action (if Else is used) 
//
// Author:  Geurt Dijker
// Version 0.1.1
// Date: 20170915
// 
//  WWWWWWWW                           WWWWWWWW  AAA              RRRRRRRRRRRRRRRRR  NNNNNNNN        NNNNNNNIIIIIIIIINNNNNNNN        NNNNNNNN       GGGGGGGGGGGGG     
//  W::::::W                           W::::::W A:::A             R::::::::::::::::R N:::::::N       N::::::I::::::::N:::::::N       N::::::N    GGG::::::::::::G     
//  W::::::W                           W::::::WA:::::A            R::::::RRRRRR:::::RN::::::::N      N::::::I::::::::N::::::::N      N::::::N  GG:::::::::::::::G     
//  W::::::W                           W::::::A:::::::A           RR:::::R     R:::::N:::::::::N     N::::::II::::::IN:::::::::N     N::::::N G:::::GGGGGGGG::::G     
//   W:::::W           WWWWW           W:::::A:::::::::A            R::::R     R:::::N::::::::::N    N::::::N I::::I N::::::::::N    N::::::NG:::::G       GGGGGG     
//    W:::::W         W:::::W         W:::::A:::::A:::::A           R::::R     R:::::N:::::::::::N   N::::::N I::::I N:::::::::::N   N::::::G:::::G                   
//     W:::::W       W:::::::W       W:::::A:::::A A:::::A          R::::RRRRRR:::::RN:::::::N::::N  N::::::N I::::I N:::::::N::::N  N::::::G:::::G                   
//      W:::::W     W:::::::::W     W:::::A:::::A   A:::::A         R:::::::::::::RR N::::::N N::::N N::::::N I::::I N::::::N N::::N N::::::G:::::G    GGGGGGGGGG     
//       W:::::W   W:::::W:::::W   W:::::A:::::A     A:::::A        R::::RRRRRR:::::RN::::::N  N::::N:::::::N I::::I N::::::N  N::::N:::::::G:::::G    G::::::::G     
//        W:::::W W:::::W W:::::W W:::::A:::::AAAAAAAAA:::::A       R::::R     R:::::N::::::N   N:::::::::::N I::::I N::::::N   N:::::::::::G:::::G    GGGGG::::G     
//         W:::::W:::::W   W:::::W:::::A:::::::::::::::::::::A      R::::R     R:::::N::::::N    N::::::::::N I::::I N::::::N    N::::::::::G:::::G        G::::G     
//          W:::::::::W     W:::::::::A:::::AAAAAAAAAAAAA:::::A     R::::R     R:::::N::::::N     N:::::::::N I::::I N::::::N     N:::::::::NG:::::G       G::::G     
//           W:::::::W       W:::::::A:::::A             A:::::A  RR:::::R     R:::::N::::::N      N::::::::II::::::IN::::::N      N::::::::N G:::::GGGGGGGG::::G     
//            W:::::W         W:::::A:::::A               A:::::A R::::::R     R:::::N::::::N       N:::::::I::::::::N::::::N       N:::::::N  GG:::::::::::::::G     
//             W:::W           W:::A:::::A                 A:::::AR::::::R     R:::::N::::::N        N::::::I::::::::N::::::N        N::::::N    GGG::::::GGG:::G     
//              WWW             WWAAAAAAA                   AAAAAARRRRRRRR     RRRRRRNNNNNNNN         NNNNNNIIIIIIIIINNNNNNNN         NNNNNNN       GGGGGG   GGGG     
//
//
// WARNING! use with Caution! updating Flows from the API can break the Flow and Homey may Crash.                                                                                                                                                                   
//      See the Slack Conversation below:
//
// dijker [5:31 PM] added and commented on this JavaScript/JSON snippet
//      let masterFlow = await Homey.flow.getFlow({id:'6dd1f98d-b8a2-4cf9-9cbf-122231c76fc4'});?
//      If get a Flow from Homey in </> Homey Script with this line, How can I update it back  on Homey?  updateFlow( {id:'the-id'},???)
// dijker [5:43 PM] found it
// dijker [5:43 PM] Homey.flow.updateFlow({id:'6dd1f98d-b8a2-4cf9-9cbf-122231c76fc4', data: masterFlow });
// weejewel [5:46 PM] Please don't - Homey might crash if you edit flows using the api
//
//  So if you are recultrant and ignore the warning not to use, pls follow the next rules:
//  - Backup your Flows (each time) before using the script (https://apps.athom.com/app/nl.regoor.flowbackup)
//  - Test it on one Flow before changing all Flows
//  - Know what you are doïng editing
//  - Don't blame Athom, 
//  - If you make a typo and F*ck-ed up Homey Dont whine, it is your own fault.
//  - But also if I made a mistake in the script: it is your own fault.
//  - But Please share your experience on Slack #HomeyScript to let us learn from your faults.
//

// Create Master Card to Copy to all Flows. (Create a new temp flow to execute the 5 lines below!)
// - Create a Flow and execute the following lines: 
// let masterFlowId = '6dd1f98d-b8a2-4cf9-9cbf-122231c76fc4';
// let masterFlow = await Homey.flow.getFlow({id: masterFlowId });
// log(masterFlow.actions);
// var newLogCardJSON  = JSON.stringify( masterFlow.actions[0] );
// log(newLogCardJSON);
// Copy the string to the line below. (in the Master Flow)
//
// Example wraped for readability:
// var newLogCardJSON  = '{"id":"Input_date_time_log","uri":"homey:app:nu.dijker.papertrails","uriObj":
//      {"type":"app","id":"nu.dijker.papertrails","icon":"/app/nu.dijker.papertrails/assets/icon.svg",
//      "name":"PaperTrails"},"args":{"log":"$$"},"droptoken":false,"group":"then","delay":{
//      "number":"0","multiplier":"1"},"duration":{"number":"0","multiplier":"1"}}'
var newLogCardJSON  = '{"id":"Input_date_time_log","uri":"homey:app:nu.dijker.papertrails","uriObj":{"type":"app","id":"nu.dijker.papertrails","icon":"/app/nu.dijker.papertrails/assets/icon.svg","name":"PaperTrails"},"args":{"log":"$$"},"droptoken":false,"group":"then","delay":{"number":"0","multiplier":"1"},"duration":{"number":"0","multiplier":"1"}}'

// two Global functions:
//   objectLength : Count the Array
//   updateFlow   : Checkand Update the Flow
// 
function objectLength(obj) {
    var result = 0;
    for(var prop in obj) {
        if (obj.hasOwnProperty(prop)) {
        // or Object.prototype.hasOwnProperty.call(obj, prop)
        result++;}}
    return result;
};

function updateFlow( modFlow ) {
    // This is the JSON of the Card we add to all Flows
    var newLogCardJSON  = '{"id":"Input_date_time_log","uri":"homey:app:nu.dijker.papertrails","uriObj":{"type":"app","id":"nu.dijker.papertrails","icon":"/app/nu.dijker.papertrails/assets/icon.svg","name":"PaperTrails"},"args":{"log":"$$"},"droptoken":false,"group":"then","delay":{"number":"0","multiplier":"1"},"duration":{"number":"0","multiplier":"1"}}'

    // Create an Object for the Then and Else groups
    var newLogCardT = JSON.parse(newLogCardJSON);
    newLogCardT.group = 'then';
    var newLogCardE = JSON.parse(newLogCardJSON);
    newLogCardE.group = 'else';
    
    // Init loop
    var modFlowChanged = false;
    var modFlowThen = -1;
    var modFlowElse = -1;
    for(var myIndex in modFlow.actions ) {
        if  ( modFlowThen === -1 ) {
            if (modFlow.actions[ myIndex ].group === 'then') {
                if ( (modFlow.actions[ myIndex ].id === 'Input_date_time_log') && (modFlow.actions[ myIndex ].uri === 'homey:app:nu.dijker.papertrails' ) ) {
                    modFlowThen = myIndex;
                    log( 'Then Already exists '+  myIndex);
                } else {
                    modFlow.actions.splice( myIndex, 0, newLogCardT );
                    modFlow.actions[ myIndex ].args.log = 'AL! Then - ' + modFlow.title;
                    modFlowThen = myIndex;
                    modFlowChanged = true;
                    log( 'Then added '+  myIndex);
                }
            }
        } else {
            if (modFlow.actions[ myIndex ].group === 'then') {
                if ( (modFlow.actions[ myIndex ].id === 'Input_date_time_log') && (modFlow.actions[ myIndex ].uri === 'homey:app:nu.dijker.papertrails' ) ) {
                    log( 'Then Duplicate removed ' +  myIndex);
                    modFlow.actions[ modFlowThen ].args.log = modFlow.actions[ myIndex ].args.log;
                    modFlow.actions.splice( myIndex, 1);
                    modFlowChanged = true;
                } 
            }
        } 
    }
    for(var myIndex in modFlow.actions ) {
        if  (modFlowElse === -1) {
            if (modFlow.actions[ myIndex ].group === 'else') {
                if ( (modFlow.actions[ myIndex ].id === 'Input_date_time_log') && (modFlow.actions[ myIndex ].uri === 'homey:app:nu.dijker.papertrails' ) ) {
                    modFlowElse = myIndex;
                    log( 'Else already exists '+  myIndex);
                } else {
                    modFlow.actions.splice( myIndex, 0, newLogCardE );
                    modFlow.actions[ myIndex ].args.log = 'AL! Else - ' + modFlow.title ;
                    modFlowElse = myIndex;
                    modFlowChanged = true;
                    log( 'Else  added '+  myIndex);
                }
            }
        } else {
            if (modFlow.actions[ myIndex ].group === 'else') {
                if ( (modFlow.actions[ myIndex ].id === 'Input_date_time_log') && (modFlow.actions[ myIndex ].uri === 'homey:app:nu.dijker.papertrails' ) ) {
                    log( 'Else Duplicate removed '+  myIndex);
                    modFlow.actions[ modFlowElse ].args.log = modFlow.actions[ myIndex ].args.log;
                    modFlow.actions.splice( myIndex, 1);
                    modFlowChanged = true;
                } 
            }
        } 
    }
    return modFlowChanged;
} 

// Main code 

let allFlows = await Homey.flow.getFlows();
log ( 'Number of Flows to Process: ' + objectLength( allFlows ) );

// Main Loop over al Flows
for(var myIndex in allFlows ) {
    // if (myIndex === '2fd92697-32e5-4547-be45-a272a5e971f4' ) {
        // log( allFlows[ myIndex ])
        // log('='.repeat(30));
        let mymodFlowChanged = updateFlow( allFlows[ myIndex ] );
        log( 'Number of Actions: ' + objectLength( allFlows[ myIndex ].actions )) ;
        
        // only update flow if changed.
        if (mymodFlowChanged) {
            let result = await Homey.flow.updateFlow({id: myIndex , data: allFlows[ myIndex ] });
            log('Flow Updated');
        } else { log('Flow Unchanged') } 
    //}
} 
