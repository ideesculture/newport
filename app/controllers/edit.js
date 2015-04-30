/**
 * Controller for the edit screen
 * 
 * @class Controllers.edit
 * @uses core
 */
var APP = require("core");
var UTIL = require("utilities");
var DATE = require("alloy/moment");
var HTTP = require("http");
var COMMONS = require("ca-commons");
var BUFFER = require("ca-editbuffer");

var MODEL_MODEL = require("models/ca-model")();
var UI_MODEL = require("models/ca-ui")();
var OBJECT_DETAILS = require("models/ca-object-details")();
var OBJECT_EDIT = require("models/ca-object-edit")();

var CONFIG = arguments[0];

var FLAG_SAVE = false; 

// Pseudo constants
var ca_main_tables = ["ca_entities", "ca_object_lots", "ca_storage_locations", "ca_places", "ca_collections", "ca_loans", "ca_movements"];			

// Initializes original values and target buffer where modified values will go
//Ti.App.EDIT = {};


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

// Global variable to store default values for an empty bundle
$.EMPTY_BUNDLE = {};

$.init = function() {

	// loading url & cache validity from settings
	CONFIG.validity = APP.Settings.CollectiveAccess.urlForHierarchy.cache;

	// Initiating CA db model class
	MODEL_MODEL.init($.TABLE);
	// Initiating CA available UIs class
	UI_MODEL.init();
	// Initiating detail fetching for object
	
	OBJECT_DETAILS.init($.TABLE);
	// Initiating edit model for object
	OBJECT_EDIT.init($.TABLE, CONFIG.obj_data.object_id);

	// Credentials are inside app.json file
	APP.ca_login=APP.Settings.CollectiveAccess.login;
	APP.ca_password=APP.Settings.CollectiveAccess.password;
	
	$.heading.color = APP.Settings.colors.hsb.primary.b > 70 ? "#000" : APP.Settings.colors.primary;
	
	// Defining global variables for styling
	Alloy.Globals.primaryColor =  APP.Settings.colors.primary;
	Alloy.Globals.secondaryColor = APP.Settings.colors.secondary;
	Alloy.Globals.fieldsColor = APP.Settings.colors.secondary;
	
	$.screenButtonsScrollView.setBackgroundColor(APP.Settings.colors.primary);
	$.NavigationBar.setBackgroundColor(APP.Settings.colors.primary);
		
	APP.authString = 'Basic ' +Titanium.Utils.base64encode(APP.ca_login+':'+APP.ca_password);
	
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

	// Loading URL for base object edition data, replacing ID by the current object_id
	CONFIG.base_edit_url = APP.Settings.CollectiveAccess.urlForObjectEdit.url.replace(/ID/g,CONFIG.obj_data.object_id);
	CONFIG.base_edit_url_validity = APP.Settings.CollectiveAccess.urlForObjectEdit.cache;


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
	if(COMMONS.isCacheValid(CONFIG.model_url,CONFIG.model_url_validity)) {
		APP.log("debug","ca-model cache is valid");
	} else {
		APP.log("debug","ca-model cache is invalid");		
	};

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
				$.updateRightButtonRefresh();
				Ti.API.log("debug","Connexion failed. Please retry.");
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
	var rows=[];
	var totalHeight = 0;
	var i = 0;
};

$.uiRetrieveCallbackFunctions = function() {
	// Getting default (aka first) available ui for the record type we have

	$.UI_CODE = UI_MODEL.getFirstAvailableUIForTable($.TABLE).code;
	// Fetching defaulft (aka first) available screen for this UI
	if($.SCREEN == "") {
		$.uiHandleData(UI_MODEL.getFirstAvailableScreenWithContentForUI($.TABLE,$.UI_CODE));	
	} else {
		$.uiHandleData(UI_MODEL.getContentForScreen($.TABLE,$.UI_CODE,$.SCREEN)); 
	}
};

$.uiRetrieveData = function(_force, _callback) {

	// Initializes original values and target buffer where modified values will go
	/*Ti.App.EDIT = {};
	Ti.App.EDIT.VALUES = {};
	Ti.App.EDIT.BUFFER = {};*/
	
	if(COMMONS.isCacheValid(CONFIG.ui_url,CONFIG.ui_url_validity)) {
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
				$.updateRightButtonRefresh();
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
	}
};

