var APP = require("core");
var UTIL = require("utilities");
var DATE = require("alloy/moment");
var BUFFER = require("ca-editbuffer");
var HTTP = require("http");
var COMMONS = require("ca-commons");
var HIERARCHY_MODEL = require("models/ca-objects-hierarchy")();


var CONFIG = arguments[0];
var value ="";
$.TABLE = "ca_objects";

$.createRow = function (margin, table, textLabel, asArrow){
	var whitespace, row, label, arrow;
	//1)creates the table row
	row = Ti.UI.createTableViewRow({
	        layout: 'horizontal'
	});
	//2)adds a white space for variable left margin
	whitespace = Titanium.UI.createView({
        width: margin,
        height: 50,
        layout: 'vertical',
    });
    row.add(whitespace);
    //3)adds an arrow if needed
	if(asArrow){
		arrow = Ti.UI.createImageView({
			src : 'ti.ux.iconfont',
			icon : 'fa-chevron-right',
			size:'22' ,
			color: '#ccc'
		});
		row.add(arrow);
	}
    //4)adds a display label of the storage location
    label = Ti.UI.createLabel({
		  color: 'black',
		  backgroundColor: 'white',
		  font: { fontSize: 18 },
		  text: textLabel,
		  textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
		  top: 15,
		  left: 5,
		  width: Ti.UI.SIZE,
		  height: Ti.UI.SIZE
	});
	row.add(label);
	//4)adds the table row to the table
	table.push(row);
}

$.init = function() {
	$.bundleItemName.text = CONFIG.display_label;
	var parentsAndSon = HIERARCHY_MODEL.getParentRecords($.TABLE,CONFIG.obj_data.object_id);

	var margin = 0, table = [], whitespace, row, label, asArrow=false;

	//fills the parents table
	if(parentsAndSon.id4 != null) { // grand-papi
		//creates a row for grand-papi
		$.createRow(margin, table, parentsAndSon.label4, asArrow);
		//increments the margin
		margin+=30;
		asArrow= true;
	}
	if(parentsAndSon.id3 != null) { // papi
		//creates a row for papi
		$.createRow(margin, table, parentsAndSon.label3, asArrow);
		//increments the margin
		margin+=30;
		asArrow= true;
	}
	if(parentsAndSon.id2 != null) { // daddy
		//creates a row for daddy
		$.createRow(margin, table, parentsAndSon.label2, asArrow);
		//increments the margin
		margin+=30;
		asArrow= true;
	}
	if(parentsAndSon.id1 != null) { // CANT BE NULL
		//creates a row for current object
		$.createRow(margin, table, parentsAndSon.label1, asArrow);
	}
	$.hierarchyTable.setData(table);
};

// Folding bundle
$.bundleItem.addEventListener("click", function(_event) {
	APP.openLoading();
	setTimeout(function() {
		if ($.bundleItemElements.visible == true) {
			$.bundleItemElements.visible = false;
			$.bundleItemElements.height = 1;
			$.arrowIcon.image = "/icons/black/ca_arrow_down.png";
		} else {
			$.bundleItemElements.visible = true;
			$.bundleItemElements.height = Ti.UI.SIZE;
			$.arrowIcon.image = "/icons/black/ca_arrow_up.png";
		}
	},300);
	APP.closeLoading();

});

$.init();
