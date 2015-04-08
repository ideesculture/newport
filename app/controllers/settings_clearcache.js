/**
 * Controller for the settings clear cache screen
 * 
 * @class Controllers.settings.credits
 * @uses core
 */
var APP = require("core");


var COMMONS = require("ca-commons");
var CONFIG = arguments[0];
var maxwidth = Ti.Platform.displayCaps.platformWidth;
var maxheight = Ti.Platform.displayCaps.platformHeight;
var HIERARCHY_MODEL = require("models/ca-objects-hierarchy")();

/**
 * Initializes the controller
 */
$.init = function() {
	//APP.log("debug", "settings_clearcache.init");

	$.NavigationBar.setBackgroundColor(APP.Settings.colors.primary);

	$.NavigationBar.showBack(function(_event) {
		APP.removeChild(true);
	});

	APP.rebuild();

	$.label.text = "The local database was erased. Everything will now be fetched back again and cache reconstructed. Hit back to go back on home screen.";

};

// Kick off the init
$.init();