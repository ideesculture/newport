/**
 * Controller for the typechoice screen
 * 
 * @class Controllers.new_typechoice
 * @uses core
 */
var APP = require("core");

/**
 * Initializes the controller
 */
$.init = function() {
	APP.log("debug", "new.init");
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

$.type1.addEventListener("click", function(_event) {

	alert("type1 selected"); 
	APP.addChild("new_step2", { type: "type1" }, true);
});


// Kick off the init
$.init();