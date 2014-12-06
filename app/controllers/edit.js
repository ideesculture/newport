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

$.init = function() {
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
	CONFIG.url = APP.Settings.CollectiveAccess.urlForModel;
	$.modelRetrieveData();

	// Loading CA screens & uis & filling cache
	CONFIG.ui_url = APP.Settings.CollectiveAccess.urlForUis;
	$.uiRetrieveData();

	// Loading object details
	$.objectRetrieveData();
	
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
			//APP.openSettings();
		});
	}
	
	$.NavigationBar.text = "Archivio Teatro Regio";

	$.objectRetrieveData();
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
			$.UI_CODE = UI_MODEL.getFirstAvailableUIForTable($.TABLE).code;
			APP.log("debug",$.UI_CODE);
			// Fetching defaulft (aka first) available screen for this UI
			APP.log("debug","UI_MODEL.getFirstAvailableScreenWithContentForUI("+$.TABLE+","+$.UI_CODE+")");

			if($.SCREEN == "") {
				APP.log("debug",UI_MODEL.getFirstAvailableScreenWithContentForUI($.TABLE,$.UI_CODE));
				$.uiHandleData(UI_MODEL.getFirstAvailableScreenWithContentForUI($.TABLE,$.UI_CODE));	
			} else {
				//APP.log("debug",UI_MODEL.getContentForScreen($.TABLE,$.UI_CODE,$.SCREEN));
				$.uiHandleData(UI_MODEL.getContentForScreen($.TABLE,$.UI_CODE,$.SCREEN)); 
			}

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

$.objectRetrieveData = function() {
	Ti.API.log("debug","APP.authString " + APP.authString);

	OBJECT_DETAILS.fetch({
			url: CONFIG.url,
			authString: APP.authString,
			cache: 0,
			callback: function() {
				$.objectHandleData(OBJECT_DETAILS.getMainObjectInfo(CONFIG.obj_data.object_id));
				if(typeof _callback !== "undefined") {
					_callback();
				}
			},
			error: function() {
				APP.closeLoading();
				/*var dialog = Ti.UI.createAlertDialog({
				    message: 'Connexion failed. Please retry.',
				    ok: 'OK',
				    title: 'Error'
				  }).show();
				if(typeof _callback !== "undefined") {
					_callback();
				}*/
				Ti.API.log("debug","OBJECT_DETAILS.fetch crashed :-(");
			}
	});
}

$.objectHandleData = function(_data) {
	
	if(_data.thumbnail_url) {
		APP.log("debug",_data.thumbnail_url);
		var file=COMMONS.getRemoteFile(_data.thumbnail_url);
		APP.log("debug",file);
		$.cellimage.image = file;
	}
	$.objectInfo.text = _data.idno;
}

$.screenButtonsScrollView.addEventListener("click", function(_event) {
	APP.log("debug",_event.source);
	// Getting screen code from the code parameter inside the label
	//APP.openLoading();
	$.SCREEN = _event.source.code;
	 $.uiRetrieveData();
	//_event.source.code => ce qu'on veut
});


$.init();
