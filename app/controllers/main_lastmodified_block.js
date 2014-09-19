/**
 * Controller for a last modified block in the right panel
 * 
 * @class Controllers.text
 * @uses core
 */
var APP = require("core");
var CONFIG = arguments[0];

// Adding recent items to right panel
//var view = Alloy.createController("main_lastmodified_block_folderrow", {id:43}).getView();
$.itemTreeTable.setHeight(120);
$.itemTreeTable.setWidth(50);
$.itemTreeTable.setBackgroundColor("yellow");
//APP.log("debug",$.itemTreeTable.children);
//$.objectTable.add(view);