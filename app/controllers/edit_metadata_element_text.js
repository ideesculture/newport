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

$.init = function() {
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
	};

	if(SETTINGS.fieldHeight > 1) {
		// we have a textarea
		$.field.remove($.textfield);
		$.textortextarea = $.textarea;
		$.textarea.value = value;
		$.textarea.valuebak = value;
		APP.log("debug",$.textarea); 
		// 20 = coefficient between settings height & display height
		$.textarea.height=Math.round(SETTINGS.fieldHeight * 17);
		// 1.6 = coefficient between settings width & display width
		$.textarea.width=Math.round(SETTINGS.fieldWidth * 7.08);
	} else {
		$.textortextarea = $.textfield;
		// We have a textfield
		$.field.remove($.textarea);
		$.textfield.value = value;
	};
};

$.validate = function () {

};

$.update = function () {

};

/*
 * HANDLERS
 */

var leavingFocus = function(_field) {
	if (_field.value != _field.valuebak) {
		_field.backgroundColor = APP.Settings.colors.primary;
	} else {
		_field.backgroundColor = "white";
	}

};

$.textfield.addEventListener('blur', function() {
	// leaving focus from area
	leavingFocus($.textfield);
});
$.textarea.addEventListener('blur', function() {
	// leaving focus from area
	leavingFocus($.textarea);
});


$.init();