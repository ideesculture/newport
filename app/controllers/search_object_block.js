/**
 * Controller for an object block 
 * 
 * @uses core
 */
var APP = require("core");
var CONFIG = arguments[0];


// Fixing the table we"re working on, eventually to come through CONFIG after
$.TABLE = "ca_objects";

$.init = function() {
	APP.log("debug", "block result");
	APP.log("debug",CONFIG.label );
	//APP.log("debug","Adding object block ("+CONFIG.obj_data.object_id+")");
	//$.objectInfo.text = CONFIG.obj_data.idno;
	$.objectName.text = CONFIG.label;
}

$.init();