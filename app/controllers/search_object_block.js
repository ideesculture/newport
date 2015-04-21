/**
 * Controller for an object block 
 * 
 * @uses core
 */
var APP = require("core");
var CONFIG = arguments[0];
//var OBJECT_DETAILS = require("models/ca-object-details")();


// Fixing the table we"re working on, eventually to come through CONFIG after
$.TABLE = "ca_objects";

$.init = function() {
	//APP.log("debug", "block result");
	//APP.log("debug",CONFIG.label );

	//OBJECT_DETAILS.init($.TABLE);
	//APP.log("debug","Adding object block ("+CONFIG.obj_data.object_id+")");
	//$.objectInfo.text = CONFIG.obj_data.idno;
	$.objectName.text = CONFIG.display_label;

	$.cell.addEventListener('click',function () {
		APP.addChild("edit", {
			type: "ca_objects",
			obj_data : CONFIG,
			isChild: true
		}, false, false);
	});

}

$.init();