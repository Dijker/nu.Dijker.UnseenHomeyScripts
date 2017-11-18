/*
  HomeyScript Show All Device Units ShowAllDeviceUnits.js 
  Originaly found on FB Group HomeyFlows (https://www.facebook.com/groups/HomeyFlows .se group)
  By Mikael Eriksson (I guess)
  Archived here om my GitHub by Geurt Dijker
  Date 20171118
  Version 1.0
*/

// Show all devices
let obj = await Homey.devices.getDevices();
let arrDev = Object.values(obj);

// Only filter out Z wave units
// arrDev = arrDev.filter(d => { return (d.settings.zw_node_id != undefined); }); 

// Optionally, only filter devices that are powered up
// arrDev = arrDev.filter(d => { return (d.state.onoff == true); }); 

// Only filter out devices from a particular manufacturer
// arrDev = arrDev.filter(d => { return (d.driver.owner_name == 'Qubino'); }); 

// Optionally, remove virtual devices
// arrDev = arrDev.filter(d => { return (d.driver.owner_name != 'Virtual Devices'); }); 

// Sort the units by room
arrDev.sort(function(a, b) {
    if(a.zone.name < b.zone.name) return -1;
    if(a.zone.name > b.zone.name) return 1;
    if(a.name < b.name) return -1;
    if(a.name > b.name) return 1;
    return 0;
});

console.log('Devices');
console.log('=======');
let antal = 0;

// let fields = [['Zon', 'zone.name'], ['Namn', 'name'], ['Påslagen', 'state.onoff'], ['Tillverkare', 'driver.owner_name'], ['Modell', 'driver.id'], ['ID', 'id'], ['Styrbart', 'capabilitiesArray']];
let fields = [['Zone', 'zone.name'], ['Name', 'name'], ['State', 'state.onoff'], ['BrandName', 'driver.owner_name'], ['Model', 'driver.id'], ['ID', 'id'], ['Capabilities', 'capabilitiesArray'],['addressID', 'data.id']];

let fieldNames = [];
fields.forEach(f => { fieldNames.push(f[0]); });
console.log(fieldNames.join('\t'));

arrDev.forEach(d => {
    let row = [];
    fields.forEach(f => { 
        let args = f[1].split('.');
        let currValue = d;
        for(let i = 0; i < args.length; i++) {
            currValue = currValue[args[i]];
        }
        if(Array.isArray(currValue)) {
            currValue = currValue.join(', ');
        }
        row.push(currValue);
    });
    console.log(row.join('\t'));
});
