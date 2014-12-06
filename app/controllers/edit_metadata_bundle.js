var APP = require("core");
var CONFIG = arguments[0] || {};
var VALUES = CONFIG.values || {};
//APP.log("debug",CONFIG);

$.bundleItemName.text = CONFIG.content.name;
$.bundleItemName.bak = {height : 0};

// by default the panel bundleItemElements is not deployed (invisible)
$.bundleItemElements.height = 1;
$.bundleItemElements.visible = false;

$.bundleItem.addEventListener("click", function(_event) {

	if ($.bundleItemElements.visible == true) {
		$.bundleItemElements.visible = false;
		$.bundleItemElements.height = 1;
	} else {
		$.bundleItemElements.visible = true;
		$.bundleItemElements.height = Ti.UI.SIZE;
	}
	
});

// Create fields inside the bundle
var height=0;
var i = 1;
var datatypeControllers = {
	"Text":"edit_metadata_element_text",
	"Currency":"edit_metadata_element_currency",
	"Numeric":"edit_metadata_element_numeric",
	"Text":"edit_metadata_element_text",
	"Url":"edit_metadata_element_url",
	"Length":"edit_metadata_element_length",
	"Weight":"edit_metadata_element_weight"
};

var value = "";
// counting how many metadata values we have to open metadata rows, minimum 1
var numrows = 1;

if (VALUES.length > 1) {
	numrows = VALUES.length
}; 

// looping through each row to display metadatas values
for (var i = 0; i < numrows; i++) {
	// looping through each metadata element to display inside the row
	for(var element in CONFIG.content.elements_in_set) {
		var content = CONFIG.content.elements_in_set[element];

		if(i<25) {
			// if element.datatype == "Text" => formulaire texte, else...
			//APP.log("debug",element.datatype);
			if(content.datatype in datatypeControllers) {
	    		// does exist
	    		var dataForDatatypeController = {
					element:element,
					content:CONFIG.content.elements_in_set[element]
				};
				if (typeof VALUES[i] != 'undefined') {
					// We have one value for the element, does this one take a locale ?
					if ((typeof VALUES[i][APP.locale] != 'undefined') && (typeof VALUES[i][APP.locale][element] != 'undefined')) {
						value = VALUES[i][APP.locale][element];
					} else if (typeof VALUES[i][element] != 'undefined') {
						value = VALUES[i][element];
					}
					dataForDatatypeController.value = value;
				};
				APP.log("debug","element "+element+" value "+value+" ("+content.datatype+")");

				var row = Alloy.createController(
						datatypeControllers[content.datatype], 
						dataForDatatypeController
					).getView();
			} else {
	    		var row = Alloy.createController("edit_metadata_element_unsupported", {
					element:element,
					content:CONFIG.content.elements_in_set[element]
				}).getView();
			}
			
			$.bundleItemElements.add(row);
			
		}
		i++;
	};
    //Do something
}
	