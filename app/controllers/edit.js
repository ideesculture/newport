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
var COMMONS = require("ca-commons");

var MODEL_MODEL = require("models/ca-model")();
var UI_MODEL = require("models/ca-ui")();
var OBJECT_DETAILS = require("models/ca-object-details")();
var CONFIG = arguments[0];

APP.log("debug","edit CONFIG");
APP.log("debug",CONFIG);

$.heading.text += " editing object #"+CONFIG.obj_data.object_id+" "+CONFIG.obj_data.display_label+" "+CONFIG.obj_data.idno;

// Temporary fixing the table we"re editing, need to come through CONFIG after
$.TABLE = CONFIG.type;
// List of all screen
$.SCREENS = [];
// Index of the screen we want to display, default -1 (first available)
$.SCREEN = "";
$.UI_CODE = "";
// Global variable for this controller to store the object details
$.RECORD = {};

$.init = function() {

	// loading url & cache validity from settings
	CONFIG.validity = APP.Settings.CollectiveAccess.urlForHierarchy.cache;

	//APP.openLoading();
	// Initiating CA db model class
	MODEL_MODEL.init($.TABLE);
	// Initiating CA available UIs class
	UI_MODEL.init();
	// Initiating detail fetching for object
	OBJECT_DETAILS.init($.TABLE);
	
	// Credentials are inside app.json file
	APP.ca_login=APP.Settings.CollectiveAccess.login;
	APP.ca_password=APP.Settings.CollectiveAccess.password;
	
	APP.log("debug", "settings.init");
	
	$.heading.color = APP.Settings.colors.hsb.primary.b > 70 ? "#000" : APP.Settings.colors.primary;
	
	// Defining global variables for styling
	Alloy.Globals.primaryColor =  APP.Settings.colors.primary;
	Alloy.Globals.secondaryColor = APP.Settings.colors.secondary;
	Alloy.Globals.fieldsColor = APP.Settings.colors.secondary;
	
	$.screenButtonsScrollView.setBackgroundColor(APP.Settings.colors.primary);
	$.NavigationBar.setBackgroundColor(APP.Settings.colors.primary);
		
	APP.authString = 'Basic ' +Titanium.Utils.base64encode(APP.ca_login+':'+APP.ca_password);
	APP.log("debug","still logged as "+APP.ca_login);
	
	// Loading CA database model (metadatas & fields) & filling cache
	CONFIG.model_url = APP.Settings.CollectiveAccess.urlForModel.url;
	CONFIG.model_url_validity = APP.Settings.CollectiveAccess.urlForModel.cache;
	$.modelRetrieveData();

	// Loading CA screens & uis & filling cache
	CONFIG.ui_url = APP.Settings.CollectiveAccess.urlForUis.url;
	CONFIG.ui_url_validity = APP.Settings.CollectiveAccess.urlForUis.cache;
	// uiRetrieveData is called from objectRetrieveCallbackFunctions : we need to have the values available before displaying bundles
	//$.uiRetrieveData();

	// Loading object details
	// Loading URL for object details, replacing ID by the current object_id
	CONFIG.object_url = APP.Settings.CollectiveAccess.urlForObjectDetails.url.replace(/ID/g,CONFIG.obj_data.object_id);
	CONFIG.object_url_validity = APP.Settings.CollectiveAccess.urlForObjectDetails.cache;

	$.objectRetrieveData();
	
	if(CONFIG.isChild === true) {
		$.NavigationBar.showBack(function(_event) {
			APP.removeChild();
		});
	} else {
		if(APP.Settings.useSlideMenu) {
			$.NavigationBar.showMenu(function(_event) {
				APP.toggleMenu();
			});
		} else {
			$.NavigationBar.showSettings(function(_event) {
				//APP.openSettings();
			});
		}		
	}
	
	$.NavigationBar.text = "Archivio Teatro Regio";
};

$.modelRetrieveCallbackFunctions = function () {
	$.modelHandleData(MODEL_MODEL.getModelFirstLevelInfo());
};

/**
 * Retrieves the data
 * @param {Object} _force Whether to force the request or not (ignores cached data)
 * @param {Object} _callback The function to run on data retrieval
 */
