/**
 * Controller for the "search" screen
 *
 * @class Controllers.settings
 * @uses core
 */
var APP = require("core");
var HTTP = require("http");
var HIERARCHY_MODEL = require("models/ca-objects-hierarchy")();

// Temporary fixing the table we"re editing, need to come through CONFIG after
$.TABLE = "ca_objects";

/**
 * Initializes the controller
 */
$.init = function() {
	APP.log("debug", "search.init");

	//navigation bar
	$.NavigationBar.setBackgroundColor(APP.Settings.colors.primary);
	if(APP.Settings.useSlideMenu) {
		$.NavigationBar.showMenu(function(_event) {
			APP.toggleMenu();
		});
	} else {
		$.NavigationBar.showBack(function(_event) {
			APP.removeChild(true);
		});
	}

	// Initiating CA db model class
	var info1 = APP.Settings.CollectiveAccess.urlForHierarchy.info1;
	var info2 = APP.Settings.CollectiveAccess.urlForHierarchy.info2;
	HIERARCHY_MODEL.init($.TABLE, info1, info2);

	$.searchfield.addEventListener('change', $.search);

};

$.handleData = function(_data) {
	// If we have data to display...
	if( typeof _data.results === 'object'){
		//APP.log("debug", "_data.results is an object!!!");
		//APP.log("debug", _data);
		//APP.log("debug",Object.keys(_data.results));

		if (Object.keys(_data.results).length > 0) {
			$.objectBlocks.removeAllChildren();
			/*while($.objectBlocks.children !== null){
				$.objectBlocks.remove($.objectBlocks.children[0]);
			}*/

			//Sets a max amount of results temporarily
			//otherwise it's too long and bad
			//we have to find a way to make it better
			var last_object_no = 0;
			Object.keys(_data.results).length <= 20? last_object_no = Object.keys(_data.results).length : last_object_no = 20;
			var object_no =0;

			for(var object in _data.results) {
				object_no++;
				var object_data = _data.results[object];
				object_data["info1"] = object_data["ca_objects.type_id"];
				APP.log("debug", object_data);
				var object_block = Alloy.createController("search_object_block", object_data).getView();
				$.objectBlocks.add(object_block);
				if (object_no == last_object_no) {
					setTimeout(function() {
	   					//$.NavigationBar.title.text = "loaded";
					},500);
				}
			}
		}
	}
	else {
		APP.log("debug", "_data.results is not an object!!!");
		$.objectBlocks.removeAllChildren();
	}

};

$.search = function(e){
	var _url = APP.Settings.CollectiveAccess.urlBase+"/"+APP.Settings.CollectiveAccess.urlForObjectSearch.url.replace(/<your_query>/g, e.value);

	if(e.value.length >= 3) {
		if (Titanium.Network.networkType !== Titanium.Network.NETWORK_WIFI ) {
			var result = HIERARCHY_MODEL.getSearchedRecordsLocally($.TABLE, e.value);
		} else {
			var result = HIERARCHY_MODEL.getSearchedRecords($.TABLE, e.value, _url, $.handleData);
		}

	}
};

// Kick off the init
$.init();
