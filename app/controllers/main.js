/**
 * Controller for the main view
 * 
 * @class Controllers.main
 * @uses core
 */
var APP = require("core");
APP.openLoading();

var COMMONS = require("ca-commons");
var CONFIG = arguments[0];
var maxwidth = Ti.Platform.displayCaps.platformWidth;
var maxheight = Ti.Platform.displayCaps.platformHeight;
var HIERARCHY_MODEL = require("models/ca-objects-hierarchy")();

var 	myModal = Ti.UI.createWindow({
	    title           : 'My Modal',
	    backgroundColor : 'transparent'
	});


// Temporary fixing the table we"re editing, need to come through CONFIG after
$.TABLE = "ca_objects";

// Logging controller start
APP.log("debug", "text | " + JSON.stringify(CONFIG));

$.init = function() {
	// Initiating CA db model class
	HIERARCHY_MODEL.init($.TABLE);
	Ti.API.log("APP.Settings.defaultdisplay");
	Ti.API.log(APP.Settings.defaultdisplay);
	// Saving current value of controller
	if (APP.Settings.defaultdisplay.topfolders == "main_folder_block") {
		$.toggleFoldersDisplay();
	}

	$.NavigationBar.setBackgroundColor(APP.Settings.colors.primary);
		
	// loading url & cache validity from settings
	CONFIG.url = APP.Settings.CollectiveAccess.urlForHierarchy.url;
	CONFIG.validity = APP.Settings.CollectiveAccess.urlForHierarchy.cache;

	// Handling breadcrumb
	if(CONFIG.id) {
		// TODO : move breadcrumb interaction inside its own controller
		// Changing home button & adding listener
		$.breadcrumb_home.color = APP.Settings.colors.primary;
		for(i=0;i<=APP.breadcrumb.length;i++) {
			$.breadcrumb_home.addEventListener('click',function(e) {
				Ti.API.log("removing one child");
				APP.removeChild();
				APP.breadcrumb.pop();
			});
		};
		var breadcrumb_separator=Ti.UI.createLabel({
			text: ">",
			left:10
		});
		$.breadcrumb.add(breadcrumb_separator);
		// Adding ancestors to breadcrumb
		for(var step in APP.breadcrumb) {
			var breadcrumb_label=Ti.UI.createLabel({
				text: APP.breadcrumb[step].display_label,
				left:10,
				color:APP.Settings.colors.primary
			});
			Ti.API.log("step");
			Ti.API.log(step);
			// Calculating how many removeChild we have to execute : going from last to current
			for(i=1;i<=(APP.breadcrumb.length - step);i++) {
				breadcrumb_label.addEventListener('click',function(e) {
					Ti.API.log("removing one child");
					APP.removeChild();
					APP.breadcrumb.pop();
				});
			};
			$.breadcrumb.add(breadcrumb_label);
			var breadcrumb_separator=Ti.UI.createLabel({
				text: ">",
				left:10
			});
			$.breadcrumb.add(breadcrumb_separator);
		};
		// Adding current level to breadcrumb
		var breadcrumb_label=Ti.UI.createLabel({
			text: CONFIG.display_label,
			left:10
		});
		$.breadcrumb.add(breadcrumb_label);
	}

	$.retrieveData();
		
	if(CONFIG.isChild === true) {
		$.NavigationBar.showBack(function(_event) {
			APP.removeChild();
		});
	}
	
	if(APP.Settings.useSlideMenu) {
		$.NavigationBar.showMenu(function(_event) {
			APP.toggleMenu();
		});
	} else {
		$.NavigationBar.showSettings(function(_event) {
			APP.openSettings();
		});
	}
	
	$.NavigationBar.text = "Archivio Teatro Regio";
	
	// Setting main view to full screen width
	$.mainview.width = maxwidth;

};

$.retrieveCallbackFunctions = function() {
	// Handling top screen folders data
	$.handleFoldersData(HIERARCHY_MODEL.getChildrenFoldersInside($.TABLE,CONFIG.id));
	// Handling bottom objects
	$.handleObjectsData(HIERARCHY_MODEL.getObjectsInside($.TABLE,CONFIG.id));
	// Handling right side last modified records
	$.handleLastModifiedData(HIERARCHY_MODEL.getLastRecords($.TABLE));
	
}

/**
 * Retrieves the data
 * @param {Object} _force Whether to force the request or not (ignores cached data)
 * @param {Object} _callback The function to run on data retrieval
 */
$.retrieveData = function(_force, _callback) {
	APP.log("debug","main.retrieveData");

	// Hard fixing login & password to improve dev speed
	APP.ca_login="administrator";
	APP.ca_password="admin";
	APP.authString = 'Basic ' +Titanium.Utils.base64encode(APP.ca_login+':'+APP.ca_password);

	if(COMMONS.isCacheValid(CONFIG.url,CONFIG.validity)) {
		APP.log("debug","ca-objects-hierarchy cache is valid");
		$.retrieveCallbackFunctions();
	} else {
		HIERARCHY_MODEL.fetch({
			url: CONFIG.url,
			authString: APP.authString,
			cache: 0,
			callback: function() {
				//$.handleData(HIERARCHY_MODEL.nbLines($.TABLE));
				$.retrieveCallbackFunctions();
				if(typeof _callback !== "undefined") {
					_callback();
				}
			},
			error: function() {
				var dialog = Ti.UI.createAlertDialog({
				    message: 'Connexion failed. Please retry.',
				    ok: 'OK',
				    title: 'Error'
				  }).show();
				if(typeof _callback !== "undefined") {
					_callback();
				}
			}
		});
	}

	APP.closeLoading();
};

