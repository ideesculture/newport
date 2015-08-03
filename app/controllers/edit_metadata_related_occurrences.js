/**
 * Controller for occu
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
var OCCU_MODEL = require("models/ca-occurrences")();
var COMMONS = require("ca-commons");

var CONFIG = arguments[0];
var value ="";
var max_results = 3; 
var clickWasOnceDone = false; 
var newoccuEventId; 
var 	myModal = Ti.UI.createWindow({
	    title           : 'My Modal',
	    backgroundColor : 'transparent'
	});

$.TABLE = "ca_occurrences";

$.init = function() {
	// Defining value, activating or disabling textarea depending of fieldHeight, must be done before init to be available for Handlers
	if (typeof CONFIG.value == "string") {
			value = CONFIG.value;
	};

	// Initiating CA db model class

	OCCU_MODEL.init($.TABLE);
	$.moreResultsButton.hide(); 
	$.occuResearchResultsContainer.hide(); 
	// Field title
	$.label.text=CONFIG.content.display_label+" "+CONFIG.i+" "+CONFIG.j; 
	$.occufield.value = value;
	$.notes.text = "";
	//$.occufield.addEventListener('change', $.search);
	max_results = 3; 

	APP.ca_login="administrator";
	APP.ca_password="admin";
	APP.authString = 'Basic ' +Titanium.Utils.base64encode(APP.ca_login+':'+APP.ca_password);
	CONFIG.url = APP.Settings.CollectiveAccess.urlForOccurrenceInfos.url;
	//occu_MODEL.fetch();
	if(!COMMONS.isCacheValid(CONFIG.url,CONFIG.validity)) {
		OCCU_MODEL.fetch({
			url: CONFIG.url,
			authString: APP.authString,
			cache: 0,
			callback: null,
			error: function() {
				var dialog = Ti.UI.createAlertDialog({
				    message: 'ERROR while updating occu list: Connexion failed. The list of occu may be outdated.',
				    ok: 'OK',
				    title: 'Error'
				  }).show();
			}
		});
	}
	$.searchButton.addEventListener("click", $.search); 
};

$.fire = function(_data) {
	$.occuResearchResults.setData([]); 
	$.occuResearchResultsContainer.hide(); 
	$.moreResultsButton.hide(); 
	max_results = 3; 
	//in value we want the id of the occu
	/*APP.log("debug", "config.content:");
	APP.log("debug", CONFIG.content);
	APP.log("debug", "e.config:");
	APP.log("debug", e.config);*/
	var laconfig = CONFIG; 

	//problem with local search, field is called "type_id" 
	if(_data["ca_occurrences.type_id"]){
		_data.type_id = _data["ca_occurrences.type_id"];
	}
	laconfig.content = _data; 

	//fills the field with selected occu's display label
	$.occufield.value = _data.display_label;
	APP.log("debug", "fire occu!!!");
	APP.log("debug", laconfig);
	clickWasOnceDone = false; 
	//HERE we have to save infos about the related occu
	Ti.App.fireEvent('event_haschanged', {
		name: 'bar',
		config: laconfig,
		value: _data.occurrence_id
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

$.createNewoccu = function(){
	$.notes.removeEventListener('click', $.listen);
	//alert("hello"); 
	var modal_info = {
			display_label : $.occufield.value,
			container: myModal, 
			config: CONFIG
	}
	var modal_view = Alloy.createController('edit_modal_occu',modal_info);
    myModal.add(modal_view.getView());
	myModal.open({
    	animate : true, 
	});
}

$.listen = function(){
	$.createNewoccu();
}

$.handleData = function(_data) {
	//afficher une barre de chargement par dessus les résultats?? 
	APP.log("debug", _data.results);
	$.notes.text = "";
	var table = [];
	$.moreResultsButton.hide(); 
	$.occuResearchResults.data = []; 
	//$.occuResearchResults.removeAllChildren(); 
	// If we have data to display...
	if( typeof _data.results === 'object'){
		//APP.log("debug", _data.results);
		var max = 0, occu_nb;
		if(_data.results.length> max_results){
			max = max_results;
		}
		else {
			max = _data.results.length;
		}
		 
		for (occu_nb = 0; occu_nb < max;  occu_nb ++ ) {
			//APP.log("debug", "resultat "+ );
			table.push(createRow(_data.results[occu_nb]));
		}
		$.occuResearchResults.setData(table);
		$.occuResearchResultsContainer.show();
		$.occuResearchResults.show();

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
		$.occuResearchResultsContainer.hide(); 
		//$.notes.text = "no results. Create " + $.occufield.value + " ? ";
		//newoccuEventId = $.notes.addEventListener("click", $.listen );
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
	$.occuResearchResults.data = []; 
	//$.occuResearchResults.removeAllChildren(); 
	// If we have data to display...
	if( typeof _data == 'object'){
		var max = 0, occu_nb = 0, i=0;

		for(occu_nb in _data)	i++;
		APP.log("debug", i + " lines ...");
		if(i > max_results){
			max = max_results;
		}
		else {
			max = i;
		}
		occu_nb = 1;
		for (occu_nb = 1; occu_nb <= max;  occu_nb ++ ) {
		//for(occu_nb in _data){
			APP.log("debug", "resultat "+ occu_nb);
			//APP.log("debug", _data[occu_nb]);
			table.push(createRow(_data[occu_nb]));
		}
		$.occuResearchResults.setData(table);
		$.occuResearchResultsContainer.show();
		$.occuResearchResults.show();

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
		$.occuResearchResultsContainer.hide(); 
		//$.notes.text = "no results. Create " + $.occufield.value + " ? ";
		//newoccuEventId = $.notes.addEventListener("click", $.listen );
		$.notes.text = "no results";
	}
	APP.closeLoading();
}


$.search = function(e){
	APP.openLoading();
	$.occuResearchResultsContainer.hide(); 
	var _url = APP.Settings.CollectiveAccess.urlForOccurrenceSearch.url.replace(/<your_query>/g, $.occufield.value);
	max_results = 3; 
	//if(e.value.length >= 3) {
	if (Titanium.Network.networkType !== Titanium.Network.NETWORK_WIFI ) {
		var result = OCCU_MODEL.getSearchedRecordsLocally($.TABLE, $.occufield.value, $.handleLocalData);

	} else {
		var result = OCCU_MODEL.getSearchedRecords($.TABLE, e.value, _url, $.handleData);
	}
	return result; 


};

Ti.App.addEventListener('occuCreated', function(e) {
	$.notes.text = "occu created!";
	$.occufield.value = e.value; 
});



$.validate = function () {
	//TODO

};

$.update = function () {

};


$.init();


