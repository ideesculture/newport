/**
 * Collectiveaccess list-items
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

function Model() {
	this.temp = {};

	/**
	 * Initializes the model
	 */
	this.init = function() {
		Ti.API.log("debug", "ca-list-items.init");
		var db = Ti.Database.open(DBNAME);

		var request = "CREATE TABLE IF NOT EXISTS ca_list_items (id INTEGER PRIMARY KEY AUTOINCREMENT, list_id INTEGER, item_id INTEGER, idno TEXT, display_label TEXT, item_value INTEGER, is_default INTEGER, rank INTEGER, parent_id INTEGER);";
		db.execute(request);
		db.close();
	};


	this.clear = function() {
		var db = Ti.Database.open(DBNAME);
		var request = "DELETE FROM ca_list_items;";
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
		Ti.API.log("debug", "ca-list-item fetch");

		var isStale = UTIL.isStale(_params.url, _params.cache);
		Ti.API.log("debug",_params);
		Ti.API.log("debug","isStale : "+isStale);
		if(isStale) {
			if(_params.cache !== 0 && isStale !== "new") {
				_params.callback();
			}
			Ti.API.log("debug","ca-list-items HTTP.request");
			HTTP.request({
				timeout: 30000,
				async:false,
				headers: [{name: 'Authorization', value: _params.authString}],
				type: "GET",
				format: "JSON",
				url: _params.url,
				passthrough: _params.callback,
				success: this.handleData,
				failure: this.echoErrorData
			});
			Ti.API.log("debug","ca-list-items HTTP.request end");
		} else {
			_params.callback();
		}
	}

	/**
	 * Useful to only log the data return when debugging
	 * @param {Object} _data The returned data
	 * @param {String} _url The URL of the remote source
	 * @param {Function} _callback The function to run on data retrieval
	 */
	this.echoData = function(_data, _url, _callback) {
		Ti.API.info("Yes. EchoData");
		Ti.API.info(_data);
	};

	this.echoErrorData = function(_data, _url, _callback) {
		Ti.API.info("Arg. Error.");
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

		var db = Ti.Database.open(DBNAME);

		Ti.API.log("debug", "ca-list-items.handleData");
		//Ti.API.log("debug", _data.results);
		if(_data.ok == true) {

			var db = Ti.Database.open(DBNAME);
			db.execute("BEGIN TRANSACTION;");

			// Browsing data
		    for (var num in _data.results) {
				var record = _data.results[num];
				Ti.API.log("debug","record");
				Ti.API.log("debug",record);
				if (num==0) {
					var request = "DELETE FROM ca_list_items WHERE list_id="+record["list_id"];
					db.execute(request);
				}

        		var request = "INSERT INTO ca_list_items (id, list_id, item_id, idno, display_label, item_value, is_default, rank, parent_id) VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, ?);";
				db.execute(request, record["list_id"], record["item_id"], record["idno"], record["display_label"], record["item_value"], record["is_default"], record["rank"], record["parent_id"]);
		    }
			db.execute("INSERT OR REPLACE INTO updates (url, time) VALUES(" + UTIL.escapeString(_url) + ", " + new Date().getTime() + ");");
			db.execute("END TRANSACTION;");
			db.close();
		}

		if(_callback) {
			_callback();
		}
	};

	this.getDataFromDB = function(request) {
		var db = Ti.Database.open(DBNAME),
			temp = [], linenumber = 0, fieldnumber = 0;
		var data = db.execute(request);

		while (data.isValidRow()) {
			temp[linenumber] = {};
			while (fieldnumber < data.getFieldCount()) {
				temp[linenumber][data.fieldName(fieldnumber)] = data.field(fieldnumber);
				fieldnumber++;
			}
			linenumber++;
			fieldnumber = 0;
			data.next();
		}
		data.close();
		db.close();
		return temp;
	}

	this.getAllData = function() {
		var request = "SELECT * FROM ca_list_items;";
		return this.getDataFromDB(request);
	}

	this.getAllDataFromList = function(list_id) {
		var request = "SELECT * FROM ca_list_items where list_id = \""+list_id+"\";";
		return this.getDataFromDB(request);
	}
};

module.exports = function() {
	return new Model();
};
