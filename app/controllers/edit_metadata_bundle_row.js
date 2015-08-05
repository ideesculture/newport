var APP = require("core");
var CONFIG = arguments[0] || {};
var BUNDLE_VALUES = CONFIG.bundle_values || {};
var VALUES = BUNDLE_VALUES[CONFIG.i] || {};
var DATATYPECONTROLLERS = {
	"Text":"edit_metadata_element_text",
	"Currency":"edit_metadata_element_currency",
	"Numeric":"edit_metadata_element_numeric",
	"Text":"edit_metadata_element_text",
	"Url":"edit_metadata_element_url",
	"Length":"edit_metadata_element_length",
	"Weight":"edit_metadata_element_weight",
	"DateRange":"edit_metadata_element_daterange",
	"Entities":"edit_metadata_related_entities",
	"Objects":"edit_metadata_related_objects",
	"Occurrences":"edit_metadata_related_occurrences",
	"Preferred_labels": "edit_preferred_labels",
	"StorageLocations": "edit_metadata_related_storage_locations",
	"List": "edit_metadata_element_list"
};
//APP.log("debug",CONFIG);

$.init = function() {


	// adding metadata elements
	var j = 0;
	for(var element in CONFIG.elements_in_set) {
		var content = CONFIG.elements_in_set[element];


		if(j<25) {
			APP.log("debug","DEUXIEME BOUCLE "+CONFIG.i+" "+j);
			// if element.datatype == "Text" => formulaire texte, else...
			//APP.log("debug",element.datatype);


			if(content.datatype in DATATYPECONTROLLERS) {
	    		// does exist
	    		APP.log("debug", content.datatype +" est bien dans DATATYPECONTROLLERS");

	    		var dataForDatatypeController = {
	    			bundle_code:CONFIG.bundle_code,
					element:element,
					content:content,
					i:CONFIG.i,
					j:j
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

				APP.log("debug","element "+element+" value "+value+" ("+ content.datatype+ ")");

				var row = Alloy.createController(
						DATATYPECONTROLLERS[content.datatype],
						dataForDatatypeController
					).getView();
			} else {
				APP.log("debug","UNSUPPORTED: ");
				APP.log("debug",content);

				var value={};
				if (typeof VALUES != 'undefined') {
					// We have one value for the element, does this one take a locale ?
					if ((typeof VALUES[APP.locale] != 'undefined') && (typeof VALUES[APP.locale][element] != 'undefined')) {
						value = VALUES[APP.locale][element];
					} else if (typeof VALUES[element] != 'undefined') {
						value = VALUES[element];
					}

				};

				APP.log("debug","value:");
				APP.log("debug",value);

	    		var row = Alloy.createController("edit_metadata_element_unsupported", {
					element:element,
					content:content,
					grandparent:CONFIG.parent,
					grandparentTitle:CONFIG.parentTitle

				}).getView();
			}
			$.bundleRowContent.add(row);

		}
		j++;
	};
};

$.removeButton.addEventListener("click", function(_event) {
	if((typeof CONFIG.parent) !== "undefined") {
		CONFIG.parent.remove($.bundleRow);
	}
	//$.destroy();
});

$.init();
