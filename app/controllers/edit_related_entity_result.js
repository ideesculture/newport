//row for a result of an entity search (relations)

var APP = require("core");
var CONFIG = arguments[0];

$.init = function() {

	$.label.text=CONFIG.display_label; 


}

var selected = function(_field) {

	Ti.App.fireEvent('event_entitySelected', {
		name: 'selected',
		config: CONFIG,
		value: CONFIG.entity_id
	});

};

$.entityRow.addEventListener('click', function() {
	APP.log("fire ! ! !");
	selected($.entityRow);
});

$.init();