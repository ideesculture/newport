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
var MODEL_MODEL = require("models/ca-model")();
var UI_MODEL = require("models/ca-ui")();

var CONFIG = arguments[0];

// Temporary fixing the table we"re editing, need to come through CONFIG after
var TABLE = "ca_objects";

$.init = function() {
	// Initiating CA db model class
	MODEL_MODEL.init(TABLE);
	// Initiating CA available UIs class
	UI_MODEL.init();
	
	// Hard fixing login & password to improve dev speed
	APP.ca_login="admin";
	APP.ca_password="smf2013";
	
	APP.log("debug", "settings.init");
	APP.log("debug", "text | " + JSON.stringify(CONFIG));
	
	$.heading.color = APP.Settings.colors.hsb.primary.b > 70 ? "#000" : APP.Settings.colors.primary;
	
	Alloy.Globals.fieldsColor = APP.Settings.colors.secondary;
	
	$.NavigationBar.setBackgroundColor(APP.Settings.colors.primary);
	
	APP.openLoading();
	
	
	APP.authString = 'Basic ' +Titanium.Utils.base64encode(APP.ca_login+':'+APP.ca_password);
	APP.log("debug","still logged as "+APP.ca_login);
	
	// Loading CA database model (metadatas & fields) & filling cache
	CONFIG.url = APP.Settings.CollectiveAccess.urlForModel;
	$.modelRetrieveData();

	// Loading CA screens & uis & filling cache
	CONFIG.ui_url = APP.Settings.CollectiveAccess.urlForUis;
	$.uiRetrieveData();
	
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
$.modelRetrieveData = function(_force, _callback) {
	APP.log("debug","edit.retrieveData");
	MODEL_MODEL.fetch({
		url: CONFIG.url,
		authString: APP.authString,
		cache: 0,
		callback: function() {
			$.modelHandleData(MODEL_MODEL.getModelFirstLevelInfo());

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
	
	
	//$.uiRetrieveData();
};

$.uiRetrieveData = function(_force, _callback) {
	APP.log("debug","edit.retrieveData");
	APP.log("debug","CONFIG.ui_url");
	APP.log("debug",CONFIG.ui_url);
	
	UI_MODEL.fetch({
		url: CONFIG.ui_url,
		authString: APP.authString,
		cache: 0,
		callback: function() {
			// Getting default (aka first) available ui for the record type we have
			var ui_code = UI_MODEL.getFirstAvailableUIForTable(TABLE).code;
			APP.log("debug",ui_code);
			// Fetching defaulft (aka first) available screen for this UI
			APP.log("debug","UI_MODEL.getFirstAvailableScreenWithContentForUI("+TABLE+","+ui_code+")");

			$.uiHandleData(UI_MODEL.getFirstAvailableScreenWithContentForUI(TABLE,ui_code));

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
$.modelHandleData = function(_data) {
	//APP.log("debug", "login.handleData");
	//APP.log("debug",_data);
	
	//APP.log("debug",APP.ca_modele_prop);
	//APP.log("debug",APP.ca_modele_values.elements);
	var rows=[];
	var totalHeight = 0;
	var i = 0;
	/*
	for(var element in APP.ca_modele_values.elements) {
		if(i<10) {
			APP.log("debug", element);
			
			var row = Alloy.createController("edit_metadata_bundle", {
				element:element,
				content:APP.ca_modele_values.elements[element]
			}).getView();
			totalHeight += row.getHeigh();
			rows.push(row);
			
		}	
		i++;
	};*/
	/*
	$.bundles.setOpacity(0);
	$.bundles.setData(rows);
	for(var x=0; x<rows.length; x++) {
		$.bundles.add(rows[x]);
	}
	$.bundles.setOpacity(1);

	APP.closeLoading();*/
};

$.uiHandleData = function(_data) {
	APP.log("debug", "edit.uiHandleData");
	
	APP.log("debug",_data);
	var rows=[];

	var i = 1;
	var screen_content = _data.content.screen_content;
	for(var bundle in screen_content) {
		var bundle_code = screen_content[bundle].bundle_code;

		if(i<50) {
			// Test if we're in presence of an attribute
			if (bundle_code.substring(0, 13) == "ca_attribute_") {
				// If the bundle described in the screen corresponds to sthg in the model, display it
				var attribute = bundle_code.replace(/^ca_attribute_/,"");
				//APP.log("debug", JSON.parse(MODEL_MODEL.getElementInfo("ca_objects", attribute)));
				
				if (MODEL_MODEL.hasElementInfo("ca_objects", attribute) > 0) {
					APP.log("debug","attribute : "+attribute);
					APP.log("debug", MODEL_MODEL.hasElementInfo("ca_objects", attribute));
					var element_data = MODEL_MODEL.getElementInfo("ca_objects", attribute);
					var row = Alloy.createController("edit_metadata_bundle", {
						element:attribute,
						content:element_data
					}).getView();
					rows.push(row);
				}
			}
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
	//APP.log("debug",APP.ca_modele_prop);
	//APP.log("debug",APP.ca_modele_values.elements);

};

/*
// Event listeners
$.loginbutton.addEventListener("click", function(_event) {
});
*/
$.init();
