var APP = require("core");
var COMMONS = require("ca-commons");
var CONFIG = arguments[0] || {};
var VALUES = CONFIG.values || {};
var LISTS_MODEL = require("models/ca-lists")();
var LIST_ITEMS_MODEL = require("models/ca-list-items")();

$.init = function() {
	Ti.API.log("debug","edit_access_bundle CONFIG");
	Ti.API.log("debug",CONFIG);
	$.bundleItemName.text = CONFIG.bundle_code;
	//APP.log("debug", CONFIG.content.elements_in_set);

	LISTS_MODEL.init();
	LIST_ITEMS_MODEL.init();

	$.fetch();

	Ti.API.log("LIST_ITEMS_MODEL.getAllData()");
	Ti.API.log(LIST_ITEMS_MODEL.getAllData());

	$.bundleItemElements.height = 1;
	$.bundleItemElements.visible = false;
	$.value.text = VALUES;
};

$.fetch = function() {
	// Initializing lists model
	var model_lists_url = APP.Settings.CollectiveAccess.urlBase+"/"+APP.Settings.CollectiveAccess.urlForLists.url;
	var model_lists_cache_validity = APP.Settings.CollectiveAccess.urlForLists.cache;
	if(COMMONS.isCacheValid(model_lists_url,model_lists_cache_validity)) {
		APP.log("debug", "cache valid for item lists model");
	} else {
		APP.log("debug", "Item lists model fetch");
		LISTS_MODEL.fetch({
			url: model_lists_url,
			authString: APP.authString,
			cache: 0,
			callback: function() {
				Ti.API.log("debug","ca-lists.fetch callback");
			},
			error: function() {
				Ti.API.log("debug","ca-lists.fetch error");
			}
		});
	}
	var model_list_items_url = APP.Settings.CollectiveAccess.urlBase+"/"+APP.Settings.CollectiveAccess.urlForListItems.url.replace(/LISTCODE/g,"access_statuses");
	var model_list_items_cache_validity = APP.Settings.CollectiveAccess.urlForListItems.cache;
	if(COMMONS.isCacheValid(model_list_items_url,model_list_items_cache_validity)) {
		APP.log("debug", "cache valid for list items model");
	} else {
		APP.log("debug", "List items model fetch");
		LIST_ITEMS_MODEL.fetch({
			url: model_list_items_url,
			authString: APP.authString,
			cache: 0,
			callback: function() {
				Ti.API.log("debug","ca-list-items.fetch callback");
			},
			error: function() {
				Ti.API.log("debug","ca-list-items.fetch error");
			}
		});
	}
}

/*
 *  Handlers
 */

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