/**
 * Controller for the text screen
 *
 * @class Controllers.text
 * @uses core
 */
var APP = require("core");
var UTIL = require("utilities");
var DATE = require("alloy/moment");
var LISTS_MODEL = require("models/ca-lists")();
var LIST_ITEMS_MODEL = require("models/ca-list-items")();
var BUFFER = require("ca-editbuffer");
var CONFIG = arguments[0];
var LISTCODE = "";

$.init = function() {
    APP.log("debug","edit_metadata_element_list CONFIG");
    APP.log("debug",CONFIG);

    var value=0;

    // Defining value, activating or disabling textarea depending of fieldHeight, must be done before init to be available for Handlers
	if (typeof CONFIG.item_id != "undefined") {
			value = CONFIG.item_id;
	};

    var list_id = CONFIG.content.list_id;
    LISTCODE = LISTS_MODEL.getListCodeFromListID(list_id);

    $.label.text=CONFIG.content.display_label;


    LIST_ITEMS_MODEL.init();

    $.fetch();

    var listValues = LIST_ITEMS_MODEL.getAllDataFromList(list_id);

    listTableData = [];
    var selected = -1;

    Ti.API.log("debug","listValues");
    Ti.API.log("debug",listValues);

    for (var num in listValues) {
        var row = Ti.UI.createTableViewRow({
            title:listValues[num].display_label,
            backgroundSelectedColor:Alloy.Globals.primaryColor
        });
        Ti.API.log("debug","searching for list value "+value);
        //Ti.API.log("debug",listValues[num].item_value);
        Ti.API.log("debug",listValues[num]);

        if(listValues[num].item_value == value) {
            Ti.API.log("debug","current value for list is "+listValues[num].display_label);
            //$.accessTable.selectRow(num);
            selected = num;
            //row.setBackgroundColor(Alloy.Globals.primaryColor);
        }
        listTableData.push(row);
    }
    $.listTable.setData(listTableData);
    if(selected >= 0) {
        $.listTable.selectRow(selected);
    }

}

$.fetch = function() {

	var model_list_items_url = APP.Settings.CollectiveAccess.urlBase+"/"+APP.Settings.CollectiveAccess.urlForListItems.url.replace(/LISTCODE/g,LISTCODE);
	var model_list_items_cache_validity = APP.Settings.CollectiveAccess.urlForListItems.cache;
	/*if(COMMONS.isCacheValid(model_list_items_url,model_list_items_cache_validity)) {
		APP.log("debug", "cache valid for list items model");
	} else {
		APP.log("debug", "List items model fetch");*/
		Ti.API.log("debug","LIST_ITEMS_MODEL.fetch");
		LIST_ITEMS_MODEL.fetch({
			url: model_list_items_url,
			authString: APP.authString,
			listcode:LISTCODE,
			cache: 0,
			callback: function() {
				Ti.API.log("debug","ca-list-items.fetch callback");
			},
			error: function() {
				Ti.API.log("debug","ca-list-items.fetch error");
			}
		});
	//}
}

$.init();
