/**
 * Controller for an object block bottom of the screen
 * 
 * @class Controllers.text
 * @uses core
 */
var APP = require("core");
var CONFIG = arguments[0];
var OBJECT_DETAILS = require("models/ca-object-details")();

// Fixing the table we"re working on, eventually to come through CONFIG after
$.TABLE = "ca_objects";

$.init = function() {
	APP.log("debug","Adding object block ("+CONFIG.object_id+")");
	$.objectName.text = CONFIG.display_label;

	// Loading URL for object details, replacing ID by the current object_id
	CONFIG.url = APP.Settings.CollectiveAccess.urlForObjectDetails.url.replace(/ID/g,CONFIG.object_id);
	CONFIG.validity = APP.Settings.CollectiveAccess.urlForObjectDetails.cache;

	OBJECT_DETAILS.init($.TABLE);
	$.retrieveData();
}

$.retrieveData = function() {
	OBJECT_DETAILS.fetch({
			url: CONFIG.url,
			authString: APP.authString,
			cache: 0,
			callback: function() {
				$.handleData(OBJECT_DETAILS.getMainObjectInfo(CONFIG.id));
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
}

$.handleData = function(_data) {
}

$.init();
