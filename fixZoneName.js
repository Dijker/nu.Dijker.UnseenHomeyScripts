//  fixZoneName.js for 1.5.7 bug #2286 - by Geurt Dijker
/*  Congratiations with your New Homey, it came factory default with Firmware 1.5.6! (mentioned Stabel)
    maybe you already upgraded to FW 1.5.7 while in Experimantal?

    We discovered a second Bug* renaming the Zones doesn't update the Zone Names of devices in the FlowEditor and in your Flows.
    "On 1.5.7, after renaming Zones, Still old names in Flow menu"
    https://github.com/athombv/homey/issues/2286

    Good news, it will be fixed in the next Firmware release > 1.5.7!
    Meanwhile all devices that where placed in a Flow before a Rename have the old ZoneName in your Flow Editor!

    To Work around, you have to move the Devices to an other Zone, and move them back. 
    Or copy - paste this script in HomeyScript (https://homeyscript.athom.com/) 
    Press [ Save & Test ]
    and Refresh your Chrome Browser (or Homey App) for the correct  

    This script only refreshes all devices with the new correct Zone name. 

    Enjoy your Homey time!!!
    Regards The Homey Community! 
*/
var devices = await Homey.devices.getDevices();
var result ;
_(devices).forEach( function(device) {
    log ('Updating '+ device.zone.name + '\\'+  device.name );
    var updateDv = {};
    updateDv.id = device.id;
    updateDv.zone = device.zone.id;
    result =  Homey.devices.updateDevice( updateDv );
} );
return ''
