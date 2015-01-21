/**
 * Controller for the settings credits screen
 * 
 * @class Controllers.settings.credits
 * @uses core
 */
var APP = require("core");

/**
 * Initializes the controller
 */
$.init = function() {
	APP.log("debug", "settings_devsummary.init");

	$.NavigationBar.setBackgroundColor(APP.Settings.colors.primary);

	$.NavigationBar.showBack(function(_event) {
		APP.removeChild(true);
	});

	$.label.text = APP.ID + "\nVersion app/lib/data/app.json : " + APP.VERSION + "\nVersion tiapp.xml : " + Titanium.App.version +"\n(" + APP.CVERSION + ")\n" + APP.Device.os + " " + APP.Device.version + " (" + APP.Device.name + ") " + Ti.Platform.locale + "\n\n";

};

// Kick off the init
$.init();