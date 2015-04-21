/**
 * Controller for the "search" screen
 * 
 * @class Controllers.settings
 * @uses core
 */
var APP = require("core");
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

$.search = function(e){
	if(e.value.length >= 3) {

		//calls CA WS and brings back data
		/*if (Titanium.Network.networkType == Titanium.Network.NETWORK_WIFI )
		{
			 // do a search with the WS 
			 //dunnow how to
			var result = {};

		}
		else {*/
			var result = HIERARCHY_MODEL.getSearchedRecords($.TABLE, e.value);
		//}
		$.handleData(result);
	}
}

$.handleData = function(_data) {
	// If we have data to display...
	if (Object.keys(_data).length > 0) {
		APP.log("debug", "handle Data");
		$.objectBlocks.removeAllChildren();
		/*while($.objectBlocks.children !== null){
			$.objectBlocks.remove($.objectBlocks.children[0]);
		}*/
		var last_object_no = Object.keys(_data).length;
		var object_no =0;
		for(var object in _data) {
			object_no++;
			var object_data = _data[object];

			var object_block = Alloy.createController("search_object_block", object_data).getView();
			$.objectBlocks.add(object_block);
			if (object_no == last_object_no) {
				setTimeout(function() {
   					//$.NavigationBar.title.text = "loaded";
				},500);
			}
		}	
	} 
	else {
		$.objectBlocks.removeAllChildren();
	}
};


// Kick off the init
$.init();