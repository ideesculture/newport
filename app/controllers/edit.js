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
var LIST_MODEL = require("models/ca-lists")();

var CONFIG = arguments[0];

var FLAG_SAVE = false;

// Pseudo constants
var ca_main_tables = ["ca_entities", "ca_object_lots", "ca_storage_locations", "ca_places", "ca_collections", "ca_loans", "ca_movements"];

// If no object informations, load a default testing object
Ti.API.log("debug","(typeof CONFIG.obj_data.info1)");
Ti.API.log("debug",(typeof CONFIG.obj_data));
if ((typeof CONFIG.obj_data) === "undefined") {
	CONFIG.obj_data = {};
	CONFIG.obj_data.info1 = 195;
	CONFIG.obj_data.object_id = 5871;
	CONFIG.obj_data.display_label= "banana";
	CONFIG.obj_data.idno="newoakk";
	// 5866

}
//type id
var type_id = CONFIG.obj_data.info1;

// Filling black inspector text with label & idno
$.heading.text = CONFIG.obj_data.display_label+"\n"+CONFIG.obj_data.idno;

// Temporary fixing the table we"re editing, need to come through CONFIG after
//$.TABLE = CONFIG.type;
$.TABLE = "ca_objects";
// List of all screens
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
	// Initiating CA lists model class
	LIST_MODEL.init();
	// Initiating detail fetching for object
	OBJECT_DETAILS.init($.TABLE);
	// Initiating edit model for object
	OBJECT_EDIT.init($.TABLE, CONFIG.obj_data.object_id);

	// Credentials are inside app.json file
	APP.ca_login=APP.Settings.CollectiveAccess.login;
	APP.ca_password=APP.Settings.CollectiveAccess.password;

	// Defining global variables for styling
	Alloy.Globals.primaryColor =  APP.Settings.colors.primary;
	Alloy.Globals.secondaryColor = APP.Settings.colors.secondary;
	Alloy.Globals.fieldsColor = APP.Settings.colors.secondary;

	$.screenButtonsScrollView.setBackgroundColor(APP.Settings.colors.primary);
	$.NavigationBar.setBackgroundColor(APP.Settings.colors.primary);

	APP.authString = 'Basic ' +Titanium.Utils.base64encode(APP.ca_login+':'+APP.ca_password);

	// Loading CA database model (metadatas & fields) & filling cache
	CONFIG.model_url = APP.Settings.CollectiveAccess.urlBase+"/"+APP.Settings.CollectiveAccess.urlForModel.url;
	CONFIG.model_url_validity = APP.Settings.CollectiveAccess.urlForModel.cache;
	//$.modelRetrieveData();

	// Loading CA screens & uis & filling cache
	CONFIG.ui_url = APP.Settings.CollectiveAccess.urlForUis.url;
	CONFIG.ui_url_validity = APP.Settings.CollectiveAccess.urlForUis.cache;
	// Loading object details
	// Loading URL for object details, replacing ID by the current object_id
	CONFIG.object_url = APP.Settings.CollectiveAccess.urlBase+"/"+APP.Settings.CollectiveAccess.urlForObjectDetails.url.replace(/ID/g,CONFIG.obj_data.object_id);
	CONFIG.object_url_validity = APP.Settings.CollectiveAccess.urlForObjectDetails.cache;

	// Loading URL for base object edition data, replacing ID by the current object_id
	CONFIG.base_edit_url = APP.Settings.CollectiveAccess.urlBase+"/"+APP.Settings.CollectiveAccess.urlForObjectEdit.url.replace(/ID/g,CONFIG.obj_data.object_id);
	CONFIG.base_edit_url_validity = APP.Settings.CollectiveAccess.urlForObjectEdit.cache;

	$.retrieveData();


	// uiRetrieveData is called from objectRetrieveCallbackFunctions : we need to have the values available before displaying bundles

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

	//$.NavigationBar.text = "Archivio Teatro Regio";
	APP.log("debug","$.NavigationBar.text");
	APP.log("debug",$.NavigationBar.text);
	$.NavigationBar.setTitle("Editing "+CONFIG.obj_data.display_label+" ("+CONFIG.obj_data.idno+")");
	//APP.log("debug",$.NavigationBar.text);


};

$.retrieveData = function(_force, _callback){
	$.modelRetrieveData(_force, _callback);
}

