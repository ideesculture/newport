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
var ENTITY_MODEL = require("models/ca-entities")();
var COMMONS = require("ca-commons");

var CONFIG = arguments[0];
var value ="";
var max_results = 3; 
var clickWasOnceDone = false; 

$.TABLE = "ca_entities";

$.init = function() {
	// Defining value, activating or disabling textarea depending of fieldHeight, must be done before init to be available for Handlers
	if (typeof CONFIG.value == "string") {
			value = CONFIG.value;
	};

	// Initiating CA db model class
	//var info1 = APP.Settings.CollectiveAccess.urlForHierarchy.info1;
	//var info2 = APP.Settings.CollectiveAccess.urlForHierarchy.info2;
	ENTITY_MODEL.init($.TABLE);
	$.moreResultsButton.hide(); 
	$.entitiesResearchResultsContainer.hide(); 
	// Field title
	$.label.text=CONFIG.content.display_label+" "+CONFIG.i+" "+CONFIG.j; 
	$.entityfield.value = value;
	$.notes.text = "";
	//$.entityfield.addEventListener('change', $.search);
	max_results = 3; 

	APP.ca_login="administrator";
	APP.ca_password="admin";
	APP.authString = 'Basic ' +Titanium.Utils.base64encode(APP.ca_login+':'+APP.ca_password);
	CONFIG.url = APP.Settings.CollectiveAccess.urlForEntityInfos.url;
	//ENTITY_MODEL.fetch();
	if(!COMMONS.isCacheValid(CONFIG.url,CONFIG.validity)) {
		ENTITY_MODEL.fetch({
			url: CONFIG.url,
			authString: APP.authString,
			cache: 0,
			callback: null,
			error: function() {
				var dialog = Ti.UI.createAlertDialog({
				    message: 'ERROR while updating entities list: Connexion failed. The list of entities may be outdated.',
				    ok: 'OK',
				    title: 'Error'
				  }).show();
			}
		});
	}
	$.searchButton.addEventListener("click", $.search); 
};

$.fire = function(_data) {
	$.entitiesResearchResults.setData([]); 
	$.entitiesResearchResultsContainer.hide(); 
	$.moreResultsButton.hide(); 
	max_results = 3; 
	//in value we want the id of the entity
	/*APP.log("debug", "config.content:");
	APP.log("debug", CONFIG.content);
	APP.log("debug", "e.config:");
	APP.log("debug", e.config);*/
	var laconfig = CONFIG; 

	//problem with local search, field is called "type_id" 
	if(_data["ca_entities.type_id"]){
		_data.type_id = _data["ca_entities.type_id"];
	}
	laconfig.content = _data; 

	//fills the field with selected entity's display label
	$.entityfield.value = _data.display_label;
	clickWasOnceDone = false; 
	//HERE we have to save infos about the related entity
	Ti.App.fireEvent('event_haschanged', {
		name: 'bar',
		config: laconfig,
		value: _data.entity_id
	});

}

function createRow(data) {
	var title = data.display_label ;
    var tvr = Ti.UI.createTableViewRow({
        title : title
    });

    tvr.addEventListener('click', function() {
		$.fire(data); 
	});
 
    return tvr;
}

$.handleData = function(_data) {
	//afficher une barre de chargement par dessus les résultats?? 
	APP.log("debug", _data.results);
	$.notes.text = "";
	var table = [];
	$.moreResultsButton.hide(); 
	$.entitiesResearchResults.data = []; 
	//$.entitiesResearchResults.removeAllChildren(); 
	// If we have data to display...
	if( typeof _data.results === 'object'){
		//APP.log("debug", _data.results);
		var max = 0, entity_nb;
		if(_data.results.length> max_results){
			max = max_results;
		}
		else {
			max = _data.results.length;
		}
		 
		for (entity_nb = 0; entity_nb < max;  entity_nb ++ ) {
			//APP.log("debug", "resultat "+ );
			table.push(createRow(_data.results[entity_nb]));
		}
		$.entitiesResearchResults.setData(table);
		$.entitiesResearchResultsContainer.show();
		$.entitiesResearchResults.show();

		if( max < _data.results.length){
			$.moreResultsButton.show();

			if(!clickWasOnceDone){
				clickwasOnceDone = true; 
				$.moreResultsButton.addEventListener("click", function(_event) {
						max_results = _data.results.length; 
						$.handleData(_data); 
				});
			}
		}
	}
	else 
	{ 
		$.entitiesResearchResultsContainer.hide(); 
		$.notes.text = "no results";
	}
	APP.closeLoading();
}

$.handleLocalData = function(_data) {
	//afficher une barre de chargement par dessus les résultats?? 
	//APP.log("debug", _data);
	APP.log("debug", typeof _data);
	APP.log("debug", _data.length);
	$.notes.text = "";
	var table = [];
	$.moreResultsButton.hide(); 
	$.entitiesResearchResults.data = []; 
	//$.entitiesResearchResults.removeAllChildren(); 
	// If we have data to display...
	if( typeof _data == 'object'){
		APP.log("debug", 'if is won ! !');
		var max = 0, entity_nb = 0, i=0;

		for(entity_nb in _data)	i++;
		APP.log("debug", i + " lines ...");
		if(i > max_results){
			max = max_results;
		}
		else {
			max = i;
		}
		entity_nb = 1;
		for (entity_nb = 1; entity_nb <= max;  entity_nb ++ ) {
		//for(entity_nb in _data){
			APP.log("debug", "resultat "+ entity_nb);
			//APP.log("debug", _data[entity_nb]);
			table.push(createRow(_data[entity_nb]));
		}
		$.entitiesResearchResults.setData(table);
		$.entitiesResearchResultsContainer.show();
		$.entitiesResearchResults.show();

		if( max < i ){  // max = max_results < i
			$.moreResultsButton.show();

			if(!clickWasOnceDone){
				clickwasOnceDone = true; 
				$.moreResultsButton.addEventListener("click", function(_event) {
						max_results = i; 
						$.handleLocalData(_data); 
				});
			}
		}
	}
	else 
	{ 
		$.entitiesResearchResultsContainer.hide(); 
		$.notes.text = "no results";
	}
	APP.closeLoading();
}


$.search = function(e){
	APP.openLoading();
	$.entitiesResearchResultsContainer.hide(); 
	var _url = APP.Settings.CollectiveAccess.urlForEntitySearch.url.replace(/<your_query>/g, $.entityfield.value);
	max_results = 3; 
	//if(e.value.length >= 3) {
	if (Titanium.Network.networkType !== Titanium.Network.NETWORK_WIFI ) {
		var result = ENTITY_MODEL.getSearchedRecordsLocally($.TABLE, $.entityfield.value, $.handleLocalData);

	} else {
		var result = ENTITY_MODEL.getSearchedRecords($.TABLE, e.value, _url, $.handleData);
	}
	return result; 


};




$.validate = function () {
	//TODO

};

$.update = function () {

};


$.init();