$.modelRetrieveData = function(_force, _callback) {
	APP.log("debug","edit.retrieveData");
	APP.log("debug","CONFIG.model_url");
	APP.log("debug",CONFIG.model_url);
	APP.log("debug","CONFIG.model_url_validity");
	APP.log("debug",CONFIG.model_url_validity);
	if(COMMONS.isCacheValid(CONFIG.model_url,CONFIG.model_url_validity)) {
		APP.log("debug","ca-model cache is valid");
	} else {
		APP.log("debug","ca-model cache is invalid");		
	};
	/* if(COMMONS.isCacheValid(CONFIG.model_url,CONFIG.model_url_validity)) {
		APP.log("debug","ca-model cache is valid");
		$.modelRetrieveCallbackFunctions();
	} else {	*/			
		MODEL_MODEL.fetch({
			url: CONFIG.model_url,
			authString: APP.authString,
			cache: 0,
			callback: function() {
				$.modelRetrieveCallbackFunctions();	

				if(typeof _callback !== "undefined") {
					_callback();
				}
			},
			error: function() {
				APP.closeLoading();
				Ti.API.log("debug","ca-model.fetch crashed :-(");
				if(typeof _callback !== "undefined") {
					_callback();
				}
			}
		});

	//}
	
	
	//$.uiRetrieveData();
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
};

$.uiRetrieveCallbackFunctions = function() {
	// Getting default (aka first) available ui for the record type we have
	APP.log("debug","UI_MODEL.getFirstAvailableUIForTable($.TABLE)");
	APP.log("debug",UI_MODEL.getFirstAvailableUIForTable($.TABLE));

	$.UI_CODE = UI_MODEL.getFirstAvailableUIForTable($.TABLE).code;
	APP.log("debug","$.UI_CODE");
	APP.log("debug",$.UI_CODE);
	// Fetching defaulft (aka first) available screen for this UI
	APP.log("debug","UI_MODEL.getFirstAvailableScreenWithContentForUI("+$.TABLE+","+$.UI_CODE+")");
	APP.log("debug","$.SCREEN");
	APP.log("debug",$.SCREEN);
	
	if($.SCREEN == "") {
		APP.log("debug",UI_MODEL.getFirstAvailableScreenWithContentForUI($.TABLE,$.UI_CODE));
		$.uiHandleData(UI_MODEL.getFirstAvailableScreenWithContentForUI($.TABLE,$.UI_CODE));	
	} else {
		//APP.log("debug",UI_MODEL.getContentForScreen($.TABLE,$.UI_CODE,$.SCREEN));
		$.uiHandleData(UI_MODEL.getContentForScreen($.TABLE,$.UI_CODE,$.SCREEN)); 
	}
};

$.uiRetrieveData = function(_force, _callback) {
	APP.openLoading();

	APP.log("debug","edit.retrieveData");
	APP.log("debug","CONFIG.ui_url");
	APP.log("debug",CONFIG.ui_url);
	
	if(COMMONS.isCacheValid(CONFIG.ui_url,CONFIG.ui_url_validity)) {
		APP.log("debug","ca-ui cache is valid");
		$.uiRetrieveCallbackFunctions();
	} else {

		UI_MODEL.fetch({
			url: CONFIG.ui_url,
			authString: APP.authString,
			cache: 0,
			callback: function() {
				$.uiRetrieveCallbackFunctions();

				if(typeof _callback !== "undefined") {
					_callback();
				}
			},
			error: function() {
				APP.closeLoading();
				Ti.API.log("debug","ca-ui.fetch crashed :-(");
				if(typeof _callback !== "undefined") {
					_callback();
				}
			}
		});
	}
	APP.closeLoading();
};

