

var APP = require("core");
var COMMONS = require("ca-commons");
var CONFIG = arguments[0];
var OBJECT_EDIT = require("models/ca-object-edit")();

//APP.log("debug", CONFIG);

var type_id = CONFIG.obj_data.info1;

$.TABLE = "ca_objects";

$.init = function() {
	// Initiating edit model for object

	OBJECT_EDIT.init($.TABLE, CONFIG.obj_data.object_id);
	$.saveButton.addEventListener('click', function () {
		//moves the modifications to _edit_temp_insert table
		var itWorked = OBJECT_EDIT.saveSpecificChanges("preferred_labels", $.newlabelfield.value, 1, 0, "name", "no");

		if(itWorked) {
			//sends the modifs to server and erases them from _edit_temp_insert table
			if (Titanium.Network.networkType == Titanium.Network.NETWORK_WIFI )
			{
				OBJECT_EDIT.sendDataToServer();
				CONFIG.container.close();
			}
			//or keeps the data in the local table
			else
			{
				var dialog = Ti.UI.createAlertDialog({
					title: 'No signal',
				    message: 'Your item will be uploaded as soon a wi-fi will be available',
				    ok: 'OK'
				});
				dialog.show();
			}
			

		} else alert ("echec");
		CONFIG.container.close();
 	}); 
};

$.backgroundView.addEventListener('click', function () {
	    CONFIG.container.close();
});

$.init(); 