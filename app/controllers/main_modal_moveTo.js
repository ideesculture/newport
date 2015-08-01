


var APP = require("core");
var UTIL = require("utilities");
var DATE = require("alloy/moment");
var BUFFER = require("ca-editbuffer");
var HTTP = require("http");
//var HIERARCHY_MODEL = require("models/ca-objects-hierarchy")();
var STORAGE_LOCATIONS_MODEL = require("models/ca-storage-locations")();
var OBJECT_EDIT = require("models/ca-object-edit")();
var COMMONS = require("ca-commons");

var CONFIG = arguments[0];
var value ="";


$.TABLE = "ca_storage_locations";

//recursive function: parse unorganized data, gives back a table with info ready to be displayed
$.recursive = function(originalTable, newTable, parent_id, currentKey, margin){
	//APP.log("debug", "recursive");
	var tempObj = {}; 

	for(var row in originalTable){
		if(originalTable[row].parent_id == parent_id){
			tempObj.display_label = originalTable[row].display_label; 
			tempObj.margin = margin; 
			tempObj.location_id = originalTable[row].location_id; 
			tempObj.type_id = originalTable[row].type_id;
			//newTable[currentKey] = tempObj; 
			newTable.push(tempObj); 
			tempObj = {}; 
			currentKey ++; 

			//originalTable[row].parent_id = -1; 
           // APP.log("debug",newTable);
			$.recursive(originalTable, newTable, originalTable[row].location_id, currentKey, (margin+30));

		}
	}
}
//creates the table, calls "recursive" which fills it with the right data, gives it back to handleData which populates the list of storage locations
$.ordersData = function(_data){
	//APP.log("debug", "ordersData");
	//APP.log("debug", _data);
	var cleanTable = []; 
	var currentKey = 0; 
	var margin = 10; 
	var parent_id = 1; 
	$.recursive(_data, cleanTable, parent_id, currentKey, margin);
	return cleanTable; 
}
$.moveObject = function(id, type_id){
	APP.log("debug", "move");
	var itWorked = OBJECT_EDIT.saveSpecificChanges("ca_storage_locations", id, 1, 0, "ca_storage_locations", type_id);
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
}

$.init = function() {

	//starting model for storage locations
	STORAGE_LOCATIONS_MODEL.init($.TABLE);
	STORAGE_LOCATIONS_MODEL.clear($.TABLE);

	//starting model for objects - for saving new relation. 
	OBJECT_EDIT.init("ca_objects", CONFIG.obj_data.object_id);

	//setting parameters for storage-location FETCH
	APP.ca_login="administrator";
	APP.ca_password="admin";
	APP.authString = 'Basic ' +Titanium.Utils.base64encode(APP.ca_login+':'+APP.ca_password);
	CONFIG.url = APP.Settings.CollectiveAccess.urlForStorageLocations.url;

	//this function is called after storage-location-model "fetch". It prints the hierarchy in a table and waits for a click. 
	var handleData = function () {

		var _data = STORAGE_LOCATIONS_MODEL.getSearchedRecordsLocally($.TABLE , "");

		var storage_loc_nb, margin, label1, tvr, table = []; 

		if( typeof _data == 'object'){

			var tableToDisplay = $.ordersData(_data);
			//APP.log("debug", "tableToDisplay: : :");
			//APP.log("debug", tableToDisplay);
			//var i = 10; 
			for(storage_loc_nb in tableToDisplay){

			    tvr = Ti.UI.createTableViewRow({
			       // title : title, 
			        //backgroundColor: 'yellow',
			        layout: 'horizontal', 
			        location_id: tableToDisplay[storage_loc_nb].location_id,
			        type_id: tableToDisplay[storage_loc_nb].type_id,
			        display_label:tableToDisplay[storage_loc_nb].display_label
			       //left: i
			    });

			    margin = Titanium.UI.createView({
			        width: tableToDisplay[storage_loc_nb].margin,
			        height: 50,  
			        layout: 'vertical',
			        //backgroundColor: "blue"
			    });
			    tvr.add(margin); 

			    label1 = Ti.UI.createLabel({
				  color: 'black',
				  backgroundColor: 'white',
				  font: { fontSize: 18 },
				  text: tableToDisplay[storage_loc_nb].display_label, 
				  textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
				  top: 15,
				  left: 5, 
				  width: Ti.UI.SIZE, 
				  height: Ti.UI.SIZE
				});
				tvr.add(label1);

			    tvr.addEventListener('click', function() {
					//here do something
					//dialog: 'move object to storage location blabla?  move / cancel'
					var dialog = Ti.UI.createAlertDialog({
					    cancel: 1,
					    buttonNames: ['Move', 'Cancel'],
					    location_id: this.location_id, 
					    type_id: this.type_id,
					    message: 'Move object to storage location "' + this.display_label + '" ? ',
					    title: 'Move object'
					});
					dialog.addEventListener('click', function(e){
						if (e.index === e.source.cancel){
							// Cancel
							Ti.API.info('The cancel button was clicked');
						} else {
							//alert("move object : " + tvr.location_id);
							//problem HERE.
							$.moveObject(this.location_id, this.type_id);
						} 
					});
					dialog.show();

				});

				table.push(tvr); 
			}
			$.storageLocationsTable.setData(table);
		}
	}


	//fetch: brings back storage locations data from the server and fills the ca-storage-locations table.
	if(!COMMONS.isCacheValid(CONFIG.url,CONFIG.validity)) {
		STORAGE_LOCATIONS_MODEL.fetch({
			url: CONFIG.url,
			authString: APP.authString,
			cache: 0,
			callback: handleData,
			error: function() {
				var dialog = Ti.UI.createAlertDialog({
				    message: 'ERROR while updating storage locations list: Connexion failed. The list of storage locations may be outdated.',
				    ok: 'OK',
				    title: 'Error'
				  }).show();
			}
		});
	}
};

$.backgroundView.addEventListener('click', function () {
	    CONFIG.container.close();
});



$.init();