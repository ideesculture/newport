/**
 * Controller for the settings screen
 * 
 * @class Controllers.settings
 * @uses core
 */
var APP = require("core");

/**
 * Initializes the controller
 */
$.init = function() {
	APP.log("debug", "settings.init");

	if(!Ti.UI.createEmailDialog().isSupported) {
		$.container.remove($.logs_table);
	}

	$.copyright.text = APP.LEGAL.COPYRIGHT + " v" + APP.VERSION;
	
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
};

// Event listeners

$.acknowledgements.addEventListener("click", function(_event) {
	APP.log("debug", "settings @credits");

	APP.addChild("settings_credits", {}, true);
});

$.logs.addEventListener("click", function(_event) {
	APP.log("debug", "settings @logs");

	APP.logSend();
});

$.flushlogs.addEventListener("click", function(_event) {
	APP.log("debug", "settings @flushlogs");

	APP.logFlush();
});

// Kick off the init
$.init();