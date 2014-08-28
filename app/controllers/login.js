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

	var fnSuccess = function(_data, _url) {
		APP.log("debug", "fnSuccess");
		Ti.UI.createAlertDialog({
			message: $.loginfield.value + "/" + $.loginfield.value,
			ok: 'Okay',
			title: 'Button'
		}).show();
	};
	var fnError = function() {
		APP.log("debug", "fnError");
		Ti.UI.createAlertDialog({
			message: "y'a pas bon :-(",
			ok: 'Close',
			title: 'Button'
		}).show();
	};
	HTTP.request({
		timeout: 2000,
		type: "GET",
		format: "JSON",
		url: "http://fakerest.site.192.168.20.10.xip.io/login_ok.txt",
		success: fnSuccess,
		failure: fnError
	});
});

// Kick off the init
$.init();