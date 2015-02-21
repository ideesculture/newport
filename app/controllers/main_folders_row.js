/**
 * Controller for a last modified block in the right panel
 * 
 * @class Controllers.text
 * @uses core
 */
var APP = require("core");
var CONFIG = arguments[0];

APP.log("debug","Adding folder row ("+CONFIG.object_id+")");

$.foldersItemName.text = CONFIG.display_label;
$.foldersItemCount.text = "("+CONFIG.contains+")";

$.foldersItem.addEventListener('click',function(e) {
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
	//APP.breadcrumb.push(child_info);
});
