/**
 * Controller for the idno bundle
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
	$.bundleItemName.text = CONFIG.display_label;

	$.bundleItemElements.height = 1;
	$.bundleItemElements.visible = false;

	// Defining value, activating or disabling textarea depending of fieldHeight, must be done before init to be available for Handlers
	if (typeof CONFIG.values == "string") {
			value = CONFIG.values;
	};

	APP.log("debug","edit_metadata_bundle CONFIG.content.settings");
	var SETTINGS = CONFIG.content.settings;

	// Field title
	$.bundleItemName.text="IDNO";

	$.textfield.value = value;
	$.textfield.valuebak = value;
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

$.textfield.addEventListener('blur', function() {
	// leaving focus from area
	leavingFocus($.textfield);
});

// Folding bundle
$.bundleItem.addEventListener("click", function(_event) {
	APP.openLoading();
	setTimeout(function() {
		if ($.bundleItemElements.visible == true) {
			$.bundleItemElements.visible = false;
			$.bundleItemElements.height = 1;
			$.arrowIcon.image = "/icons/black/ca_arrow_down.png";
		} else {
			$.bundleItemElements.visible = true;
			$.bundleItemElements.height = Ti.UI.SIZE;
			$.arrowIcon.image = "/icons/black/ca_arrow_up.png";
		}
	},300);
	APP.closeLoading();

});


$.init();