$.uiHandleData = function(_data) {
	//APP.openLoading();
	
	// If the list of the screens is not initiated, populate it from the model
	if($.SCREENS.length == 0) {
		$.SCREENS = UI_MODEL.getAllScreensForUI($.TABLE,$.UI_CODE);
	}
	
	// Create a label for each screen and add it to $.screenButtonsScrollView
	var labels= [];
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

	var rows=[];

	var i = 0;
	
	// error handling if _data has not been rightly fetched back
	if (typeof _data != "undefined") {
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
							// defining values from global var $.RECORD
							//APP.log("debug", "trululu");
							//APP.log("debug", typeof($.RECORD["attributes"]));
							
							
							if( (typeof ($.RECORD["attributes"])) == "undefined"){
								APP.log("debug", "no attributes defined");
								$.RECORD["attributes"] = {} ; 
								$.RECORD["attributes"][attribute] = {};

								//tj problème de "undefined is not an objet" au round suivant! 
								//ça va pas. 
								APP.log("debug", "RECORD[attributes]:");
								APP.log("debug", (typeof $.RECORD["attributes"]));
								APP.log("debug", "RECORD[attributes][attribute]:");
								APP.log("debug", (typeof $.RECORD["attributes"][attribute]));

							}

							//var values = $.RECORD["attributes"][attribute];
							if ((typeof $.RECORD["attributes"][attribute]) == "undefined") {
								// No value defined for this bundle, we need to define default options to agglomerate in edition buffer
								//APP.log("debug", "IF UNDEFINED --------------------------------");
								var values = $.EMPTY_BUNDLE;
							} else {
								var values = $.RECORD["attributes"][attribute]; 
							}

							var element_data = MODEL_MODEL.getElementInfo("ca_objects", attribute);

							var row = Alloy.createController("edit_metadata_bundle", {
								bundle_code:bundle_code,
								content:element_data,
								values:values,
								newport_id:{0:i}
							}).getView();
							rows.push(row);
						}
					} 
				};	
				i++;
			};
		}
	}
		
	$.bundles.removeAllChildren();
	$.bundles.setData(rows);
	for(var x=0; x<rows.length; x++) {
		$.bundles.add(rows[x]);
		// Close loading on the last view addition
		if(x==(rows.length - 1)) {
		}
	}
	APP.closeLoading();


	// Adding button to save the modifications
	$.updateRightButtonSave();
};

$.objectRetrieveCallbackFunctions = function() {
	$.RECORD = JSON.parse(OBJECT_EDIT.getBaseForEdition());
	//APP.log("debug", "GETBASE");
	//APP.log("debug", typeof ($.RECORD["attributes"]));
	$.EMPTY_BUNDLE = OBJECT_EDIT.getBundleValueForEmptyOne();

	$.uiRetrieveData();
	// There's no objectHandleData as the data is handled inside uiHandleDate
};

$.objectRetrieveData = function() {
	// TODO : reintroduce valid cache

	OBJECT_EDIT.fetch({
		url: CONFIG.base_edit_url,
		authString: APP.authString,
		cache: 0,
		callback: function() {
			$.objectRetrieveCallbackFunctions();
			if(typeof _callback !== "undefined") {
				_callback();
			}
		},
		error: function() {
			$.updateRightButtonRefresh();
			var dialog = Ti.UI.createAlertDialog({
					    message: 'Connexion failed. Please retry.',
					    ok: 'OK',
					    title: 'Error'
					  }).show();
		}
	});		
}

$.objectHandleData = function(_data) {
}

$.screenButtonsScrollView.addEventListener("click", function(_event) {
	// Getting screen code from the code parameter inside the label
	APP.openLoading();
	$.SCREEN = _event.source.code;
	//$.modelRetrieveData();

	setTimeout(function() {
				$.uiRetrieveData();
				
		   	},500);
	
	//_event.source.code => ce qu'on veut
});

/*
 * SAVE BUTTON
 */
 save = function () {
 	if ($.hasChanged == true) {
		APP.log("debug","------SAVE-----");

		var itWorked = OBJECT_EDIT.saveChanges();

		if(itWorked) {
			//ici, essayer d'envoyer vers le serveur
			if (Titanium.Network.networkType == Titanium.Network.NETWORK_WIFI )
			{
				$.sendDataToServer();
				/*var dialog = Ti.UI.createAlertDialog({
					title: 'Save',
				    message: 'Your modifications have been saved :)',
				    ok: 'OK'
				});
				dialog.show();*/

			}
			else
			{
				var dialog = Ti.UI.createAlertDialog({
					title: 'No signal',
				    message: 'Your item will be uploaded as soon a wi-fi will be available',
				    ok: 'OK'
				});
				dialog.show();
			}

		} else alert ("echec");

 	}
	else {
		var dialog = Ti.UI.createAlertDialog({
			title: 'Save',
		    message: 'No modification to save',
		    ok: 'OK'
		});
		dialog.show();
	}
 }