/**
 * Handles the data return
 * @param {Object} _data The returned data
 */
$.handleData = function(_data) {
};

$.handleLastModifiedData = function(_data) {
	// Adding recent items to right panel
	for(var lastModified in _data) {
		var lastmodified_block_view = Alloy.createController("main_lastmodified_block", _data[lastModified]).getView();
		$.rightbarContainer.add(lastmodified_block_view);	
	}	
};

$.handleFoldersData = function(_data) {
	// If we have data to display...
	// Source : http://stackoverflow.com/questions/126100/how-to-efficiently-count-the-number-of-keys-properties-of-an-object-in-javascrip
	if (Object.keys(_data).length > 0) {
		// Adding top objects to top block, those having no parent_id
		for(var folder in _data) {
			var folder_row = Alloy.createController("main_folders_row", _data[folder]).getView();
			$.folderItemsList.add(folder_row);
			var folder_block = Alloy.createController("main_folder_block", _data[folder]).getView();
			$.folderItemsBlocks.add(folder_block);
		}
	// If we don't have any data to display, removing container
	} else {
		$.mainview.remove($.foldersView);
	};	
};

$.handleObjectsData = function(_data) {
	// If we have data to display...
	// Adding top objects to top block, those having no parent_id
	if (Object.keys(_data).length > 0) {
		for(var object in _data) {
			var object_data = {
				obj_data : _data[object],
				modal : myModal
			};
			var object_block = Alloy.createController("main_object_block", object_data).getView();
			$.objectBlocks.add(object_block);
		}	
	} else {
		$.mainview.remove($.objectsView);
	}
};

// Event listeners
//
// Calculating orientationchange to refresh mainview width
Ti.Gesture.addEventListener('orientationchange', function(e) {
	maxwidth = Ti.Platform.displayCaps.platformWidth;
	$.mainview.applyProperties({width:maxwidth});
});
/*
$.firstImage.addEventListener('click',function(e) {
	APP.log("debug","$.firstImage.addEventListener");
	var modal_info = {
		id: "1",
		container: myModal,
		display_label: CONFIG.display_label
	}
    var modal_view = Alloy.createController('main_modal_details',modal_info);
    myModal.add(modal_view.getView());
	myModal.open({
    	animate : true
	});
});
*/
$.foldersButtons.addEventListener('click',function(e) {
	$.toggleFoldersDisplay();
});
$.objectsButtons.addEventListener('click',function(e) {
	$.toggleObjectsDisplay();
});

$.toggleFoldersDisplay = function() {
	var initial = $.folderItemsList.visible;
	// Depending on "initial" status, reveal other buttons... 
	$.foldersButtonsList.width = initial ? 0 : Ti.UI.SIZE;	
	$.foldersButtonsList.visible = initial ? false : true;
	$.foldersButtonsBlocks.width = initial ? Ti.UI.SIZE : 0;
	$.foldersButtonsBlocks.visible = initial ? true : false;
	// ... and switch view	
	$.folderItemsList.height = initial ? 0 : Ti.UI.FILL;
	$.folderItemsList.visible = initial ? false : true;
	$.folderItemsBlocks.visible = initial ? true : false;
	// ... and save back as default display
	Ti.API.log("APP.Settings.defaultdisplay.topfolders : avant/après");
	Ti.API.log(APP.Settings.defaultdisplay.topfolders);
	APP.Settings.defaultdisplay.topfolders = initial ? "main_folder_block" : "main_folders_row";
	Ti.API.log(APP.Settings.defaultdisplay.topfolders);
	
}

$.toggleObjectsDisplay = function() {
	var initial = $.objectBlocks.visible;
	// Depending on "initial" status, reveal other buttons... 
	if (initial) {
		$.objectsButtonsList.animate({width:0, visible : false, duration:300});
		$.objectsButtonsBlocks.animate({width : Ti.UI.SIZE, visible : true , duration:300});
	} else {
		$.objectsButtonsList.animate({width: Ti.UI.SIZE, visible : true, duration:300});
		$.objectsButtonsBlocks.animate({width : 0, visible : false, duration:300});
	}
	// ... and switch view	
	//$.objectBlocks.height = initial ? 0 : Ti.UI.FILL;
	$.objectBlocks.animate({height : (initial ? 0 : Ti.UI.FILL), visible : (initial ? false : true), duration:300});
	$.objectsList.animate({visible : (initial ? true : false), duration:300});
	// ... and save back as default display
	Ti.API.log("APP.Settings.defaultdisplay.bottomobjects : avant/après");
	Ti.API.log(APP.Settings.defaultdisplay.bottomobjects);
	APP.Settings.defaultdisplay.bottomobjects = initial ? "main_object_row" : "main_object_block";
	Ti.API.log(APP.Settings.defaultdisplay.bottomobjects);
}

// Animation togglers
var showRightbar = function() {
	$.mainview.animate({
		width:(maxwidth - $.rightbar.width)
	});
};
var hideRightbar = function() {
	$.mainview.animate({
		width:maxwidth
	});
};

$.NavigationBar.showRight({
	image: "/newport/hourglass.png",
	callback: function() {
		if($.rightbar.shown) {
			hideRightbar();
			$.rightbar.shown = false;
		} else {
			showRightbar();
			$.rightbar.shown = true;
		}
	}
});

// Kick off the init
//$.thatNeedsToGoElsewhere();
$.init();
