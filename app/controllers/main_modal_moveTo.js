


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


$.init = function() {

	STORAGE_LOCATIONS_MODEL.init($.TABLE);
	STORAGE_LOCATIONS_MODEL.clear($.TABLE);

	APP.ca_login="administrator";
	APP.ca_password="admin";
	APP.authString = 'Basic ' +Titanium.Utils.base64encode(APP.ca_login+':'+APP.ca_password);
	CONFIG.url = APP.Settings.CollectiveAccess.urlForStorageLocations.url;

	var handleData = function () {

		var _data = STORAGE_LOCATIONS_MODEL.getSearchedRecordsLocally($.TABLE , "");

		var storage_loc_nb, title, tvr, table = []; 
		if( typeof _data == 'object'){
			var i = 10; 
			for(storage_loc_nb in _data){
				title = _data[storage_loc_nb].display_label ;
			    tvr = Ti.UI.createTableViewRow({
			       // title : title, 
			        backgroundColor: 'yellow',
			        layout: 'horizontal', 
			        left: i
			    });
			    var margin = Titanium.UI.createView({
			        width: i,
			        height: 50,  
			        layout: 'vertical',
			        backgroundColor: "blue"
			    });
			    tvr.add(margin); 

			    var label1 = Ti.UI.createLabel({
				  color: 'black',
				  backgroundColor: 'white',
				  font: { fontSize: 18 },
				  text: title,
				  textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
				  top: 15,
				  left: 5, 
				  width: Ti.UI.SIZE, 
				  height: Ti.UI.SIZE
				});
				tvr.add(label1);

			    tvr.addEventListener('click', function() {
					alert(this.left); 
				});
				table.push(tvr); 
				i += 10; 
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