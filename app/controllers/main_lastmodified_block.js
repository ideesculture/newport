/**
 * Controller for a last modified block in the right panel
 * 
 * @class Controllers.text
 * @uses core
 */
var APP = require("core");
var CONFIG = arguments[0];
var MOMENT = require('alloy/moment');  

var created = MOMENT.unix(CONFIG.created).format("dddd D, MMMM YYYY");
//APP.log("debug","Adding lastmodified block: "+CONFIG.label1+" ("+created+")");

// Adding recent items to right panel
//var view = Alloy.createController("main_lastmodified_block_folderrow", {id:43}).getView();
//APP.log("debug",$.itemTreeTable.children);
//$.label3.text = CONFIG.label3;
if(CONFIG.label4 === null) { $.itemTreeTable.remove($.parent3);} else { $.label4.text = CONFIG.label4 ; }
if(CONFIG.label3 === null) { $.itemTreeTable.remove($.parent2);} else { $.label3.text = CONFIG.label3 ; }
if(CONFIG.label2 === null) { $.itemTreeTable.remove($.parent1); } else { $.label2.text = CONFIG.label2 ; }
//$.itemTreeTable.remove($.parent3);
//$.label2.text = CONFIG.label2;
$.label1.text = CONFIG.label1;
$.rightDate.text = created;
//$.objectTable.add(view);