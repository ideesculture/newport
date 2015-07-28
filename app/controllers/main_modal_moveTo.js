


var APP = require("core");
var UTIL = require("utilities");
var DATE = require("alloy/moment");
var BUFFER = require("ca-editbuffer");
var HTTP = require("http");
var HIERARCHY_MODEL = require("models/ca-objects-hierarchy")();
var STORAGE_LOCATIONS_MODEL = require("models/ca-storage-locations")();
var COMMONS = require("ca-commons");

var CONFIG = arguments[0];
var value ="";


$.TABLE = "ca_storage_locations";


$.recursive = function(originalTable, newTable, parent_id, currentKey, margin){
	//APP.log("debug", "recursive");
	var tempObj = {}; 
	//APP.log("debug", "current Key " + currentKey);

	for(var row in originalTable){
		
		//APP.log("debug", "parent id: " + originalTable[row].parent_id);
		//APP.log("debug", "location_id: " + originalTable[row].location_id);
		if(originalTable[row].parent_id == parent_id){
			//alert("loop"); 
			//APP.log("debug", "adding line: ");
			//APP.log("debug", currentKey);
			//APP.log("debug", originalTable[row].display_label );
			tempObj.display_label = originalTable[row].display_label; 
			tempObj.margin = margin; 
			newTable[currentKey] = tempObj; 
			tempObj = {}; 
			currentKey ++; 

			//originalTable[row].parent_id = -1; 
           // APP.log("debug",newTable);
			$.recursive(originalTable, newTable, originalTable[row].location_id, currentKey, (margin+20));
		}
		else {
			//APP.log("debug", 'non'); 
		}
	}
}

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

$.init = function() {

	STORAGE_LOCATIONS_MODEL.init($.TABLE);
	STORAGE_LOCATIONS_MODEL.clear($.TABLE);

	APP.ca_login="administrator";
	APP.ca_password="admin";
	APP.authString = 'Basic ' +Titanium.Utils.base64encode(APP.ca_login+':'+APP.ca_password);
	CONFIG.url = APP.Settings.CollectiveAccess.urlForStorageLocations.url;

	var handleData = function () {

		var _data = STORAGE_LOCATIONS_MODEL.getSearchedRecordsLocally($.TABLE , "");

		var storage_loc_nb, margin, label1, tvr, table = []; 

		if( typeof _data == 'object'){

			var tableToDisplay = $.ordersData(_data);
			APP.log("debug", "tableToDisplay: : :");
			APP.log("debug", tableToDisplay);
			//var i = 10; 
			for(storage_loc_nb in tableToDisplay){

			    tvr = Ti.UI.createTableViewRow({
			       // title : title, 
			        //backgroundColor: 'yellow',
			        layout: 'horizontal'//, 
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
					alert(this.backgroundColor); 
				});

				table.push(tvr); 
				//i += 10; 
			}
			$.storageLocationsTable.setData(table);
		}
	}


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