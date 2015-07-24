/**
 * Controller for the options modal view (long press on folder)
 * 
 * @class Controllers.text
 * @uses core
 */

var APP = require("core");
var COMMONS = require("ca-commons");
var CONFIG = arguments[0];
var OBJECT_DETAILS = require("models/ca-object-details")();
var maxwidth = Ti.Platform.displayCaps.platformWidth;
var maxheight = Ti.Platform.displayCaps.platformHeight;

$.init = function() {


	// Loading URL for object details, replacing ID by the current object_id
	CONFIG.url = APP.Settings.CollectiveAccess.urlForObjectDetails.url.replace(/ID/g,CONFIG.obj_data.object_id);
	CONFIG.validity = APP.Settings.CollectiveAccess.urlForObjectDetails.cache;
	//OBJECT_DETAILS.init($.TABLE);

	// Fetching details in order to update "Some info about the item" and "Even some more info"
	//APP.log("debug",OBJECT_DETAILS.getDetails(CONFIG.obj_data.object_id));	

	if(OS_IOS && APP.Device.versionMajor >= 7) {
		Ti.API.log("debug","IOS 7 ou +");
		$.backgroundView.setTop('67');
	}


	$.someLabel.text="Objet : "+CONFIG.obj_data.display_label;

	$.backgroundView.addEventListener('click', function () {
		    CONFIG.container.close();
	});


}

$.init();