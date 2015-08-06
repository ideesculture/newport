/**
 * Controller for currency metadata
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

	// Debug : uncomment next line
	//$.label.text=CONFIG.content.display_label+" "+CONFIG.i+" "+CONFIG.j;
	$.label.hide();
	$.notes.text= " please don't forget to specify a currency unit after your value!"
	$.currencyfield.value = value;
	$.currencyfield.valuebak = value;
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
		_field.backgroundColor = APP.Settings.colors.primary;
		Ti.App.fireEvent('event_haschanged', {
    		name: 'bar',
    		config: CONFIG,
    		value: _field.value
		});
		APP.log("debug", "value has changed");
		//_field.backgroundColor = APP.Settings.colors.secondary;
	} else {
		APP.log("debug", "new background color: whitey");
		_field.backgroundColor = "white";
	}

};

$.currencyfield.addEventListener('blur', function() {
	// leaving focus from area
	leavingFocus($.currencyfield);
});

$.init();
