/**
 * Collectiveaccess lists
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
var TABLE = "ca_lists";

function Model() {
	this.temp = {};

	/**
	 * Initializes the model
	 */
	this.init = function() {
		Ti.API.log("debug", "ca-lists.init");
		var db = Ti.Database.open(DBNAME);
		Ti.API.log("debug","TABLE");
		Ti.API.log("debug",TABLE);

		var request = "CREATE TABLE IF NOT EXISTS " + TABLE + " (id INTEGER PRIMARY KEY AUTOINCREMENT, ca_table TEXT, list_id INTEGER, list_item_id INTEGER, list_code TEXT, display_label TEXT, default_sort INTEGER, is_hierarchical INTEGER, is_system_list INTEGER, use_as_vocabulary INTEGER);";
		db.execute(request);
		db.close();
	};


	this.clear = function() {
		var db = Ti.Database.open(DBNAME);
		var request = "DELETE FROM " + TABLE + ";";
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
		Ti.API.log("debug", "ca-lists.fetch");
		//APP.log("trace", UTIL.jsonStringify(_params));

		var isStale = UTIL.isStale(_params.url, _params.cache);
		Ti.API.log("debug",_params);
		Ti.API.log("debug","isStale : "+isStale);
		if(isStale) {
			if(_params.cache !== 0 && isStale !== "new") {
				_params.callback();
			}
			Ti.API.log("debug","ca-lists HTTP.request");
			HTTP.request({
				timeout: 30000,
				async:false,
				headers: [{name: 'Authorization', value: _params.authString}],
				type: "GET",
				format: "JSON",
				url: _params.url,
				passthrough: _params.callback,
				success: this.handleData,
				//success: this.echoData,
				failure: this.echoErrorData
			});
			Ti.API.log("debug","ca-lists HTTP.request end");
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
		if(_data.ok == true) {

			var db = Ti.Database.open(DBNAME);
			db.execute("BEGIN TRANSACTION;");

			// Browsing data
		    for (var num in _data.results) {
				var record = _data.results[num];
				Ti.API.log("debug","ca-lists model record");
				Ti.API.log("debug",record);
        		var request = "INSERT INTO " + TABLE + " (id, ca_table, list_id, list_item_id, display_label, list_code, default_sort, is_hierarchical, is_system_list, use_as_vocabulary) VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?);";
				db.execute(request, TABLE, record["list_id"], record["id"], record["display_label"], record["list_code"], record["default_sort"], record["is_hierarchical"], record["is_system_list"], record["use_as_vocabulary"]);
				Ti.API.log("debug","ca-lists model record");

				//Ti.API.log("debug",TABLE+" "+record["list_id"]+" "+record["id"]+" "+record["display_label"]+" "+record["list_code"]+" "+record["default_sort"]+" "+record["is_hierarchical"]+" "+record["is_system_list"]+" "+record["use_as_vocabulary"]));
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
			temp = [],
			linenumber = 0,
			fieldnumber = 0;
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

	this.getDataFirstLineFromDB = function(request) {
		var temp=this.getDataFromDB(request);
		return temp[0];
	}

	this.getListIDFromListCode = function(listCode) {
		var request = "select list_id from "+TABLE+" where list_code like '"+listCode+"' group by 1";
		temp = this.getDataFirstLineFromDB(request)
		return temp.list_id;
	}

	this.getLabelFromListCode = function(listCode) {
		var request = "select display_label as nb from "+TABLE+" where list_code like '"+listCode+"' group by 1";
		return this.getDataFromDB(request);
	}

	this.getFromListCode = function(listCode) {
		var request = "select * from "+TABLE+" where list_code like '"+listCode+"' group by 1";
		return this.getDataFromDB(request);
	}

	this.getFromListID = function(listID) {
		var request = "select * from "+TABLE+" where list_id='"+listID+"' group by 1";
		return this.getDataFromDB(request);
	}
};

module.exports = function() {
	return new Model();
};
