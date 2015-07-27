/**
 * Collectiveaccess user interface for object edition model
 * 
 * @class Models.ca-model
 * @uses core
 * @uses http
 * @uses utilities
 */
var APP = require("core");
var HTTP = require("http");
var UTIL = require("utilities");
var DBNAME = "Newport";
var table =  "ca_entities";
var INFO1 = null;
var INFO2 = null;
	
function Model() {
	this.TABLE="";
	this.INFO1="";
	this.temp = {};

	/**
	 * Initializes the model
	 * @param {Number} _id The UID of the component
	 */
	this.init = function(_ca_table) {
		//APP.log("debug", "CA_HIERARCHY.init(" + _ca_table + ")");

		this.TABLE = _ca_table;
		//alert("info1 :"+ INFO1 + "  info2: "+ INFO2);
		var db = Ti.Database.open(DBNAME);

		//ONLY FOR DEBUG
		db.execute("BEGIN TRANSACTION;");
		db.execute("DROP TABLE IF EXISTS ca_entities ;");
		var request = "CREATE TABLE IF NOT EXISTS " + _ca_table + " (id INTEGER PRIMARY KEY AUTOINCREMENT, ca_table TEXT, entity_id INTEGER, idno TEXT, display_label TEXT, type_id INTEGER, created TEXT);";
		db.execute(request);
		db.execute("END TRANSACTION;");
		db.close();
	};


	this.clear = function(_ca_table) {
		//APP.log("debug", "CA_HIERARCHY.clear(" + _ca_table + ")");

		this.TABLE = _ca_table;
		var db = Ti.Database.open(DBNAME);
		var request = "DELETE FROM " + _ca_table + ";";
		db.execute(request);

		db.close();
	};
	/**
	 * Fetches the remote data
	 * @param {Object} _params The request paramaters to send
	 * @param {String} _params.url The URL to retrieve data from
	 * @param {Function} _params.callback The function to run on data retrieval
	 * @param {Function} _params.error The function to run on error
	 * @param {Number} _params.cache The length of time to consider cached data 'warm'
	 */
	this.fetch = function(_params) {
		//APP.log("debug", "CA_HIERARCHY.fetch");
		//APP.log("trace", UTIL.jsonStringify(_params));

		var isStale = UTIL.isStale(_params.url, _params.cache);
		//Ti.API.log("url:"+_params.url);
		if(isStale) {
			if(_params.cache !== 0 && isStale !== "new") {
				_params.callback();
			}

			HTTP.request({
				timeout: 30000,
				async:false,
				headers: [{name: 'Authorization', value: _params.authString}],
				type: "GET",
				format: "JSON",
				//format:"text",
				url: _params.url,
				passthrough: _params.callback,
				success: this.handleData,
				//success: this.echoData,
				failure: _params.error
			});
		} else {
			_params.callback();
		}
	};
	
	/**
	 * Useful to only log the data return when debugging
	 * @param {Object} _data The returned data
	 * @param {String} _url The URL of the remote source
	 * @param {Function} _callback The function to run on data retrieval
	 */
	this.echoData = function(_data, _url, _callback) {
		Ti.API.info(_data);
	};

	/**
	 * Handles the data return for OBJECTS
	 * some mechanism is missing for entities, occurrences and so on !
	 * @param {Object} _data The returned data
	 * @param {String} _url The URL of the remote source
	 * @param {Function} _callback The function to run on data retrieval
	 */
	this.handleData = function(_data, _url, _callback) {
		APP.log("debug", "CA_ENTITIES.handleData");
		if(_data.ok == true) {
			var db = Ti.Database.open(DBNAME);
			//db.execute("DELETE FROM " + _ca_table + ";");
			db.execute("BEGIN TRANSACTION;");
			
			//APP.ca_modele_prop = new Array();
		//	APP.ca_modele_values = {};
			var _data2;
			var last = 0;
			var ca_table = "ca_entities";
			var record_type;
			
			// Browsing data
		    for (var prop in _data) {
		    	var record_type = prop;
		        var _data2 = _data[prop];
		    	if(prop != "ok") {
		        	for (var prop2 in _data2) {
						var record = _data2[prop2];
		        		//Ti.API.log("debug", record);
		        		
		        		var request = "INSERT INTO " + ca_table + " (id, ca_table, entity_id, idno, display_label, type_id, created) VALUES (NULL, ?, ?, ?, ?, ?, ?);";
						db.execute(request, ca_table, record["entity_id"], record["id"], record["display_label"], record["ca_entities.type_id"], record["created"]["timestamp"]);

						//Ti.API.log("debug","#tuguduuu entity in da base: " + record["display_label"] );
						//Ti.API.log("debug", record["entity_id"]);
						//Ti.API.log("debug", record["id"]);
						//Ti.API.log("debug", record["display_label"]);
						//Ti.API.log("debug", record["ca_entities.type_id"]);
						//Ti.API.log("debug", record["created"]["timestamp"]);
		

		        		last = prop2;
	        		} 
		        }
		    }
		   // Ti.API.log("last");
		    //Ti.API.log(last);

			db.execute("INSERT OR REPLACE INTO updates (url, time) VALUES(" + UTIL.escapeString(_url) + ", " + new Date().getTime() + ");");
			db.execute("END TRANSACTION;");
			db.close();
		}
	};

	/**
	 * Retrieves first level info
	 */
	this.getModelFirstLevelInfo = function() {
		return APP.ca_modele_prop;
	};

	this.nbLines = function(_ca_table) {
		//APP.log("debug", "CA-HIERARCHY.nbLines");

		var db = Ti.Database.open(DBNAME),
			//request = "select ca_table, entity_id, parent_id, idno, display_label, date, created from ca_models where ca_table like '"+_ca_table,
			request = "select count(entity_id) as nb from "+_ca_table+" where ca_table like '"+_ca_table+"' group by 1",
			temp = [];
		var data = db.execute(request);
		var result = data.getRowCount();
		data.close();
		db.close();
		
		return result;
	};


	this.isCacheValid = function() {
		return false;
	}

	///////////////////////////////////////////////////////////
	//search locally 
	///////////////////////////////////////////////////////////
	this.getSearchedRecordsLocally = function(_ca_table, _text, _success_function) {

		APP.log("debug", "CA-ENTITIES.getSearchedRecords");

		//if no connection is available, searches in the local DB
		
		var db = Ti.Database.open(DBNAME);

		var request = "SELECT idno, entity_id, display_label, type_id FROM "+_ca_table+" WHERE display_label LIKE '"+_text+"%' ;";
		var data = db.execute(request);
		var fieldnumber = 0, linenumber = 1;


		while (data.isValidRow()) {
			this.temp[linenumber] = {};
			while (fieldnumber < data.getFieldCount()) {
				this.temp[linenumber][data.fieldName(fieldnumber)] = data.field(fieldnumber);
				fieldnumber++;
			}
			linenumber++;
			fieldnumber = 0;
			data.next();
		}

		data.close();
		db.close();
		//APP.log("debug", "resultat:");
		//APP.log("debug", this.temp);
		_success_function(this.temp); 
		return this.temp;
	};

	///////////////////////////////////////////////////////////
	//search remotely 
	///////////////////////////////////////////////////////////

	this.getSearchedRecords = function(_ca_table, _text, _url, _success_function) {
		// do a search with the WS 

		var error = function() {
			var dialog = Ti.UI.createAlertDialog({
			    message: 'HTTP request error, please retry',
			    ok: 'OK',
			    title: 'Error'
			  }).show();
		}
/*
		var handleData = function( _data){
			APP.log("debug", "this.temp");
			this.temp = _data["results"];
			APP.log("debug", this.temp);
			return this.temp; 
		}			
*/
		HTTP.request({
			timeout: 2000,
			async: false,
			headers: [{name: 'Authorization', value: APP.authString}],
			type: "GET",
			format: "JSON",
			url: _url,
			passthrough: null,
			success: _success_function,
			failure: error
		});
		
	}

}

module.exports = function() {
	return new Model();
};