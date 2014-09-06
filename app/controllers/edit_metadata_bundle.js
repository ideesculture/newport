var APP = require("core");
var CONFIG = arguments[0] || {};

$.bundleItemName.text = CONFIG.content.name;
$.bundleItemName.bak = {height : 0};

// by default the panel bundleItemElements is not deployed (invisible)
//$.bundleItemElements.visible = false;
/*
$.bundleItem.addEventListener("click", function(_event) {
	//APP.log("debug","$.bundleItemForm.getHeight()");
	APP.log("debug",$.bundleItemForm.getHeight());
	/*
	var dialog = Ti.UI.createAlertDialog({
	    message: CONFIG.element+" clicked",
	    ok: 'OK',
	    title: 'Click'
	  }).show();
	  *//*
	if ($.bundleItemElements.visible == true) {
		$.bundleItemForm.height="340dp";
		$.bundleItemElements.animate({
			height: "1dp",
			duration:500
		}, function() {
			$.bundleItemForm.animate({
				height: "40dp",
				duration:500
			});
			$.bundleItemElements.visible = false;		
		});
		$.deployed=false;
	} else {
		$.bundleItemElements.visible = true;		
		$.bundleItemForm.height="340dp";
		$.bundleItemElements.animate({
			height : "340dp",
			duration:500
		});
		$.deployed = true;
	}
	
});
*/
// Create fields inside the bundle
var height=0;
var i = 1;
$.bundleItemElements.setOpacity(0);
for(var element in CONFIG.content.elements_in_set) {
	var content = CONFIG.content.elements_in_set[element];
	APP.log("debug","element");
	APP.log("debug",element);
	//APP.log("debug",CONFIG.content.elements_in_set[element]);

	if(i<10) {
		// if element.datatype == "Text" => formulaire texte, else...
		APP.log("debug",element.datatype);
		switch(content.datatype) {
		    case "Text":
		        var row = Alloy.createController("edit_metadata_element_text", {
					element:element,
					content:CONFIG.content.elements_in_set[element]
				}).getView();
				
		        break;
		    case "Length":
		        var row = Alloy.createController("edit_metadata_element_length", {
					element:element,
					content:CONFIG.content.elements_in_set[element]
				}).getView();
		        break;
		    default:
		    	var row = Alloy.createController("edit_metadata_element_unsupported", {
					element:element,
					content:CONFIG.content.elements_in_set[element]
				}).getView();
		        break;
		}
		$.bundleItemElements.add(row);
		
	}
	i++;
};

$.bundleItemElements.setOpacity(1);