$.modelRetrieveCallbackFunctions = function () {

	$.modelHandleData(MODEL_MODEL.getElementsByTypeId(type_id));
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

		// Initializing lists model
		var model_lists_url = APP.Settings.CollectiveAccess.urlBase+"/"+APP.Settings.CollectiveAccess.urlForLists.url;
		var model_lists_cache_validity = APP.Settings.CollectiveAccess.urlForLists.cache;
		/*if(COMMONS.isCacheValid(model_lists_url,model_lists_cache_validity)) {
			APP.log("debug", "cache valid for item lists model");
		} else {*/
			APP.log("debug", "Item lists model fetch");
			LIST_MODEL.fetch({
				url: model_lists_url,
				authString: APP.authString,
				cache: 0,
				callback: function() {
					Ti.API.log("debug","ca-lists.fetch callback");
				},
				error: function() {
					Ti.API.log("debug","ca-lists.fetch error");
				}
			});
		//}

};

/**
 * Handles the data returned by the model
 * @param {Object} _data The returned data

$.modelHandleData = function(_data) {
	var rows=[];
	var totalHeight = 0;
	var i = 0;

}; */
$.modelHandleData = function(_data) {
	//APP.log("debug", "modelHandleData data");
	//APP.log("debug", _data);
	CONFIG.elements= _data;
	//alert(CONFIG.elements);
	//APP.log("debug", CONFIG.elements);
	$.objectRetrieveData();
};

$.uiRetrieveCallbackFunctions = function() {
	// Getting default (aka first) available ui for the record type we have
	//alert($.SCREEN);
	APP.log("debug", "uiRetrieveCallbackFunctions");
	$.UI_CODE = UI_MODEL.getFirstAvailableUIForTable($.TABLE).code;
	APP.log("debug", $.UI_CODE);

	// If the list of the screens is not initiated, populate it from the model
	$.SCREENS = UI_MODEL.getAllScreensWithContentForUI($.TABLE,$.UI_CODE);
	if ($.screenButtonsScrollView.children.length == 0) {
		$.initializeScreenButtons();
		$.SCREEN = $.getFirstScreenCode();
		$.activateScreen($.getFirstScreenCode());
	} else {
		$.uiHandleData(UI_MODEL.getContentForScreen($.TABLE,$.UI_CODE,$.SCREEN));
	}
};

$.getFirstScreenCode = function() {
	return $.screenButtonsScrollView.children[0].children[0].code;
}

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

