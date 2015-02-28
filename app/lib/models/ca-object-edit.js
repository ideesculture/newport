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
var table =  "ca_objects";
	
function Model() {
	this.TABLE="";

	/**
	 * Initializes the model
	 * @param {Number} _id The UID of the component
	 */
	this.init = function(_ca_table, _id) {
		APP.log("debug", "CA_OBJECT_EDIT.init(" + _ca_table + "_edit_base,"+_id+")");
		this.TABLE = _ca_table;
		var db = Ti.Database.open(DBNAME);
		var request = "CREATE TABLE IF NOT EXISTS " + _ca_table + "_edit_base (id INTEGER PRIMARY KEY AUTOINCREMENT, object_id INTEGER, thumbnail_url TEXT, thumbnail_file TEXT, json TEXT);";
		APP.log("debug", request);		
		db.execute(request);
		var request = "CREATE TABLE IF NOT EXISTS " + _ca_table + "_edit_updates (id INTEGER PRIMARY KEY AUTOINCREMENT, object_id INTEGER, thumbnail_url TEXT, thumbnail_file TEXT, json TEXT);";
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
		var _ca_table = table;
		if(_data.ok == true) {
			var record = _data;
			delete(record.ok);

			APP.log("debug", "CA_OBJECT_EDIT.handleData ("+record.object_id.value+")");

			var db = Ti.Database.open(DBNAME);
			//db.execute("DELETE FROM " + _ca_table + "_edit_base;");
			db.execute("BEGIN TRANSACTION;");
			
			APP.ca_modele_prop = new Array();
			APP.ca_modele_values = {};
			var ca_table = "ca_objects";
			
			// Storing JSON result in SQLite
			var thumbnail_url = "";
			for(var related in record.representations) {
				if (record.representations[related].is_primary == "1") {
					thumbnail_url = record.representations[related].urls.preview170;
				}
			}
		    var request = "INSERT INTO " + _ca_table + "_edit_base (id, object_id, thumbnail_url, json) VALUES (NULL, ?, ?, ?);";
			db.execute(request, record.object_id.value, thumbnail_url, JSON.stringify(record));
			db.execute("INSERT OR REPLACE INTO updates (url, time) VALUES(" + UTIL.escapeString(_url) + ", " + new Date().getTime() + ");");
			db.execute("END TRANSACTION;");
			db.close();
		}

		if(_callback) {
			_callback();
		}
	};

	this.getBaseForEdition = function(_id) {
		APP.log("debug", "CA_OBJECT_EDIT.getDetails "+_id);
		var db = Ti.Database.open(DBNAME), temp = {};
		var request = "select json, thumbnail_url from ca_objects_details caod where caod.object_id="+_id+" limit 1";
		var data = db.execute(request);
		var fieldnumber = 0;
		
		while (data.isValidRow()) {
			while (fieldnumber < data.getFieldCount()) {
				temp[data.fieldName(fieldnumber)] = data.field(fieldnumber);
				fieldnumber++;
			}
			fieldnumber = 0;
			data.next();
		}

		data.close();
		db.close();
		return temp;
	}		
}

module.exports = function() {
	return new Model();
};