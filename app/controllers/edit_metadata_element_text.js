/**
 * Controller for the text screen
 * 
 * @class Controllers.text
 * @uses core
 */
var APP = require("core");
var UTIL = require("utilities");
var DATE = require("alloy/moment");

var CONFIG = arguments[0];
APP.log("debug",CONFIG);

$.label.text=CONFIG.content.display_label; 
$.textfield.value="ici";

// Check if we have settings defined
if(CONFIG.content.settings) {
	// Check if we have width defined
	if(CONFIG.content.settings.fieldWidth) {
		$.textfield.width=CONFIG.content.settings.fieldWidth * 4;		
	}
}

