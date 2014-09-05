var APP = require("core");
var CONFIG = arguments[0] || {};
APP.log("debug",CONFIG);

$.bundleItemName.text = CONFIG.content.name;
$.bundleItemName.bak = {height : 0};

// by default the panel bundleItemElements is not deployed (invisible)
$.bundleItemElements.visible = false;

APP.log("debug","$.deployed");
APP.log("debug",$.deployed);

$.bundleItem.addEventListener("click", function(_event) {
	//APP.log("debug","$.bundleItemForm.getHeight()");
	APP.log("debug",$.bundleItemForm.getHeight());
	/*
	var dialog = Ti.UI.createAlertDialog({
	    message: CONFIG.element+" clicked",
	    ok: 'OK',
	    title: 'Click'
	  }).show();
	  */
	if ($.bundleItemElements.visible == true) {
		//$.bundleItemElements.bak.height = $.bundleItemElements.height;
		$.bundleItemForm.height="140dp";
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
		
		//$.bundleItemForm.height="40dp";
		//$.bundleItemElements.height="1dp";
		$.deployed=false;
		APP.log("debug","$.deployed");
		APP.log("debug",$.deployed);
	} else {
		//$.bundleItemElements.height = $.bundleItemElements.bak.height;
		//$.bundleItemContainer.height = "140dp";
		/*
		 * $.bundleItemElements.animate({
			height : "100dp",
			duration:500
		});
		 */
		$.bundleItemElements.visible = true;		
		$.bundleItemForm.height="140dp";
		$.bundleItemElements.animate({
			height : "140dp",
			duration:500
		});
		$.deployed = true;
	APP.log("debug","$.deployed");
	APP.log("debug",$.deployed);
	}
	
});

// Form rows inside the metadata
var rows=[];
var i = 1;
for(var element in CONFIG.content.elements_in_set) {
	if(i<10) {
		// if element.datatype == "Text" => formulaire texte, else...
		var row = Alloy.createController("edit_metadata_element", {
			element:element,
			content:CONFIG.content.elements_in_set[element]
		}).getView();
		rows.push(row);
	}
	i++;
};

$.bundleItemElements.setOpacity(0);
$.bundleItemElements.setData(rows);
for(var x=0; x<rows.length; x++) {
	$.bundleItemElements.add(rows[x]);
}
$.bundleItemElements.setOpacity(1);