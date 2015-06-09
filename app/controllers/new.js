/**
 * Controller for the typechoice screen
 * 
 * @class Controllers.new_typechoice
 * @uses core
 */
var APP = require("core");
var MODEL_MODEL = require("models/ca-model")();
var CONFIG = arguments[0];
var COMMONS = require("ca-commons");
/**
 * Initializes the controller
 */
$.init = function() {
	APP.log("debug", "new.init");
	if(!Ti.UI.createEmailDialog().isSupported) {
		$.container.remove($.logs_table);
	}

	////////////////MODEL CALL, TO POPULATE THE OBJECT TYPES LIST//////////////////////////

	// loading url & cache validity from settings
	CONFIG.validity = APP.Settings.CollectiveAccess.urlForHierarchy.cache;
		// Initiating CA db model class
	MODEL_MODEL.init("ca_objects");
	// Loading CA database model (metadatas & fields) & filling cache
	CONFIG.model_url = APP.Settings.CollectiveAccess.urlForModel.url;
	CONFIG.model_url_validity = APP.Settings.CollectiveAccess.urlForModel.cache;
	$.modelRetrieveData();

	$.copyright.text = APP.LEGAL.COPYRIGHT + " v" + APP.VERSION;
	
	//CODE TO SHOW OR HIDE THE NAVIGATION BAR
	$.NavigationBar.setBackgroundColor(APP.Settings.colors.primary);

	if(APP.Settings.useSlideMenu) {
		$.NavigationBar.showMenu(function(_event) {
			APP.toggleMenu();
		});
	} else {
		$.NavigationBar.showBack(function(_event) {
			APP.removeChild(true);
		});
	}
};


/**
 * Retrieves the model data
 * @param {Object} _force Whether to force the request or not (ignores cached data)
 * @param {Object} _callback The function to run on data retrieval
 */
$.modelRetrieveData = function(_force, _callback) {
	if(COMMONS.isCacheValid(CONFIG.model_url,CONFIG.model_url_validity)) {
		APP.log("debug","ca-model cache is valid");
	} else {
		APP.log("debug","ca-model cache is invalid");		
	};

	MODEL_MODEL.fetch({
		url: CONFIG.model_url,
		authString: APP.authString,
		cache: 0,
		callback: function() {
			$.modelRetrieveCallbackFunctions();	

			if(typeof _callback !== "undefined") {
				_callback();
			}
		},
		error: function() {
			$.updateRightButtonRefresh();
			Ti.API.log("debug","Connexion failed. Please retry.");
			if(typeof _callback !== "undefined") {
				_callback();
			}
		}
	});
	
};
//dynamically generates the list of available object types
$.modelRetrieveCallbackFunctions = function () {
	var types = MODEL_MODEL.getObjectTypes(); 
	var data = [], title;

	for(var rec_type in types) {
		title = types[rec_type] ;
		data.push(createRow(title));
	}
	$.types_table.setData(data);
 }

function createRow(title) {
    var tvr = Ti.UI.createTableViewRow({
        title : title
    });
	tvr.addEventListener("click", function(_event) {
		APP.addChild("new_step2", { type: title }, true);
	});
 
    return tvr;
}


// Kick off the init
$.init();