

var APP = require("core");
var COMMONS = require("ca-commons");
var CONFIG = arguments[0];

$.init = function() {
	$.someLabel.text = "New entity: "; 
	$.labelfield.value = CONFIG.display_label; 

};

$.backgroundView.addEventListener('click', function () {
	    CONFIG.container.close();
});

$.init(); 