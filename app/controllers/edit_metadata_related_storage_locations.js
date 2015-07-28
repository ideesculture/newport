

var APP = require("core");
var UTIL = require("utilities");
var DATE = require("alloy/moment");
var BUFFER = require("ca-editbuffer");
var HTTP = require("http");
var COMMONS = require("ca-commons");
var STORAGE_LOCATIONS_MODEL = require("models/ca-storage-locations")();


var CONFIG = arguments[0];
var value ="";
$.TABLE = "ca_storage_locations";


///////////////////////////////////////// UTILITAIRES ////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

$.init = function() {

	//starting model for storage locations
	STORAGE_LOCATIONS_MODEL.init($.TABLE);
	STORAGE_LOCATIONS_MODEL.clear($.TABLE);

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
					//alert(this.display_label);
					$.value.text=this.display_label;
					$.value.visible = true; 
					//$.tablecontainerView.visible = false; 
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


$.init();