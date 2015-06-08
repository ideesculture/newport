/**
 * Controller for DateRange metadata
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
	// Defining value, activating or disabling textarea depending of fieldHeight, must be done before init to be available for Handlers
	if (typeof CONFIG.value == "string") {
			value = CONFIG.value;
	};

	// Field title
	$.label.text=CONFIG.content.display_label+" "+CONFIG.i+" "+CONFIG.j; 
	$.notes.text= " please don't forget to specify a length unit after your value!"
	$.lengthfield.value = value;

};

$.validate = function () {
	//TODO

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
		Ti.App.fireEvent('event_haschanged', {
    		name: 'bar',
    		config: CONFIG,
    		value: _field.value
		});
		//_field.valuebak = _field.value;
		_field.backgroundColor = APP.Settings.colors.secondary;
	} else {
		_field.backgroundColor = "white";
	}

};

$.lengthfield.addEventListener('blur', function() {
	// leaving focus from area
	leavingFocus($.lengthfield);
});

$.init();


