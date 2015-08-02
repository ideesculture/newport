var APP = require("core");
var CONFIG = arguments[0] || {};
var VALUES = CONFIG.values || {};

$.init = function() {
	Ti.API.log("debug","edit_unsupported_bundle CONFIG");
	Ti.API.log("debug",CONFIG);
	$.bundleItemName.text = CONFIG.bundle_code;
	//APP.log("debug", CONFIG.content.elements_in_set);

	$.bundleItemElements.height = 1;
	$.bundleItemElements.visible = false;

};

/*
 *  Handlers
 */

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
