var APP = require("core");
var UTIL = require("utilities");
var DATE = require("alloy/moment");
var HTTP = require("http");
var MODEL = require("models/ca-login")();

var CONFIG = arguments[0];

$.init = function() {
	APP.log("debug", "settings.init");
	APP.log("debug", APP.Settings);
	
	if (APP.logged == true) {
		
	}
	
	MODEL.init(CONFIG.index);
	
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
		authString: APP.authString,
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
			    message: 'Connexion failed. Please retry.',
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
	
	// If we are here, we are logged in
	APP.closeLoading();
	$.message.text = "You are connected.";
	$.loginfield.hide();
	$.passwordfield.hide();
	APP.log("debug", $.loginbutton);
	$.loginbutton.title = "Logout";
	APP.ca_logged = true;
	APP.ca_login = $.loginfield.value;
	APP.ca_password = $.passwordfield.value;
};


// Event listeners
$.loginbutton.addEventListener("click", function(_event) {

	APP.log("debug","fields");
	APP.log("debug",$.loginfield);
	
	if(APP.ca_logged != true) {
		// Login form : password & login are defined
		if($.loginfield.value && $.passwordfield.value) {
			APP.openLoading();
			CONFIG.url = APP.Settings.CollectiveAccess.urlForLogin;
			APP.authString = 'Basic ' +Titanium.Utils.base64encode($.loginfield.value+':'+$.passwordfield.value);
			$.retrieveData();
			//$.loginfield.value + ":" + $.passwordfield.value + "@" + 	
		} else {
			var dialog = Ti.UI.createAlertDialog({
		    	message: 'Please fill username & password',
			    ok: 'OK',
			    title: 'Error'
			  }).show();
		}
	} else {
		// Already logged in : logout action, reset form
		$.message.text = "";
		$.loginfield.value = "";	
		$.passwordfield.value = "";
		APP.logged = false;
		$.loginfield.show();
		$.passwordfield.show();
		$.loginfield.focus();
		$.loginbutton.title = "Login";
	}
});

// Kick off the init
$.init();