$.initializeScreenButtons = function() {
	for(var index in $.SCREENS) {
		if(typeof ($.SCREENS[index].content!= "undefined")) {
			if ((typeof $.SCREENS[index].content.typeRestrictions) != "undefined") {
				var type_restrictions = $.SCREENS[index].content.typeRestrictions;
				if(type_restrictions[type_id]!= null){
					//alert(type_restrictions[type_id]);
					var labelMargin = Ti.UI.createView();
					$.addClass(labelMargin,"buttonMargin");
					// mark first screen as valid
					if(index == 0) {
						labelMargin.setBackgroundColor(Alloy.Globals.primaryColor);
					}
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
			} else {
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
	}
}

$.uiHandleData = function(_data) {
	//APP.openLoading();

	// Create a label for each screen allowed for the object type and add it to $.screenButtonsScrollView
	var labels= [];
	var rows=[];

	var i = 0;

	// error handling if _data has not been rightly fetched back
	if (typeof _data != "undefined") {
		APP.log("debug", "UI HANDLE DATA");
		if (typeof _data.content != "undefined") {
			//APP.log("debug", "not undefined!");
			APP.log("debug", "$.RECORD intrinsic fields :");
			APP.log("debug", $.RECORD.intrinsic_fields);
			APP.log("debug", "$.RECORD.attributes: (looking for VALUES)");
			APP.log("debug", $.RECORD.attributes);
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

							if(typeof Array.isArray(CONFIG.elements)){
								if(CONFIG.elements.indexOf(attribute)== -1){
									APP.log("debug", "this attribute is undefined for the object's type.");
								}
								else {
									APP.log("debug", CONFIG.elements[CONFIG.elements.indexOf(attribute)]);
									APP.log("debug", "attribute found in config.elements");
									var values = $.EMPTY_BUNDLE;
									if($.RECORD.attributes){
										APP.log("debug", "$.RECORD.attributes OK")
										if($.RECORD.attributes[attribute]){
												APP.log("debug", "attribute found in $.RECORD");
												APP.log("debug",$.RECORD.attributes[attribute] );
												values = $.RECORD.attributes[attribute];

										}
									}
									APP.log("debug", values);

									var element_data = MODEL_MODEL.getElementInfo("ca_objects", attribute);
									//alert(element_data);

									var row = Alloy.createController("edit_metadata_bundle", {
										bundle_code:bundle_code,
										content:element_data,
										values:values,
										newport_id:{0:i}
									}).getView();
									rows.push(row);
								}
							}
							else
							{
								APP.log("debug", "CONFIG.elements is not an array !");
							}
						}
					} else {
						switch(bundle_code){
							case "ca_object_representations":
								var obj_data = {};
								obj_data.bundle_code = bundle_code ;

								if(CONFIG.obj_data.image_file){
									obj_data.image_file = CONFIG.obj_data.image_file ;
								}
								var row = Alloy.createController("edit_media_photo", obj_data ).getView();
								rows.push(row);
								break;

							case "ca_entities":
								var values = $.EMPTY_BUNDLE;
								var temp_objet = {};
								temp_objet["datatype"] = "Entities";
								temp_objet["display_label"] = "related entity";
								temp_objet["element_code"] = bundle_code ;
								var temp_objet2 = {};
								temp_objet2[bundle_code] = temp_objet;
								var element_data = { "elements_in_set" : temp_objet2 , "name" : "related entities" };

								var row = Alloy.createController("edit_metadata_bundle", {
									bundle_code:bundle_code,
									content:element_data,
									values:values,
									newport_id:{0:i}
								}).getView();
								rows.push(row);
								break;

							case "ca_objects":
								var values = $.EMPTY_BUNDLE;
								var temp_objet = {};
								temp_objet["datatype"] = "Objects";
								temp_objet["display_label"] = "related object";
								temp_objet["element_code"] = bundle_code ;
								var temp_objet2 = {};
								temp_objet2[bundle_code] = temp_objet;
								var element_data = { "elements_in_set" : temp_objet2 , "name" : "related objects" };

								var row = Alloy.createController("edit_metadata_bundle", {
									bundle_code:bundle_code,
									content:element_data,
									values:values,
									newport_id:{0:i}
								}).getView();
								rows.push(row);
								break;

							case "ca_occurrences":
								var values = $.EMPTY_BUNDLE;
								var temp_objet = {};
								temp_objet["datatype"] = "Occurrences";
								temp_objet["display_label"] = "related occurrence";
								temp_objet["element_code"] = bundle_code ;
								var temp_objet2 = {};
								temp_objet2[bundle_code] = temp_objet;
								var element_data = { "elements_in_set" : temp_objet2 , "name" : "related occurrences" };

								var row = Alloy.createController("edit_metadata_bundle", {
									bundle_code:bundle_code,
									content:element_data,
									values:values,
									newport_id:{0:i}
								}).getView();
								rows.push(row);
								break;


							case "ca_storage_locations":
								var values = $.EMPTY_BUNDLE;
								var temp_objet = {};
								temp_objet["datatype"] = "StorageLocations";
								temp_objet["display_label"] = "related storage location";
								temp_objet["element_code"] = bundle_code ;
								var temp_objet2 = {};
								temp_objet2[bundle_code] = temp_objet;
								var element_data = { "elements_in_set" : temp_objet2 , "name" : "related storage locations" };

								var row = Alloy.createController("edit_metadata_bundle", {
									bundle_code:bundle_code,
									content:element_data,
									values:values,
									newport_id:{0:i}
								}).getView();
								rows.push(row);
								break;

							case "preferred_labels":
								if($.RECORD.preferred_labels){
									var values = $.RECORD.preferred_labels[0].name; // bof eh. should take ALL values.
								}
								else{
									var values = $.EMPTY_BUNDLE;
								}

								var temp_objet = {};
								temp_objet["datatype"] = "Preferred_labels";
								temp_objet["display_label"] = "Preferred label";
								temp_objet["element_code"] = bundle_code ;
								var temp_objet2 = {};
								temp_objet2[bundle_code] = temp_objet;
								var element_data = { "elements_in_set" : temp_objet2 , "name" : "Preferred labels" };

								var row = Alloy.createController("edit_metadata_bundle", {
									bundle_code:bundle_code,
									content:element_data,
									values:values,
									newport_id:{0:i}
								}).getView();
								rows.push(row);
								break;

							case "hierarchy_location":
								var values = $.EMPTY_BUNDLE;
								if($.RECORD[bundle_code]){
									APP.log($.RECORD[bundle_code]);
								}
								Ti.API.log("debug","hierarchy location");

								var row = Alloy.createController("edit_hierarchy_location", {
									bundle_code:bundle_code,
									display_label: "Hierarchy location",
									obj_data: CONFIG.obj_data,
								}).getView();
								rows.push(row);
								break;

							case "access":
								var values = $.RECORD.intrinsic_fields.access;
								Ti.API.log("debug","access");
								Ti.API.log("debug",$.RECORD);
								var row = Alloy.createController("edit_access_bundle", {
									bundle_code:bundle_code,
									display_label: "Access control",
									content:{},
									values:values
								}).getView();
								rows.push(row);
							break;

							case "status":
								var values = $.RECORD.intrinsic_fields.status;
								Ti.API.log("debug","status");
								Ti.API.log("debug",$.RECORD);
								var row = Alloy.createController("edit_status_bundle", {
									bundle_code:bundle_code,
									display_label: "Workflow status",
									content:{},
									values:values
								}).getView();
								rows.push(row);
								break;

							case "idno":
								var values = $.RECORD.intrinsic_fields.idno;
								Ti.API.log("debug","status");
								Ti.API.log("debug",$.RECORD);
								var row = Alloy.createController("edit_idno_bundle", {
									bundle_code:bundle_code,
									display_label: "Identification number",
									content:{},
									values:values
								}).getView();
								rows.push(row);
								break;

							default:
								var values = $.EMPTY_BUNDLE;
								var temp_objet = {};
								var row = Alloy.createController("edit_unsupported_bundle", {
									bundle_code:bundle_code,
									content:{},
									values:values,
									newport_id:{0:i}
								}).getView();
								rows.push(row);
								break;
						}//END SWITCH
					}//END ELSE (if bundle_code.substring= attribute, else switch)
				};//END IF i<50
				i++;
			};//END For bundles in screen content
		}//END if typeof data != undefined
		else {
			APP.log("debug", "typeof _data.content = undefined");
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

$.activateScreen = function(code) {
	APP.openLoading();
	if ($.screenButtonsScrollView.children.length > 0) {
		for(var child in $.screenButtonsScrollView.children) {
			if ($.screenButtonsScrollView.children[child].children[0].code == code) {
				// If grand-children code in screenButtonsScrollView == designated code, change background...
				$.screenButtonsScrollView.children[child].setBackgroundColor(Alloy.Globals.primaryColor);
			} else {
				// ... else back to default bg color
				$.screenButtonsScrollView.children[child].setBackgroundColor(Alloy.Globals.secondaryColor);
			}
		}
	}
	$.SCREEN = code;
	setTimeout(function() {
		$.uiRetrieveData();
	},500);
}

/*
 * SAVE BUTTON
 */
$.save = function () {
 	if ($.hasChanged == true) {
		APP.log("debug","------SAVE-----");

		//moves the modifications to _edit_temp_insert table
		var itWorked = OBJECT_EDIT.saveChanges();

		if(itWorked) {
			//sends the modifs to server and erases them from _edit_temp_insert table
			if (Titanium.Network.networkType == Titanium.Network.NETWORK_WIFI )
			{
				OBJECT_EDIT.sendDataToServer();

			}
			//or keeps the data in the local table
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
						$.save();
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

/*
 * LISTENERS
 */

$.screenButtonsScrollView.addEventListener("click", function(_event) {
	// Getting screen code from the code parameter inside the label, checking if there to avoid acting on a margin view click
	if(typeof (_event.source.code)!= "undefined") {
		APP.log("debug", "screenButtonsScrollView");
		$.activateScreen(_event.source.code)
	}
});

//UPDATES STORAGE FUNCTION
//when the content of a field has changed, the new content is stored id _edit_updates
Ti.App.addEventListener('event_haschanged', function(e) {
	$.hasChanged = true;
	APP.log("debug", "DEBUG Ti.App.addEventListener");
	//APP.log("debug", e.config);
	var attribute = e.config.bundle_code.replace(/^ca_attribute_/,"");

	if (typeof $.RECORD.attributes[attribute] != "undefined") {
	//if (typeof $.RECORD.attributes != "undefined") {
		APP.log("debug","We have a previous value");
	//	APP.log("debug","MERGING !");
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

		//APP.log("debug",e);
		// Inserting into the temp table
		var vals = {is_origin : 0, is_modified : 0, is_new : 1 };
		APP.log("debug", e.config.element);

		APP.log("debug", e.config.element);
		vals[e.config.element] = e.value;
		vals.bundle = attribute;
		//"related" entities/occus/places/... need a type id
		if(e.config.content){
			//APP.log("debug", "e.config.content");

			if(e.config.content.type_id){
				//APP.log("debug", "e.config.type_id!");
				vals.type_id = e.config.content.type_id;
			}
		}
		var new_values2 = [];
		new_values2[0]=vals;
		APP.log("debug",new_values2);
		OBJECT_EDIT.insertTempAddition(e.config.element, new_values2);
	}

});

$.init();
