/**
 * Controller for the settings clear cache screen
 *
 * @class Controllers.settings.credits
 * @uses core
 */
var APP = require("core");


var COMMONS = require("ca-commons");
var CONFIG = arguments[0];
Ti.API.log("debug","settings_clearcache CONFIG :");
Ti.API.log("debug",CONFIG);
var maxwidth = Ti.Platform.displayCaps.platformWidth;
var maxheight = Ti.Platform.displayCaps.platformHeight;
//var HIERARCHY_MODEL = require("models/ca-objects-hierarchy")();

/**
 * Initializes the controller
 */
$.init = function() {
	//APP.log("debug", "settings_clearcache.init");

	//$.NavigationBar.setBackgroundColor(APP.Settings.colors.primary);

	/*$.NavigationBar.showBack(function(_event) {
		//APP.removeChild(true);
	});*/

	//APP.rebuild();
	$.NavigationBar.setBackgroundColor(APP.Settings.colors.primary);

	if(APP.Settings.useSlideMenu) {
		$.NavigationBar.showMenu(function(_event) {
			APP.toggleMenu();
		});
	} else {
		$.NavigationBar.showBack(function(_event) {
			APP.removeChild(true);
		});
	}

	$.label.text = "The local database will be erased. Everything will now be fetched back again and cache reconstructed. Hit menu to cancel and go back on home screen. This cannot be undone.";

};

$.clearcache.addEventListener("click", function(_event) {
	APP.log("debug", "settings @emptycache");
	APP.rebuild();

});


// Kick off the init
$.init();
