/**
 * Collectiveaccess model for object edition
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
//var table =  "ca_objects";
	
function Model() {
	/**
	 * Initializes the model
	 * @param {Number} _id The UID of the component
	 */
	this.init = function(_ca_table, _id) {
		// Filling object id inside this model as we won't have it inside the JSON returned
		APP.CURRENT_ID = _id;
		APP.CURRENT_TABLE = _ca_table;

		APP.log("debug", "CA_OBJECT_EDIT.init(" + _ca_table + "_edit_base,"+_id+")");
		var db = Ti.Database.open(DBNAME);
		var request = "CREATE TABLE IF NOT EXISTS " + _ca_table + "_edit_base (id INTEGER PRIMARY KEY AUTOINCREMENT, object_id INTEGER, json TEXT);";
		APP.log("debug", request);		
		db.execute(request);
		var request = "CREATE TABLE IF NOT EXISTS " + _ca_table + "_edit_updates (id INTEGER PRIMARY KEY AUTOINCREMENT, object_id INTEGER, json TEXT);";
		APP.log("debug", request);		
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
		APP.log("debug", "CA_OBJECT_EDIT.fetch");

		var isStale = UTIL.isStale(_params.url, _params.cache);

		if(isStale) {
			if(_params.cache !== 0 && isStale !== "new") {
				_params.callback();
			}

			HTTP.request({
				timeout: 2000,
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
	 * Handles the data return
	 * @param {Object} _data The returned data
	 * @param {String} _url The URL of the remote source
	 * @param {Function} _callback The function to run on data retrieval
	 */
	this.handleData = function(_data, _url, _callback) {
		Ti.API.log("debug","APP.CURRENT_TABLE APP.CURRENT_ID " +APP.CURRENT_TABLE+ " " +APP.CURRENT_ID);

		if(_data.ok == true) {
			var record = _data;
			delete(record.ok);

			APP.log("debug", "CA_OBJECT_EDIT.handleData ("+APP.CURRENT_ID+")");

			var db = Ti.Database.open(DBNAME);
			//db.execute("DELETE FROM " + _ca_table + "_edit_base;");
			db.execute("BEGIN TRANSACTION;");
			
			APP.ca_modele_prop = new Array();
			APP.ca_modele_values = {};
			var ca_table = "ca_objects";
			// emptying previous cached results
			var request = "DELETE FROM " + APP.CURRENT_TABLE + "_edit_base WHERE id = ?;";
			db.execute(request, APP.CURRENT_ID);

			// main difference at this step with ca_object_details is that we don't need thumbnail here
			var request = "INSERT INTO " + APP.CURRENT_TABLE + "_edit_base (id, object_id, json) VALUES (NULL, ?, ?);";
			db.execute(request, APP.CURRENT_ID, JSON.stringify(record));
			db.execute("INSERT OR REPLACE INTO updates (url, time) VALUES(" + UTIL.escapeString(_url) + ", " + new Date().getTime() + ");");
			db.execute("END TRANSACTION;");
			db.close();
		}

		if(_callback) {
			_callback();
		}
	};

	this.getBaseForEdition = function() {
		Ti.API.log("debug", "CA_OBJECT_EDIT.getBaseForEdition "+ APP.CURRENT_ID);
		var db = Ti.Database.open(DBNAME), temp = {};
		var request = "select object_id, json from " + APP.CURRENT_TABLE + "_edit_base where object_id="+APP.CURRENT_ID+" limit 1";
		var data = db.execute(request);
		var fieldnumber = 0;
		
		/*while (data.isValidRow()) {
			while (fieldnumber < data.getFieldCount()) {
				temp[data.fieldName(fieldnumber)] = data.field(fieldnumber);
				fieldnumber++;
			}
			fieldnumber = 0;
			data.next();
		}*/
		if(data.getRowCount() > 0) {
			var content = data.fieldByName("json");
			Ti.API.log("debug", "CA_OBJECT_EDIT.getBaseForEdition JSON "+content);
			// Sending back unserialized content
			var result = content; //JSON.parse(content);
		} else {
			var result = false;
		}

		data.close();
		db.close();
		return result;
	}		
}

module.exports = function() {
	return new Model();
};