$.updateRightButtonSave = function() {	
	if(!FLAG_SAVE){
		FLAG_SAVE =true; 
		$.NavigationBar.showRight({
			image: "/images/check.png",

			callback: function() {		

				var dialog = Ti.UI.createAlertDialog({
				    cancel: 2,
				    buttonNames: ['Save', 'Revert the modifications', 'Cancel'],
				    message: 'Would you like to save your modifications ?',
				    title: 'Save'
				});
				dialog.addEventListener('click', function(e){
					if (e.index === e.source.cancel){
						// Cancel
						Ti.API.info('The cancel button was clicked');
					} else if (e.index == 1) {
						// Revert = reload ui data
						OBJECT_EDIT.cleanEditUpdatesTable(); 
						$.objectRetrieveData();
						
					} else if (e.index == 0) {
						// Save
						save();	
					}
				});
				dialog.show();
			}
		});
	}
}


$.updateRightButtonRefresh = function() {
	$.NavigationBar.showRight({
		image: "/images/refresh.png",
		callback: function() {
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
		}
	});
}

$.sendDataToServer = function() {
	var fieldToSave = {}; 
	var remove_attributes = []; 
	var attributes = {}; 
	var temptab = []; 
	var tempobj = {};
	var json = {}; 
	var row;
	var id ="";
	var attribut = ""; 
	var data = OBJECT_EDIT.getSavedData(); 

	if (data.length>0){
		for(row in data){
			json = {};
			fieldToSave = data[row];

			//saves the id and attribute name, to call them in the handleData function
			id = fieldToSave.object_id;
			attribut = fieldToSave.attribut;

			//builds the object to be sent:
			//1) remove_attributes
			if(fieldToSave.is_modified){
				remove_attributes[0] = fieldToSave.bundle_code;
				json.remove_attributes = remove_attributes;
			}
			//2) attributes
			tempobj ={}; attributes = {}; 
			tempobj["locale"]= "en_US"; 
			tempobj[fieldToSave.attribut]= fieldToSave.valeur; 
			temptab[0]= tempobj; 
			attributes[fieldToSave.bundle_code] = temptab; 
			json.attributes = attributes; 


			//alert(JSON.stringify(json)); 

			/******************************
			SENDS THE REQUEST 
			*************************/
			var ca_url = APP.Settings.CollectiveAccess.urlForObjectSave.url.replace(/ID/g,fieldToSave.object_id);
			
			var error = function() {
				var dialog = Ti.UI.createAlertDialog({
				    message: 'ERROR. Couldn\'t send data to the server',
				    ok: 'OK',
				    title: 'Error'
				  }).show();
			}

			var handleData = function( o1, o2){
				//alert("go erase data: "+ o1 + " , "+ o2);
				OBJECT_EDIT.cleanTempInsertTable(o1, o2);
			}

			var callback = function(){
				var dialog = Ti.UI.createAlertDialog({
				    message: 'whatever that means',
				    ok: 'got it',
				    title: 'CALLBACK'
				  }).show();
			}

			HTTP.request({
				timeout: 2000,
				async:false,
				headers: [{name: 'Authorization', value: APP.authString}],
				type: "PUT",
				format: "JSON",
				data: json,
				url: ca_url,
				passthrough: callback,
				success: handleData(id, attribut),
				failure: error
			});

		}
		var dialog = Ti.UI.createAlertDialog({
			title: 'Save',
		    message: 'Your modifications have been saved :)',
		    ok: 'OK'
		});
		dialog.show();
		//$.label.text = "Data has been sent to the server successfully :)";		
	}
	else
	{
		alert("no data :(");
	//	$.label2.text = "Data export"; 
	//	$.label.text = "There are no modifications to send to the server";
	}
}

Ti.App.addEventListener('event_haschanged', function(e) { 
	
	$.hasChanged = true;
	APP.log("debug", "DEBUG Ti.App.addEventListener");
	//APP.log("debug", e.config);
	var attribute = e.config.bundle_code.replace(/^ca_attribute_/,"");
	APP.log("debug", attribute);
	APP.log("debug", typeof $.RECORD.attributes);
	if (typeof $.RECORD.attributes[attribute] != "undefined") {
	//if (typeof $.RECORD.attributes != "undefined") {	
		APP.log("debug","We have a previous value");
		APP.log("debug","MERGING !");
		var origin_values = $.RECORD.attributes[attribute];
		//APP.log("debug",origin_values);
		var new_values = origin_values;
		new_values[e.config.i].bundle = attribute; 
		new_values[e.config.i][e.config.element] = e.value;
		new_values[e.config.i].is_origin = 0; 
		new_values[e.config.i].is_modified = 1;
		new_values[e.config.i].is_new = 0;
		APP.log("debug",new_values);
		// Inserting into the temp table
		OBJECT_EDIT.insertTempAddition(e.config.element, new_values);
	} else {
		APP.log("debug","No previous value");

		// Inserting into the temp table
		var vals = {is_origin : 0, is_modified : 0, is_new : 1 };
		vals[e.config.element] = e.value;
		vals.bundle = attribute;
		var new_values2 = [];
		new_values2[0]=vals;
		APP.log("debug",new_values2);
		OBJECT_EDIT.insertTempAddition(e.config.element, new_values2);
	}
	
});

$.init();
