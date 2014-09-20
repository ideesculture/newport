/**
 * Controller for an object block bottom of the screen
 * 
 * @class Controllers.text
 * @uses core
 */
var APP = require("core");
var CONFIG = arguments[0];

APP.log("debug","Adding object block ("+CONFIG.object_id+")");

$.objectName.text = CONFIG.display_label;
