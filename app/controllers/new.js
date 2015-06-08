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
	APP.addChild("new_step2", { type: "fonds" }, true);
});

$.type2.addEventListener("click", function(_event) {
	APP.addChild("new_step2", { type: "section" }, true);
});

$.type3.addEventListener("click", function(_event) {
	APP.addChild("new_step2", { type: "series" }, true);
});

$.type4.addEventListener("click", function(_event) {
	APP.addChild("new_step2", { type: "subseries" }, true);
});

$.type5.addEventListener("click", function(_event) {
	APP.addChild("new_step2", { type: "subsubseries" }, true);
});

$.type6.addEventListener("click", function(_event) {
	APP.addChild("new_step2", { type: "subsubsubseries" }, true);
});

$.type7.addEventListener("click", function(_event) {
	APP.addChild("new_step2", { type: "item" }, true);
});

$.type8.addEventListener("click", function(_event) {
	APP.addChild("new_step2", { type: "manuscript" }, true);
});


// Kick off the init
$.init();