/**
 * Controller for the text screen
 * 
 * @class Controllers.text
 * @uses core
 */
var APP = require("core");
var UTIL = require("utilities");
var DATE = require("alloy/moment");
var BUFFER = require("ca-editbuffer");

var CONFIG = arguments[0];

var value ="";

$.init = function() {
	APP.log("debug","CONFIG.newport_id");
	APP.log("debug",CONFIG.newport_id);

	// Defining value, activating or disabling textarea depending of fieldHeight, must be done before init to be available for Handlers
	if (typeof CONFIG.value == "string") {
			value = CONFIG.value;
	};

	APP.log("debug","edit_metadata_bundle CONFIG.content.settings");
	var SETTINGS = CONFIG.content.settings;
	APP.log("debug",SETTINGS);
	APP.log("debug","grandparent");
	APP.log("debug",CONFIG.grandparent);
	APP.log("debug","element_name");
	APP.log("debug",CONFIG.element_name);

	// Field title
	$.label.text=CONFIG.content.display_label; 

	if(SETTINGS.fieldHeight > 1) {
		// we have a textarea
		$.field.remove($.textfield);
		$.textortextarea = $.textarea;
		// 20 = coefficient between settings height & display height
		$.textarea.height=Math.round(SETTINGS.fieldHeight * 17);
		// 1.6 = coefficient between settings width & display width
		$.textarea.width=Math.round(SETTINGS.fieldWidth * 7.08);
	} else {
		// We have a textfield
		$.field.remove($.textarea);
		$.textortextarea = $.textfield;
	};
	BUFFER.ORIGINAL[CONFIG.newport_id] = value;
	$.textortextarea.value = value;
	$.textortextarea.valuebak = value;

};

$.validate = function () {

};

$.update = function () {

};

/*
 * HANDLERS
 */

var leavingFocus = function(_field) {
	//if (_field.hasChanged == "true") return false;
	if (_field.value != _field.valuebak) {
		_field.backgroundColor = APP.Settings.colors.primary;
		//CONFIG.grandparentTitle.backgroundColor = APP.Settings.colors.primary;
		//CONFIG.grandparent.fireEvent("hasChanged",{});
		CONFIG.grandparent.hasChanged = true;
		APP.log("debug",'event_haschanged');
		APP.log("debug",CONFIG.newport_id);
		Ti.App.fireEvent('event_haschanged', {
    		name: 'bar',
    		reference: CONFIG.newport_id,
    		config: CONFIG,
    		value: _field.value
		});
		_field.backgroundColor = APP.Settings.colors.secondary;
	} else {
		_field.backgroundColor = "white";
		CONFIG.grandparentTitle.backgroundColor = "white";
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