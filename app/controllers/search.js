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
		//alert(e.value);
		//if wifi, then calls CA WS and brings back data
		//else...
		var result = HIERARCHY_MODEL.getSearchedRecords($.TABLE, e.value);
		alert(result);

	}
}


// Kick off the init
$.init();