/**
 * Controller for objects
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
var COMMONS = require("ca-commons");

var CONFIG = arguments[0];
var value ="";
var max_results = 3;
var clickWasOnceDone = false;
$.TABLE = "ca_objects";

$.init = function() {
	// Defining value, activating or disabling textarea depending of fieldHeight, must be done before init to be available for Handlers
	if (typeof CONFIG.value == "string") {
			value = CONFIG.value;
	};

	// Initiating CA db model class

	$.moreResultsButton.hide();
	$.objectsResearchResultsContainer.hide();
	// Field title
	$.label.text=CONFIG.content.display_label+" "+CONFIG.i+" "+CONFIG.j;
	$.objectfield.value = value;
	$.notes.text = "";
	//$.objectfield.addEventListener('change', $.search);
	max_results = 3;

	//APP.ca_login="administrator";
	//APP.ca_password="admin";
	//APP.authString = 'Basic ' +Titanium.Utils.base64encode(APP.ca_login+':'+APP.ca_password);
	//CONFIG.url = APP.Settings.CollectiveAccess.urlForobjectInfos.url;
	// Initiating CA db model class
	//var info1 = APP.Settings.CollectiveAccess.urlForHierarchy.info1;
	//var info2 = APP.Settings.CollectiveAccess.urlForHierarchy.info2;
	//HIERARCHY_MODEL.init($.TABLE, info1, info2); useless??

	$.searchButton.addEventListener("click", $.search);
};

$.fire = function(_data) {
	$.objectsResearchResults.setData([]);
	$.objectsResearchResultsContainer.hide();
	$.moreResultsButton.hide();
	max_results = 3;
	//in value we want the id of the object
	/*APP.log("debug", "config.content:");
	APP.log("debug", CONFIG.content);
	APP.log("debug", "e.config:");
	APP.log("debug", e.config);*/
	var laconfig = CONFIG;

	//problem with local search, field is called "type_id"
	if(_data["ca_objects.type_id"]){
		_data.type_id = _data["ca_objects.type_id"];
	}
	laconfig.content = _data;

	//fills the field with selected object's display label
	$.objectfield.value = _data.display_label;
	clickWasOnceDone = false;
	//HERE we have to save infos about the related object
	Ti.App.fireEvent('event_haschanged', {
		name: 'bar',
		config: laconfig,
		value: _data.object_id
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
	$.objectsResearchResults.data = [];
	//$.objectsResearchResults.removeAllChildren();
	// If we have data to display...
	if( typeof _data.results === 'object'){
		//APP.log("debug", _data.results);
		var max = 0, object_nb;
		if(_data.results.length> max_results){
			max = max_results;
		}
		else {
			max = _data.results.length;
		}

		for (object_nb = 0; object_nb < max;  object_nb ++ ) {
			//APP.log("debug", "resultat "+ );
			table.push(createRow(_data.results[object_nb]));
		}
		$.objectsResearchResults.setData(table);
		$.objectsResearchResultsContainer.show();
		$.objectsResearchResults.show();

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
		$.objectsResearchResultsContainer.hide();
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
	$.objectsResearchResults.data = [];
	//$.objectsResearchResults.removeAllChildren();
	// If we have data to display...
	if( typeof _data == 'object'){
		var max = 0, object_nb = 0, i=0;

		for(object_nb in _data)	i++;
		APP.log("debug", i + " lines ...");
		if(i > max_results){
			max = max_results;
		}
		else {
			max = i;
		}
		object_nb = 1;
		for (object_nb = 1; object_nb <= max;  object_nb ++ ) {
		//for(object_nb in _data){
			APP.log("debug", "resultat "+ object_nb);
			//APP.log("debug", _data[object_nb]);
			table.push(createRow(_data[object_nb]));
		}
		$.objectsResearchResults.setData(table);
		$.objectsResearchResultsContainer.show();
		$.objectsResearchResults.show();

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
		$.objectsResearchResultsContainer.hide();
		$.notes.text = "no results";
	}
	APP.closeLoading();
}


$.search = function(e){
	APP.openLoading();
	$.objectsResearchResultsContainer.hide();
	var _url = APP.Settings.CollectiveAccess.urlBase+"/"+APP.Settings.CollectiveAccess.urlForObjectSearch.url.replace(/<your_query>/g, $.objectfield.value);
	max_results = 3;

	if (Titanium.Network.networkType !== Titanium.Network.NETWORK_WIFI ) {
			var result = HIERARCHY_MODEL.getSearchedRecordsLocally($.TABLE, e.value);
	} else {
		var result = HIERARCHY_MODEL.getSearchedRecords($.TABLE, e.value, _url, $.handleData);
	}

	return result;


};



$.validate = function () {
	//TODO

};

$.update = function () {

};


$.init();
