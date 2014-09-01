var APP = require("core");
var CONFIG = arguments[0] || {};
APP.log("debug",CONFIG);

$.bundleItemName.text = CONFIG.content.name;	

$.bundleItem.addEventListener("click", function(_event) {
		
	var parent = _event.source.getParent();
	APP.log("debug", _event.parent);

	var dialog = Ti.UI.createAlertDialog({
	    message: CONFIG.element+" clicked",
	    ok: 'OK',
	    title: 'Click'
	  }).show();
});