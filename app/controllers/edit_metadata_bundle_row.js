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
	// adding metadata elements
	for(var element in CONFIG.elements_in_set) {
		var content = CONFIG.elements_in_set[element];
		var j = 0;

		if(j<25) {
			// if element.datatype == "Text" => formulaire texte, else...
			//APP.log("debug",element.datatype);
			if(content.datatype in DATATYPECONTROLLERS) {
	    		// does exist
	    		var dataForDatatypeController = {
					element:element,
					content:content
				};
				var value={};
				if (typeof VALUES != 'undefined') {
					// We have one value for the element, does this one take a locale ?
					if ((typeof VALUES[APP.locale] != 'undefined') && (typeof VALUES[APP.locale][element] != 'undefined')) {
						value = VALUES[APP.locale][element];
					} else if (typeof VALUES[element] != 'undefined') {
						value = VALUES[element];
					}
					dataForDatatypeController.value = value;
				};
				APP.log("debug","element "+element+" value "+value+" ("+content.datatype+")");

				var row = Alloy.createController(
						DATATYPECONTROLLERS[content.datatype], 
						dataForDatatypeController
					).getView();
			} else {
	    		var row = Alloy.createController("edit_metadata_element_unsupported", {
					element:element,
					content:content
				}).getView();
			}
			
			$.bundleRowContent.add(row);
			
		}
		j++;
	};
};

$.removeButton.addEventListener("click", function(_event) {
	CONFIG.parent.remove($.bundleRow);
	$.destroy();
});

$.init();
	