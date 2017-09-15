// my script to test Internationalization i18n
let i18n = await Homey.i18n.getConfig();
console.log( i18n );
// t {
//  __athom_api_type: 'HomeyAPI.ManagerI18n.Config',
//  language: 'nl',
//  units: 'metric' }
console.log( i18n.language );
// nl or en
console.log( i18n.units );
// metric or .....
let tekst = Homey.i18n.__( { en: 'My String', nl: 'Mijn tekst' } );
console.log( tekst );
// I guess you get the options ;-) 
