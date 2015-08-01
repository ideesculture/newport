/**
 * Controller for a last modified block in the right panel
 *
 * @class Controllers.text
 * @uses core
 */
var APP = require("core");
var CONFIG = arguments[0];

var 	myModal = Ti.UI.createWindow({
	    title           : 'My Modal',
	    backgroundColor : 'transparent'
	});

APP.log("debug","Adding folder row ("+CONFIG.object_id+")");

$.foldersItemName.text = CONFIG.display_label;
$.foldersItemCount.text = CONFIG.contains;
Ti.API.log("debug","CONFIG.contains.SIZE");
Ti.API.log("debug",CONFIG.contains.SIZE);
//$.foldersItemCount.width = CONFIG.contains.SIZE * 7 + 10;

$.foldersItem.addEventListener('singletap',function(e) {
	APP.openLoading();
	APP.log("debug", "adding new child (main.js): "+CONFIG.object_id);
	var child_info = {
		id: CONFIG.object_id,
		display_label: CONFIG.display_label
	}
	setTimeout(function() {
		APP.addChild("main", child_info, false, false);
   		//$.NavigationBar.title.text = "loaded";
   	},100);
	//APP.addChild("main", child_info, false, false);
	APP.breadcrumb.push(child_info);
});

$.foldersItem.addEventListener('longpress', function(e) {
	APP.log("debug","$.cellimage.addEventListener LONGPRESS : : :");
	// if menu opened, close it
	if(APP.SlideMenuOpen) {
		APP.closeMenu();
	}
	var tempobj = { 
		id: CONFIG.object_id,
		display_label: CONFIG.display_label 
	};
	var modal_info = {
		obj_data: tempobj,
		container: myModal	
	}
    var modal_view = Alloy.createController('main_folder_longpress_modal',modal_info);
    myModal.add(modal_view.getView());
	myModal.open({
    	animate : true
	});
});
