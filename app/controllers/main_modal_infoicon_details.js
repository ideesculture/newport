/**
 * Controller for the details modal view shown when the InfoIcon is clicked
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

	/*var backgroundView = Ti.UI.createView({  // Also full screen
	    backgroundColor : '#000',
	    opacity         : 0.5,
	    top: 47
	});*/

//APP.log("debug","main_modal_infoicon_details CONFIG");
//APP.log("debug",CONFIG);
$.init = function() {


	// Loading URL for object details, replacing ID by the current object_id
	CONFIG.url = APP.Settings.CollectiveAccess.urlBase+"/"+APP.Settings.CollectiveAccess.urlForObjectDetails.url.replace(/ID/g,CONFIG.obj_data.object_id);
	CONFIG.validity = APP.Settings.CollectiveAccess.urlForObjectDetails.cache;
	OBJECT_DETAILS.init($.TABLE);

	// Fetching details in order to update "Some info about the item" and "Even some more info"
	//APP.log("debug",OBJECT_DETAILS.getDetails(CONFIG.obj_data.object_id));

	if(OS_IOS && APP.Device.versionMajor >= 7) {
		Ti.API.log("debug","IOS 7 ou +");
		$.backgroundView.setTop('67');
	}

	//$.topcontainerView.setTop($.backgroundView.top);
	$.topcontainerView.setHeight(maxheight / 6);

	$.label1.font={ fontSize:34 };
	$.label1.text="Objet : "+CONFIG.obj_data.idno;
	$.textArea.value=CONFIG.obj_data.display_label;
	APP.log("debug", "MAIN MODAL INFOICON DETAILS OBJECT INFO:::");
	APP.log("debug", CONFIG.obj_data);

	$.textArea.font={fontSize:20};
	$.closeButton.font= { fontSize:24, fontFamily:"GillSans" };
	$.label2.font={ fontSize:20, fontFamily:"Avenir-MediumOblique" };
	//$.label2.text=CONFIG.obj_data.info2;
	$.label2.text= "";
	$.label3.text=CONFIG.obj_data.info2;
	$.label3.font=$.label2.font
	$.editButton.setBackgroundColor(APP.Settings.colors.primary);
	//$.wrapperView.add(backgroundView);
	//$.insideView.add(imagecontainerView);

	$.closeButton.addEventListener('click', function () {
		    CONFIG.container.close();
		    /*CONFIG.container.remove(CONFIG.container.wrapperView);*/
	});

	$.editButton.addEventListener('click',function () {
		APP.addChild("edit", {
			type: "ca_objects",
			obj_data : CONFIG.obj_data,
			isChild: true
		}, false, true);
		CONFIG.container.close();
	});

}

$.init();
