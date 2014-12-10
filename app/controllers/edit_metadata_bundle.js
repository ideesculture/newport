var APP = require("core");
var CONFIG = arguments[0] || {};
var VALUES = CONFIG.values || {};
var DATATYPECONTROLLERS = {
	"Text":"edit_metadata_element_text",
	"Currency":"edit_metadata_element_currency",
	"Numeric":"edit_metadata_element_numeric",
	"Text":"edit_metadata_element_text",
	"Url":"edit_metadata_element_url",
	"Length":"edit_metadata_element_length",
	"Weight":"edit_metadata_element_weight"
};
//APP.log("debug",CONFIG);

$.init = function() {
	$.bundleItemName.text = CONFIG.content.name;
	$.addNewButton.title = "+ Add new "+CONFIG.content.name.toLowerCase();
	$.bundleItemName.bak = {height : 0};

	// by default the panel bundleItemElements is not deployed (invisible)
	$.bundleItemElements.height = 1;
	$.bundleItemElements.visible = false;
	$.addNewButtonView.visible = false;
	$.addNewButtonView.height = 1;

	// Create fields inside the bundle
	var height=0;

	var value = "";
	// counting how many metadata values we have to open metadata rows, minimum 1
	var numrows = 1;

	if (VALUES.length > 1) {
		numrows = VALUES.length
	}; 

	// looping through each row to display metadatas values
	for (var i = 0; i < numrows; i++) {
		// looping through each metadata element to display inside the row
		var row = Alloy.createController("edit_metadata_bundle_row", {
				elements_in_set:CONFIG.content.elements_in_set,
				values:VALUES[i],
				content:{},
				parent:$.bundleItemElements
			}).getView();
		$.bundleItemElements.add(row);

	}
};

/* 
 *  Handlers
 */

// Folding bundle 
$.bundleItem.addEventListener("click", function(_event) {

	if ($.bundleItemElements.visible == true) {
		$.bundleItemElements.visible = false;
		$.bundleItemElements.height = 1;
		$.addNewButtonView.visible = false;
		$.addNewButtonView.height = 1;
		$.arrowIcon.image = "/icons/black/ca_arrow_down.png";
	} else {
		$.bundleItemElements.visible = true;
		$.bundleItemElements.height = Ti.UI.SIZE;
		$.addNewButtonView.visible = true;
		$.addNewButtonView.height = Ti.UI.SIZE;
		$.arrowIcon.image = "/icons/black/ca_arrow_up.png";
	}
	
});

// Add new bundle container (+)
$.addNewButton.addEventListener("click", function(_event) {
	var row = Alloy.createController("edit_metadata_bundle_row", {
			elements_in_set:CONFIG.content.elements_in_set,
			content:{},
			parent:$.bundleItemElements
		}).getView();
	$.bundleItemElements.add(row);
});

$.init();
	