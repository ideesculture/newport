/**
 * Controller for a last modified block in the right panel
 * 
 * @class Controllers.text
 * @uses core
 */
var APP = require("core");
var CONFIG = arguments[0];
APP.log("debug","Adding lastmodified block: "+CONFIG.label1+" ("+CONFIG.created+")");
APP.log("debug","Date(CONFIG.created)");
APP.log("debug",CONFIG.created);
APP.log("debug",Date(CONFIG.created));

// Adding recent items to right panel
//var view = Alloy.createController("main_lastmodified_block_folderrow", {id:43}).getView();
//APP.log("debug",$.itemTreeTable.children);
$.label4.text = CONFIG.label4;
$.label3.text = CONFIG.label3;
$.label2.text = CONFIG.label2;
$.label1.text = CONFIG.label1;
$.rightDate.text = Date(CONFIG.created);
//$.objectTable.add(view);