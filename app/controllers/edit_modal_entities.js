

var APP = require("core");
var COMMONS = require("ca-commons");

var ENTITY_MODEL = require("models/ca-entities")();

var CONFIG = arguments[0];

$.TABLE = "ca_entities";
var ENTITY_DATA = {};

//Takes the long model-JSON and makes a clean table of entity types
$.makesATable = function(_data){
	var tempObj = {}, table = {}, record_type;
	if(_data.ok == true) {
	// Browsing data
	    for (var prop in _data) {
	    	 if(prop != "ok") {
				record_type = prop;
				var _data2 = _data[prop];
				for (var prop2 in _data2) {
					if(prop2 == "type_info") {

						var type_info_data = _data2[prop2];
						for(var info in type_info_data){
		        			if(info=="item_id"){
		        				tempObj.item_id=type_info_data[info];
		        			}
		        			if(info=="item_value"){
		        				tempObj.item_value=type_info_data[info];
		        			}
		        			if(info=="display_label"){
		        				tempObj.display_label=type_info_data[info];
		        			}
		        		}//END for propriété type_info
		        		table[record_type] = tempObj;
		        		record_type = "";
		        		tempObj = {};
		        	}//END IF prop2= type_info
		        }//END for prop2 (type_info, elements, ...)
		    }//END if prop!=ok (prop = tous les types d'entités un après l'autre)
		}//END for prop in data
	}//END IF data.ok = true (==> retour du modèle OK)
	return table;
}
$.handleTypesData = function(_data){
	var entity_types = $.makesATable(_data);
	var data = [];
	for(var type in entity_types) {
		var tvr = Ti.UI.createTableViewRow({
	        title : entity_types[type].display_label,
	        entity_data : entity_types[type]
	    });
	    tvr.addEventListener("click", function(_event) {
	    	//alert(this.title);
			ENTITY_DATA.type_info = {};
			ENTITY_DATA.type_info = this.entity_data;
			this.backgroundColor = "blue";
		});
		data.push(tvr);
	}
	$.typestable.setData(data);
}
$.success = function(_data){
	//Data only contains "ok: true" + entity_id
	//alert("entité créée: " + _data.entity_id);
	var laconfig = CONFIG.config;
	var tempObj = {};
	tempObj.type_id = ENTITY_DATA.type_info.item_id;
	laconfig.content = tempObj;
	//APP.log("debug", laconfig);
	Ti.App.fireEvent('event_haschanged', {
		name: 'grilloo',
		config: laconfig,
		value: _data.entity_id
	});
	Ti.App.fireEvent('entityCreated', {
		name: 'lalala',
		config: laconfig,
		value: $.labelfield.value
	});
	CONFIG.container.close();
}

$.init = function() {
	$.someLabel.text = "New entity: ";
	$.labelfield.value = CONFIG.display_label;

	//ENTITY_MODEL.init was done previously (in edit_metadata_related_entities)
	CONFIG.url = APP.Settings.CollectiveAccess.urlBase+"/"+APP.Settings.CollectiveAccess.urlForEntityModel.url;
	ENTITY_MODEL.init($.TABLE);
	ENTITY_MODEL.getEntityTypes( CONFIG.url, $.handleTypesData);

	$.saveButton.addEventListener("click", function(_event) {
		ENTITY_MODEL.createsNewEntity( $.labelfield.value, ENTITY_DATA.type_info.item_id , $.success );
	});
};

$.backgroundView.addEventListener('click', function () {
	    CONFIG.container.close();
});



$.init();
