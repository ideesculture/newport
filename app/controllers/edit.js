/**
 * Controller for the text screen
 * 
 * @class Controllers.text
 * @uses core
 */
var APP = require("core");
var UTIL = require("utilities");
var DATE = require("alloy/moment");
var HTTP = require("http");
var MODEL = require("models/ca-model")();

var CONFIG = arguments[0];

$.init = function() {
	
	// Hard fixing login & password to improve dev speed
	APP.ca_login="admin";
	APP.ca_password="smf2013";
	
	APP.log("debug", "settings.init");
	APP.log("debug", "text | " + JSON.stringify(CONFIG));
	
	$.heading.color = APP.Settings.colors.hsb.primary.b > 70 ? "#000" : APP.Settings.colors.primary;
	
	$.NavigationBar.setBackgroundColor(APP.Settings.colors.primary);
	
	APP.openLoading();
	
	CONFIG.url = APP.Settings.CollectiveAccess.urlForModel;
	APP.authString = 'Basic ' +Titanium.Utils.base64encode(APP.ca_login+':'+APP.ca_password);
	APP.log("debug","still logged as "+APP.ca_login);
	$.retrieveData();

	
	if(CONFIG.isChild === true) {
		$.NavigationBar.showBack(function(_event) {
			APP.removeChild();
		});
	}
	
	if(APP.Settings.useSlideMenu) {
		$.NavigationBar.showMenu(function(_event) {
			APP.toggleMenu();
		});
	} else {
		$.NavigationBar.showSettings(function(_event) {
			APP.openSettings();
		});
	}
	
	$.NavigationBar.text = "Archivio Teatro Regio";

};

/**
 * Retrieves the data
 * @param {Object} _force Whether to force the request or not (ignores cached data)
 * @param {Object} _callback The function to run on data retrieval
 */
$.retrieveData = function(_force, _callback) {
	APP.log("debug","edit.retrieveData");
	MODEL.fetch({
		url: CONFIG.url,
		authString: APP.authString,
		cache: 0,
		callback: function() {
			$.handleData(MODEL.getModelFirstLevelInfo());

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
	//APP.log("debug",_data);
	
	APP.log("debug",APP.ca_modele_prop);
	APP.log("debug",APP.ca_modele_values.elements);
	var rows=[];
	var totalHeight = 0;
	var i = 1;
	for(var element in APP.ca_modele_values.elements) {
		if(i<10) {
			var row = Alloy.createController("edit_metadata_bundle", {
				element:element,
				content:APP.ca_modele_values.elements[element]
			}).getView();
			totalHeight += row.getHeigh();
			rows.push(row);
		}	
		i++;
	};
	$.bundles.setOpacity(0);
	$.bundles.setData(rows);
	for(var x=0; x<rows.length; x++) {
		$.bundles.add(rows[x]);
	}
	$.bundles.setOpacity(1);

	APP.closeLoading();
};

/*
// Event listeners
$.loginbutton.addEventListener("click", function(_event) {
});
*/
$.init();
