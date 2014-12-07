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

APP.log("debug","edit_metadata_bundle CONFIG.content.settings");
var SETTINGS = CONFIG.content.settings;
APP.log("debug",SETTINGS);

// Field title
$.label.text=CONFIG.content.display_label; 

// Defining value, activating or disabling textarea depending of fieldHeight
if (typeof CONFIG.value == "string") {
	var value = CONFIG.value;
} else {
	var value ="";
}

if(SETTINGS.fieldHeight > 1) {
	// we have a textarea
	$.field.remove($.textfield);
	$.textarea.value = value;
	$.textarea.valuebak = value;
	APP.log("debug",$.textarea); 
	// 20 = coefficient between settings height & display height
	$.textarea.height=Math.round(SETTINGS.fieldHeight * 17);
	// 1.6 = coefficient between settings width & display width
	$.textarea.width=Math.round(SETTINGS.fieldWidth * 7.28);

	$.textarea.addEventListener('focus', function() {
		alert("focus");
	});
	$.textarea.addEventListener('blur', function() {
		// leaving focus from area
		if ($.textarea.value != $.textarea.valuebak) {
			alert("modifications detected");
		} else {
			alert("no modification");
		}
	});
} else {
	// We have a textfield
	$.field.remove($.textarea);
	$.textfield.value = value;
	$.textfield.addEventListener('focus', function() {
		alert("focus");
	});
	$.textfield.addEventListener('blur', function() {
		alert("blur");
	});
}
