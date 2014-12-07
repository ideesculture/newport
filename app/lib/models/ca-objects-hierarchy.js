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
var table =  "ca_objects";
	
function Model() {
	this.TABLE="";

	/**
	 * Initializes the model
	 * @param {Number} _id The UID of the component
	 */
	this.init = function(_ca_table) {
		APP.log("debug", "CA_HIERARCHY.init(" + _ca_table + ")");

		this.TABLE = _ca_table;
		var db = Ti.Database.open(DBNAME);
		var request = "CREATE TABLE IF NOT EXISTS " + _ca_table + " (id INTEGER PRIMARY KEY AUTOINCREMENT, ca_table TEXT, object_id INTEGER, parent_id INTEGER, idno TEXT, display_label TEXT, date TEXT, created TEXT);";
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
		APP.log("debug", "CA_HIERARCHY.fetch");
		//APP.log("trace", UTIL.jsonStringify(_params));

		var isStale = UTIL.isStale(_params.url, _params.cache);

		if(isStale) {
			if(_params.cache !== 0 && isStale !== "new") {
				_params.callback();
			}

			HTTP.request({
				timeout: 10000,
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
		APP.log("debug", "CA_HIERARCHY.handleData");
		if(_data.ok == true) {
			var db = Ti.Database.open(DBNAME);
			//db.execute("DELETE FROM " + _ca_table + ";");
			db.execute("BEGIN TRANSACTION;");
			
			APP.ca_modele_prop = new Array();
			APP.ca_modele_values = {};
			var _data2;
			var last = 0;
			var ca_table = "ca_objects";
			var record_type;
			
			// Browsing data
		    for (var prop in _data) {
		    	var record_type = prop;
		        var _data2 = _data[prop];
		    	if(prop != "ok") {
		        	for (var prop2 in _data2) {
						var record = _data2[prop2];
		        		
		        		var request = "INSERT INTO " + _ca_table + " (id, ca_table, object_id, parent_id, idno, display_label, created) VALUES (NULL, ?, ?, ?, ?, ?, ?);";
						db.execute(request, _ca_table, record["object_id"], record["parent_id"], record["idno"], record["display_label"], record["created"]["timestamp"]);

		        		last = prop2;
	        		} 
		        }
		    }
		    Ti.API.log("last");
		    Ti.API.log(last);

			db.execute("INSERT OR REPLACE INTO updates (url, time) VALUES(" + UTIL.escapeString(_url) + ", " + new Date().getTime() + ");");
			db.execute("END TRANSACTION;");
			db.close();
		}

		if(_callback) {
			_callback();
		}
	};

	/**
	 * Retrieves first level info
	 */
	this.getModelFirstLevelInfo = function() {
		return APP.ca_modele_prop;
	};

	this.nbLines = function(_ca_table) {
		APP.log("debug", "CA-HIERARCHY.nbLines");

		var db = Ti.Database.open(DBNAME),
			//request = "select ca_table, object_id, parent_id, idno, display_label, date, created from ca_models where ca_table like '"+_ca_table,
			request = "select count(object_id) as nb from "+_ca_table+" where ca_table like '"+_ca_table+"' group by 1",
			temp = [];
		var data = db.execute(request);
		var result = data.getRowCount();
		data.close();
		db.close();
		
		return result;
	};

	this.getLastRecords = function(_ca_table) {
		APP.log("debug", "CA-HIERARCHY.getLastRecords");

		var db = Ti.Database.open(DBNAME),
			//request = "select ca_table, object_id, parent_id, idno, display_label, date, created from ca_models where ca_table like '"+_ca_table,
			request = "select cao4.object_id as id4, cao4.display_label as label4, cao3.object_id as id3, cao3.display_label as label3, cao2.object_id as id2, cao2.display_label as label2, cao1.object_id as id1, cao1.display_label as label1, cao1.created from "+_ca_table+" as cao1 left join "+_ca_table+" as cao2 on cao2.object_id=cao1.parent_id left join "+_ca_table+" as cao3 on cao3.object_id=cao2.parent_id left join "+_ca_table+" as cao4 on cao4.object_id=cao3.parent_id order by cao1.created desc limit 4",
			temp = {};
		var data = db.execute(request);
		var fieldnumber = 0, linenumber = 1;


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

	this.getChildrenFoldersInside = function(_ca_table, id) {
		APP.log("debug", "CA-HIERARCHY.getChildrenFoldersInside");
		var db = Ti.Database.open(DBNAME), temp = {};
		var parent_criteria = "is NULL";
		if (id) parent_criteria = "="+id;
		var request = "select cao1.object_id, cao1.display_label, count(cao2.object_id) as contains from "+_ca_table+" as cao1 left join "+_ca_table+" as cao2 on cao1.object_id=cao2.parent_id where cao1.parent_id "+parent_criteria+" group by cao1.object_id having contains > 0 order by cao1.display_label ";
		var data = db.execute(request);
		var fieldnumber = 0, linenumber = 1;

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

	this.getObjectsInside = function(_ca_table, id) {
		APP.log("debug", "CA-HIERARCHY.getObjectsInside");
		var db = Ti.Database.open(DBNAME), temp = {};
		var parent_criteria = "is NULL";
		if (id) parent_criteria = "="+id;
		var request = "select cao1.object_id, cao1.display_label, cao1.idno from "+_ca_table+" as cao1 left join "+_ca_table+" as cao2 on cao1.object_id=cao2.parent_id where cao1.parent_id "+parent_criteria+" and cao2.object_id is null order by cao1.display_label";
		var data = db.execute(request);
		var fieldnumber = 0, linenumber = 1;

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

	this.isCacheValid = function() {
		return false;
	}

}

module.exports = function() {
	return new Model();
};