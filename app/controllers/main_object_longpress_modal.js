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
var 	myModal = Ti.UI.createWindow({
	    title           : 'My Modal',
	    backgroundColor : 'transparent'
	});

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

	$.open.addEventListener('click',function () {
		APP.addChild("edit", {
			type: "ca_objects",
			obj_data : CONFIG.obj_data,
			isChild: true
		}, false, true);
		CONFIG.container.close();
	});

	$.rename.addEventListener('click', function() {
		APP.log("debug","RENAME");
		// if menu opened, close it
		if(APP.SlideMenuOpen) {
			APP.closeMenu();
		}

		var modal_info = {
			obj_data: CONFIG.obj_data,		
			container: myModal
		}

	    var modal_view = Alloy.createController('main_modal_rename',modal_info);
	    myModal.add(modal_view.getView());
		myModal.open({
	    	animate : true
		});
		CONFIG.container.close();
	});

	$.moveTo.addEventListener('click', function() {
		APP.log("debug","MOVE TO");
		// if menu opened, close it
		if(APP.SlideMenuOpen) {
			APP.closeMenu();
		}

		var modal_info = {
			obj_data: CONFIG.obj_data,		
			container: myModal
		}

	    var modal_view = Alloy.createController('main_modal_moveTo',modal_info);
	    myModal.add(modal_view.getView());
		myModal.open({
	    	animate : true
		});
		CONFIG.container.close();
	});


}

$.init();
