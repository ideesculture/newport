var APP = require("core");
var UTIL = require("utilities");
var DATE = require("alloy/moment");
var HTTP = require("http");
var MODEL = require("models/ca-connexion")();

var CONFIG = arguments[0];

$.init = function() {
	APP.log("debug", "settings.init");
	
	MODEL.init(CONFIG.index);
	
	CONFIG.url = "http://fakerest.site.192.168.20.10.xip.io/login_ok.txt";
	APP.log("debug", APP.settings);

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

/**
 * Retrieves the data
 * @param {Object} _force Whether to force the request or not (ignores cached data)
 * @param {Object} _callback The function to run on data retrieval
 */
$.retrieveData = function(_force, _callback) {
	MODEL.fetch({
		url: CONFIG.url,
		cache: 0,
		callback: function() {
			$.handleData(MODEL.isConnected());

			if(typeof _callback !== "undefined") {
				_callback();
			}
		},
		error: function() {
			APP.closeLoading();
			var dialog = Ti.UI.createAlertDialog({
			    message: 'The server cannot be reached. Please retry.',
			    ok: 'OK',
			    title: 'Error'
			  }).show();
			if(typeof _callback !== "undefined") {
				_callback();
			}
		}
	});
};

/**
 * Handles the data return
 * @param {Object} _data The returned data
 */
$.handleData = function(_data) {
	APP.log("debug", "login.handleData");
	APP.log("debug",_data);
	
	APP.closeLoading();
};


// Event listeners
$.loginbutton.addEventListener("click", function(_event) {
	APP.openLoading();
	$.retrieveData();
});

// Kick off the init
$.init();