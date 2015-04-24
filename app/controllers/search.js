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

$.search = function(e){
	if(e.value.length >= 3) {

		//calls CA WS and brings back data
		if (Titanium.Network.networkType == Titanium.Network.NETWORK_WIFI )
		{
			 // do a search with the WS 
			//var result = {};
			//should i put quotes around e.value??
			var ca_url = APP.Settings.CollectiveAccess.urlForObjectSearch.url.replace(/<your_query>/g, e.value);
			APP.log("debug", ca_url);

			var error = function() {
				var dialog = Ti.UI.createAlertDialog({
				    message: 'Couldn\'t send data to the server',
				    ok: 'OK',
				    title: 'Error'
				  }).show();
			}

			var callback = function(){
				var dialog = Ti.UI.createAlertDialog({
				    message: 'whatever that means',
				    ok: 'got it',
				    title: 'CALLBACK'
				  }).show();

			}

			var handleData = function( _data){
				var format_data = _data["results"];
				$.handleData(format_data); 

			}			

			HTTP.request({
				timeout: 2000,
				async:false,
				headers: [{name: 'Authorization', value: APP.authString}],
				type: "GET",
				format: "JSON",
				url: ca_url,
				passthrough: callback,
				success: handleData,
				failure: error
			});


		}
		else {
			var result = HIERARCHY_MODEL.getSearchedRecords($.TABLE, e.value);
			$.handleData(result);
		}
		
	}
}

$.handleData = function(_data) {
	// If we have data to display...
	if (Object.keys(_data).length > 0) {
		APP.log("debug", "handle Data");
		APP.log("debug", _data);
		$.objectBlocks.removeAllChildren();
		/*while($.objectBlocks.children !== null){
			$.objectBlocks.remove($.objectBlocks.children[0]);
		}*/
		var last_object_no = Object.keys(_data).length;
		var object_no =0;
		for(var object in _data) {
			object_no++;
			var object_data = _data[object];
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
	else {
		$.objectBlocks.removeAllChildren();
	}
};


// Kick off the init
$.init();