//row for a result of an entity search (relations)

var APP = require("core");
var CONFIG = arguments[0];

$.init = function() {

	$.label.text=CONFIG.display_label; 

	APP.log("debug", CONFIG.display_label); 


}

$.init();