//  createNamedZone.js for 1.5.6 bug #2239 - by Geurt Dijker
/*  Congratiations with your New Homey, it came factory default with Firmware 1.5.6! (mentioned Stabel)
    or maybe you upgraded to FW 1.5.6 while in Experimantal?
    We discovered a Bug after this firmware was shipped to the factory for flashing. 
    https://github.com/athombv/homey/issues/2239

    Good news, it will be fixed in the next Firmware release 1.5.7!
    Meanwhile all created Zones are called "New Zone" and you cant rename any Zone!

    To Work around, fil in your custom Zone name, (below after let newZoneName =)  
    and fil in the the base Zone name (below after  let BaseZone =) 
    Press [ Save & Test ]
    and Refresh your Chrome Browser (or Homey App) 

    This script only creates a new Zone directly with the correct name. 
    You can choose to create it in a 2nd level zone,  (sub-zone fe 'First floor', 'Ground floor' )
    Homey won't let you create new zones as child of the 3rd level (home=1st / 2nd / 3rd )

    Enjoy your Homey time!!!
    Regards The Homey Community! 
*/
// Choose the new Zone Name
let newZoneName = "My Awesome Zone"
// Choose your icon from: ["bed","books","default","garden","home","kitchen","living","roof","shower","stairs-down","stairs-up","toilet"]
let newIconName  =  "garden"; // #@%#@^$&#4 Aaaaahhhhhh.... doesn't work on 1.5.6! Sorry...
// Sorry, setting correct Icon also broken in 1.5.6 !! 
// Choose the base zone 
let BaseZone = 'Home';
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-[ Do NOT modify below this line!! ]-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
async function main(){
    await listIconNames();
    await listZonesAndIDs();
    let newBaseZoneID = await getBaseZoneID(BaseZone);
    // let newBaseZoneID = '855113f1-f488-4223-b675-2f01270f573e';
    var  newZone  = {};
        newZone.name = newZoneName;
        newZone.parent = newBaseZoneID;
        newZone.icon = newIconName;
    // log (JSON.stringify(newZone));
    if (newBaseZoneID != null | undefined) {
        await createZoneCorrect(newZone);
    } else {
        log('\nNo newBaseZoneID, Zone not Created! Pls Fix!') 
    };
};
async function listIconNames(){
    var iconNames = []; 
    let icons = await Homey.zones.getIcons();
    // log (JSON.stringify(icons))
    _(icons).forEach( function(icon) {
        iconNames.push(icon.name) });
    logLine ('List of Icon names');
    log( JSON.stringify( iconNames ));
    log('\n');
};

async function getBaseZoneID( name ){
    var _ID
    let zones = await Homey.zones.getZones();
    _(zones).forEach( function(zone) { 
        if (zone.name === name) { _ID = zone.id };
    });
    return _ID;
};

async function listZonesAndIDs() {
    logLine ('List of Zones and IDs');
    let zones = await Homey.zones.getZones();

    function showFolder(folder, depth) {
        log('   '.repeat(depth), folder.name, ':', folder.id)
        Object.values(zones).forEach(subfolder => {
            if (subfolder.parent === folder.id) {
                showFolder(subfolder, depth + 1);
            }
        });
    };

    Object.values(zones).forEach(zone => {
    if (!zone.parent) {
        showFolder(zone, 0);
    }
    });
    log('\n');
};

async function createZoneCorrect(newZone) {
    logLine ('Creating Zone:"'+newZone.name + '"');
    let result  =  await Homey.zones.createZone( {zone: newZone} )
    // log (result);
    log('\nZone Created!', JSON.stringify(result)) 
};

function logLine(name) {
    var length =  Math.round ((120-(name.length+5))/4)
    log('-='.repeat(length) + '-[ '+ name +' ]-'+'=-'.repeat(length));  
};

main();
return '';
