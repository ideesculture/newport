/**
 * Controller for an object block bottom of the screen
 * 
 * @class Controllers.text
 * @uses core
 */
var APP = require("core");
var CONFIG = arguments[0];
var OBJECT_DETAILS = require("models/ca-object-details")();
var COMMONS = require("ca-commons");

// Fixing the table we"re working on, eventually to come through CONFIG after
$.TABLE = "ca_objects";

$.init = function() {
	APP.openLoading();
	APP.log("debug","Adding object block ("+CONFIG.object_id+")");
	$.objectInfo.text = CONFIG.obj_data.idno;
	$.objectName.text = CONFIG.obj_data.display_label;

	// Loading URL for object details, replacing ID by the current object_id
	CONFIG.url = APP.Settings.CollectiveAccess.urlForObjectDetails.url.replace(/ID/g,CONFIG.object_id);
	CONFIG.validity = APP.Settings.CollectiveAccess.urlForObjectDetails.cache;

	OBJECT_DETAILS.init($.TABLE);
	$.retrieveData();
	APP.closeLoading();
}

$.retrieveCallbackFunctions = function() {
	$.handleData(OBJECT_DETAILS.getMainObjectInfo(CONFIG.obj_data.object_id));
}

$.retrieveData = function() {
	Ti.API.log("debug","APP.authString " + APP.authString);

	if(COMMONS.isCacheValid(CONFIG.url,CONFIG.validity)) {
		APP.log("debug","ca-objects-hierarchy cache is valid");
		$.retrieveCallbackFunctions();
	} else {
		OBJECT_DETAILS.fetch({
				url: CONFIG.url,
				authString: APP.authString,
				cache: 0,
				callback: function() {
					$.retrieveCallbackFunctions();
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
	};
}

$.handleData = function(_data) {
	
	if(_data.thumbnail_url) {
		APP.log("debug",_data.thumbnail_url);
		var file=COMMONS.getRemoteFile(_data.thumbnail_url);
		APP.log("debug",file);
		$.cellimage.image = file;
	}
	$.objectInfo.text = _data.idno;
}

$.cellimage.addEventListener('click',function(e) {
	APP.log("debug","$.cellimage.addEventListener");
	var modal_info = {
		obj_data: CONFIG.obj_data,		
		container: CONFIG.modal		
	}
    var modal_view = Alloy.createController('main_modal_details',modal_info);
    CONFIG.modal.add(modal_view.getView());
	CONFIG.modal.open({
    	animate : true
	});
});

$.init();