$.uiHandleData = function(_data) {
	
	// If the list of the screens is not initiated, populate it from the model
	if($.SCREENS.length == 0) {
		$.SCREENS = UI_MODEL.getAllScreensForUI($.TABLE,$.UI_CODE);
	}
	
	// Create a label for each screen and add it to $.screenButtonsScrollView
	var labels= [];
	APP.log("debug",$.SCREENS);
	if ($.screenButtonsScrollView.children.length == 0) {
		for(var index in $.SCREENS) {
			var labelMargin = Ti.UI.createView();
			$.addClass(labelMargin,"buttonMargin");
			var label = Ti.UI.createLabel({
			    color: '#000',
			    text: $.SCREENS[index].preferred_labels,
			    textAlign: 'center',
			    code:$.SCREENS[index].code
			});
			$.addClass(label,"button");
			labelMargin.add(label);
			$.screenButtonsScrollView.add(labelMargin);
		}		
	}

	
	APP.log("debug", "edit.uiHandleData");
	//APP.log("debug",_data);
	var rows=[];

	var i = 1;
	
	// error handling if _data has not been rightly fetched back
	if (typeof _data.content != "undefined") {
		// If we have some content back
		var screen_content = _data.content.screen_content;
		for(var bundle in screen_content) {
			var bundle_code = screen_content[bundle].bundle_code;

			if(i<50) {
				// Test if we're in presence of an attribute
				if (bundle_code.substring(0, 13) == "ca_attribute_") {

					// If the bundle described in the screen corresponds to sthg in the model, display it
					var attribute = bundle_code.replace(/^ca_attribute_/,"");

					if (MODEL_MODEL.hasElementInfo("ca_objects", attribute) > 0) {
						APP.log("debug","attribute : "+attribute);
						
						//APP.log("debug", MODEL_MODEL.hasElementInfo("ca_objects", attribute));
						var values = $.RECORD["ca_objects."+attribute];

						var element_data = MODEL_MODEL.getElementInfo("ca_objects", attribute);
						var row = Alloy.createController("edit_metadata_bundle", {
							element:attribute,
							content:element_data,
							values:values
						}).getView();
						rows.push(row);
					}
				}
			}	
			i++;
		};

	}
		
	$.bundles.removeAllChildren();
	$.bundles.setData(rows);
	for(var x=0; x<rows.length; x++) {
		$.bundles.add(rows[x]);
		// Close loading on the last view addition
		if(x==(rows.length - 1)) {
			APP.closeLoading();
		}
	}
};

$.objectRetrieveCallbackFunctions = function() {
	$.RECORD = JSON.parse(OBJECT_DETAILS.getDetails(CONFIG.obj_data.object_id).json);
	$.uiRetrieveData();
	// There's no objectHandleData as the data is handled inside uiHandleDate
};

$.objectRetrieveData = function() {
	Ti.API.log("debug","APP.authString " + APP.authString);

	if(COMMONS.isCacheValid(CONFIG.object_url,CONFIG.object_url_validity)) {
		APP.log("debug","edit : ca-objects-hierarchy cache is valid");
		APP.log("debug","CONFIG.object_url");
		APP.log("debug",CONFIG.object_url);
		$.objectRetrieveCallbackFunctions();
	} else {
		APP.log("debug","edit : ca-objects-hierarchy cache is invalid");
		APP.log("debug","CONFIG.object_url");
		APP.log("debug",CONFIG.object_url);
		OBJECT_DETAILS.fetch({
				url: CONFIG.object_url,
				authString: APP.authString,
				cache: 0,
				callback: function() {
					$.objectRetrieveCallbackFunctions();
					if(typeof _callback !== "undefined") {
						_callback();
					}
				},
				error: function() {
					APP.closeLoading();
					Ti.API.log("debug","OBJECT_DETAILS.fetch crashed :-(");
				}
		});
	};
}

$.objectHandleData = function(_data) {
	APP.log("debug","$.objectHandleData");
	APP.log("debug",_data);
}

$.screenButtonsScrollView.addEventListener("click", function(_event) {
	APP.log("debug",_event.source);
	// Getting screen code from the code parameter inside the label
	$.SCREEN = _event.source.code;
	//$.modelRetrieveData();
	$.uiRetrieveData();
	//_event.source.code => ce qu'on veut
});

$.NavigationBar.showRight({
	image: "/newport/check.png",
	callback: function() {
		alert('Save icon clicked');
	}
});

$.init();
