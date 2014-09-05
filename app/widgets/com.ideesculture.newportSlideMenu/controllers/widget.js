/**
 * The slide menu widget
 * 
 * @class Widgets.com.ideesculture.newportSlideMenu
 */
var sections = [];
var nodes = [];
var color;
var selected;

/**
 * Initializes the slide menu
 * @param {Object} _params
 * @param {Array} _params.nodes The nodes (menu items) to show in the side menu as defined by the JSON configuration file
 * @param {Object} _params.color The background color for menu icons
 */
$.init = function(_params) {
	nodes = [];
	downNodes = [];
	color = typeof _params.color !== "undefined" ? _params.color : "#327B9F";

	for(var i = 0; i < _params.nodes.length; i++) {

		var tab = Ti.UI.createTableViewRow({
			id: _params.nodes[i].id,
			height: "60dp",
			backgroundcolor: "yellow",
			backgroundSelectedColor: color,
			selectedBackgroundColor: color
		});

		if(_params.nodes[i].image) {
			var icon = Ti.UI.createImageView({
				image: _params.nodes[i].image,
				width: "80dp",
				height: "60dp",
				top: "0dp",
				left: "0dp",
				touchEnabled: false,
				preventDefaultImage: true,
				backgroundColor: "darkgray"
			});

			tab.add(icon);
		}

		// depending on downTab true or false, node goes up or down in the slideMenu
		if(_params.nodes[i].downTab) {
			downNodes.push(tab);
		} else {
			nodes.push(tab);
		}
		
	}

	if(nodes.length > 0) {
		$.Nodes.setData(nodes);
	}

	if(downNodes.length > 0) {
		$.DownNodes.setData(downNodes);
	}

	// We have to remove before adding to make sure we're not duplicating
	$.Nodes.removeEventListener("click", handleClick);
	$.Nodes.addEventListener("click", handleClick);
	$.DownNodes.removeEventListener("click", handleDownClick);
	$.DownNodes.addEventListener("click", handleDownClick);
};

/**
 * Handles a click event on the nodes container
 * @param {Object} _event The event
 */
function handleClick(_event) {
	if(typeof _event.index !== "undefined") {
		$.setIndex(_event.index);
	}
};

/**
 * Handles a click event on the nodes container
 * @param {Object} _event The event
 */
function handleDownClick(_event) {
	if(typeof _event.index !== "undefined") {
		$.setDownIndex(_event.index);
	}
};

/**
 * Clears all items from the side menu
 */
$.clear = function() {
	$.Nodes.setData([]);
	$.Nodes.removeAllChildren();
};

/**
 * Sets the indexed item as active
 * @param {Object} _index The index of the item to show as active
 */
$.setDownIndex = function(_index) {
	$.DownNodes.selectRow(_index);
	$.selected = _index;
};

/**
 * Sets the indexed item as active
 * @param {Object} _index The index of the item to show as active
 */
$.setIndex = function(_index) {
	$.Nodes.selectRow(_index);
};

// Move the UI down if iOS7+
if(OS_IOS && parseInt(Ti.Platform.version.split(".")[0], 10) >= 7) {
	$.Nodes.top = "20dp";
}