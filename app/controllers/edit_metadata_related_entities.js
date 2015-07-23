/**
 * Controller for entities
 * START VERSION - DOES NOT WORK PROPERLY
 * 
 * @class Controllers.text
 * @uses core
 */
var APP = require("core");
var UTIL = require("utilities");
var DATE = require("alloy/moment");
var BUFFER = require("ca-editbuffer");
var HTTP = require("http");
var HIERARCHY_MODEL = require("models/ca-objects-hierarchy")();

var CONFIG = arguments[0];
var value ="";

$.TABLE = "ca_entities";

$.init = function() {
	// Defining value, activating or disabling textarea depending of fieldHeight, must be done before init to be available for Handlers
	if (typeof CONFIG.value == "string") {
			value = CONFIG.value;
	};

	// Initiating CA db model class
	var info1 = APP.Settings.CollectiveAccess.urlForHierarchy.info1;
	var info2 = APP.Settings.CollectiveAccess.urlForHierarchy.info2;
	HIERARCHY_MODEL.init($.TABLE, info1, info2);
	$.moreResultsButton.hide(); 
	// Field title
	$.label.text=CONFIG.content.display_label+" "+CONFIG.i+" "+CONFIG.j; 
	$.notes.text= " "
	$.entityfield.value = value;

	$.entityfield.addEventListener('change', $.search);
};

$.handleData = function(_data) {
	//afficher une barre de chargement par dessus les résultats?? 
	//$.entitiesResearchResults.hide();
	$.moreResultsButton.hide(); 
	$.entitiesResearchResults.removeAllChildren(); 
	// If we have data to display...
	if( typeof _data.results === 'object'){
		//APP.log("debug", _data.results);
		var max = 0, entity_nb;
		if(_data.results.length>15){
			max = 15 ;
		}
		else {
			max = _data.results.length;
		}
		for (entity_nb = 0; entity_nb < max;  entity_nb ++ ) {
			//APP.log("debug", "resultat "+ i);
			var entity_row = Alloy.createController("edit_related_entity_result", _data.results[entity_nb]).getView();
			$.entitiesResearchResults.add(entity_row);
			entity_row.addEventListener('click', function() {
				$.entitiesResearchResults.removeAllChildren(); 
			});
		}

		if(max <_data.results.length){
			$.moreResultsButton.show();
		}
	}else 
	{ 
		APP.log("debug","no results :("); 
	}
	//$.entitiesResearchResults.show();
}

Ti.App.addEventListener('event_entitySelected', function(e) { 
	$.entitiesResearchResults.removeAllChildren(); 

	//in value we want the id of the entity
	/*APP.log("debug", "config.content:");
	APP.log("debug", CONFIG.content);
	APP.log("debug", "e.config:");
	APP.log("debug", e.config);*/
	var laconfig = CONFIG; 
	e.config.type_id = e.config["ca_entities.type_id"];
	laconfig.content = e.config; 

	//fills the field with selected entity's display label
	$.entityfield.value = e.config.display_label;

	//HERE we have to save infos about the related entity
	Ti.App.fireEvent('event_haschanged', {
		name: 'bar',
		config: laconfig,
		value: e.value
	});
});


$.search = function(e){
	var _url = APP.Settings.CollectiveAccess.urlForEntitySearch.url.replace(/<your_query>/g, e.value);

	if(e.value.length >= 3) {
		if (Titanium.Network.networkType !== Titanium.Network.NETWORK_WIFI ) {
			var result = HIERARCHY_MODEL.getSearchedRecordsLocally($.TABLE, e.value);

		} else {
			var result = HIERARCHY_MODEL.getSearchedRecords($.TABLE, e.value, _url, $.handleData);
		}
		return result; 
	}

};




$.validate = function () {
	//TODO

};

$.update = function () {

};

/*
 * HANDLERS
 */



$.init();


