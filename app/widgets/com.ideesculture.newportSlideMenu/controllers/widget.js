/**
 * The slide menu widget
 *
 * @class Widgets.com.ideesculture.newportSlideMenu
 */
var sections = [];
var nodes = [];
// Variable to store the default color of the icon
var color;
// Variable to set the color of the icon in an active state
var activeColor;
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
	color = typeof _params.color !== "undefined" ? _params.color : "white";
	activeColor = typeof _params.activeColor !== "undefined" ? _params.activeColor : "blue";

	for(var i = 0; i < _params.nodes.length; i++) {

		var tab = Ti.UI.createTableViewRow({
			id: _params.nodes[i].id,
			height: "60dp",
			backgroundcolor: "yellow",
			backgroundSelectedColor: color,
			selectedBackgroundColor: color
		});

		if(_params.nodes[i].icon) {
			var args= {icon:'fa-'+_params.nodes[i].icon, left:'12', size:'50', height:'60', left:'15', color:'white', class:"faIcon", idno:_params.nodes[i].id+1 };
			var iconblock = Widget.createWidget('ti.ux.iconfont','widget', args).getView();
			if (_params.nodes[i].downTab == false) {
				iconblock.addEventListener("click", handleClick);
				$.Nodes.add(iconblock);
			} else {
				iconblock.addEventListener("click", handleDownClick);
				$.DownNodes.add(iconblock);
			}
		}
	}
};

/**
 * Handles a click event on the nodes container
 * @param {Object} _event The event
 */
function handleClick(_event) {
	if(typeof _event.source.idno !== "undefined") {
		$.setIndex(_event.source.idno - 1);
		for (i = _event.source.parent.children.length; i > 0; i--){
	        _event.source.parent.children[i - 1].setColor("white");
	    };
		_event.source.setColor(color);
	}
};

/**
 * Handles a click event on the nodes container
 * @param {Object} _event The event
 */
function handleDownClick(_event) {
	if(typeof _event.source.idno !== "undefined") {
		$.setDownIndex(_event.source.idno - 1);
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
	//$.DownNodes.selectRow(_index);
	Ti.API.log("debug","setDownIndex");
	//$.selected = _index;
};

/**
 * Sets the indexed item as active
 * @param {Object} _index The index of the item to show as active
 */
$.setIndex = function(_index) {
	Ti.API.log("debug","setIndex");
	//$.Nodes.selectRow(_index);
};

// Move the UI down if iOS7+
if(OS_IOS && parseInt(Ti.Platform.version.split(".")[0], 10) >= 7) {
	$.Nodes.top = "24dp";
}
