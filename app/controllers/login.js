var APP = require("core");
var HTTP = require("http");

$.init = function() {
	APP.log("debug", "settings.init");

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
$.loginbutton.addEventListener("click", function(_event) {
	APP.log("debug", $.loginfield);

	var dialog = Ti.UI.createAlertDialog({
		message: $.loginfield.value + "/" + $.loginfield.value,
		ok: 'Okay',
		title: 'Button'
	}).show();
});

// Kick off the init
$.init();