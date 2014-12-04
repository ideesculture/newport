/**
 * Controller for the main view
 * 
 * @class Controllers.text
 * @uses core
 */
var APP = require("core");
var COMMONS = require("ca-commons");
var CONFIG = arguments[0];
var maxwidth = Ti.Platform.displayCaps.platformWidth;
var maxheight = Ti.Platform.displayCaps.platformHeight;
var HIERARCHY_MODEL = require("models/ca-objects-hierarchy")();

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
		
	// Loading CA database model (metadatas & fields) & filling cache
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
	// Handling right side last modified records
	$.handleLastModifiedData(HIERARCHY_MODEL.getLastRecords($.TABLE));
	// Handling top screen folders data
	$.handleFoldersData(HIERARCHY_MODEL.getChildrenFoldersInside($.TABLE,CONFIG.id));
	// Handling bottom objects
	$.handleObjectsData(HIERARCHY_MODEL.getObjectsInside($.TABLE,CONFIG.id));
}

/**
 * Retrieves the data
 * @param {Object} _force Whether to force the request or not (ignores cached data)
 * @param {Object} _callback The function to run on data retrieval
 */
$.retrieveData = function(_force, _callback) {
	APP.log("debug","main.retrieveData");

	// Hard fixing login & password to improve dev speed
	APP.ca_login="admin";
	APP.ca_password="smf2013";
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
				APP.closeLoading();
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
			var object_block = Alloy.createController("main_object_block", _data[object]).getView();
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

$.firstImage.addEventListener('click',function(e) {
	APP.closeMenu();
	myModal.open({
    	animate : true
	});
});

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

$.thatNeedsToGoElsewhere = function() {
	var myModal = Ti.UI.createWindow({
	    title           : 'My Modal',
	    backgroundColor : 'transparent'
	});
	var wrapperView    = Ti.UI.createView(); // Full screen
	var backgroundView = Ti.UI.createView({  // Also full screen
	    backgroundColor : '#000',
	    opacity         : 0.5,
	    top: 47
	});
	if(OS_IOS && APP.Device.versionMajor >= 7) {
		backgroundView.top = 67;
	}
	var topcontainerView  = Ti.UI.createView({  // Set height appropriately
	    width: Ti.UI.FILL,
	    backgroundColor : '#111',
	    color: "white"
	});
	topcontainerView.top = backgroundView.top; 
	topcontainerView.height = maxheight / 6;
	
	var topLeft  = Ti.UI.createView({  // Set height appropriately
		width:"60%",
		height:"100%",
		left:10,
		top:0
	});
	var topRight  = Ti.UI.createView({  // Set height appropriately
		width:"36%",
		height:"100%",
		right:10,
		top:0,
		textAlign: Ti.UI.TEXT_ALIGNMENT_RIGHT,
		layout:"vertical"	
	});
	var label1 = Ti.UI.createLabel({
	  font: { fontSize:34 },
	  text: 'Object 1',
	  textAlign: Ti.UI.TEXT_ALIGNMENT_LEFT,
	  top:10,
	  left:10,
	  width: Ti.UI.SIZE, height: Ti.UI.SIZE,
	  color:"#ddd"
	});
	var textArea = Ti.UI.createTextArea({
		backgroundColor:"transparent",
		font: {fontSize:20},
		textAlign: 'left',
		left:10,
		value: "Here we have a short description\nlorem ipsum dolor sit amet\nconsectur adipisici elit sed eiusmod\ntempor incidunt ut ",
		top: 60,
		width: 420, 
		height : 70,
		color:"#ddd"
	});
	topLeft.add(label1);
	topLeft.add(textArea);
	topcontainerView.add(topLeft);
	var closeButton    = Ti.UI.createButton({
		font: { fontSize:24, fontFamily:"GillSans" },
	    title  : 'X',
	    color: "#aaa",
	    right: 0,
	    top: 6
	});
	closeButton.addEventListener('click', function () {
	    myModal.close();
	});
	var label2 = Ti.UI.createLabel({
	  font: { fontSize:20, fontFamily:"Avenir-MediumOblique" },
	  text: 'Some info about the item',
	  textAlign: Ti.UI.TEXT_ALIGNMENT_RIGHT,
	  right:10,
	  width: Ti.UI.SIZE, height: Ti.UI.SIZE,
	  color:"#ddd",
	  right:10
	});
	var label3 = Ti.UI.createLabel({
	  font: { fontSize:20, fontFamily:"Avenir-MediumOblique" },
	  text: 'Even some more info',
	  textAlign: Ti.UI.TEXT_ALIGNMENT_RIGHT,
	  right:10,
	  width: Ti.UI.SIZE, height: Ti.UI.SIZE,
	  color:"#ddd",
	  right:10
	});
	var editButton = Ti.UI.createButton({
		color:"#fff",
		backgroundColor: APP.Settings.colors.primary,
		title: 'Edit',
		width: 100,
		height: 34,
		right:10
	});
	//topcontainerView.add(closeButton);
	topRight.add(closeButton);
	topRight.add(label2);
	topRight.add(label3);
	topRight.add(editButton);
	topcontainerView.add(topRight);
	
	var imagecontainerView  = Ti.UI.createView({  // Set height appropriately
	    height: 500,
	    width: 480,
	    bottom: 100,
	    backgroundColor : '#FFF',
	    color: "black"
	});
	var someLabel      = Ti.UI.createLabel({
	    title : 'Here is your modal',
	    top   : 40,
	    color: "black"
	});
	
	var leftButtonView = Ti.UI.createView({
		left:40,
		bottom:100,
		height:100,
		width: 70
	});
	var leftButton    = Ti.UI.createButton({
		font: { fontSize:80, fontFamily:"ChalkboardSE-Regular" },
	    title  : '<',
	    color: "#fff"
	});
	leftButtonView.add(leftButton);
	var rightButtonView = Ti.UI.createView({
		right:40,
		bottom:100,
		height:100,
		width: 70
	});
	var rightButton    = Ti.UI.createButton({
		font: { fontSize:80, fontFamily:"ChalkboardSE-Regular" },
	    title  : '>',
	    color: "#fff"
	});
	rightButtonView.add(rightButton);
	imagecontainerView.add(someLabel);
	
	
	wrapperView.add(backgroundView);
	wrapperView.add(imagecontainerView);
	wrapperView.add(topcontainerView);
	wrapperView.add(leftButtonView);
	wrapperView.add(rightButtonView);
	
	myModal.add(wrapperView);
};

// Kick off the init
$.thatNeedsToGoElsewhere();
$.init();
