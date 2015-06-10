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
		APP.log("debug", "CA_MODEL.init(" + _ca_table + ")");

		this.TABLE = _ca_table;
		var db = Ti.Database.open(DBNAME);
		var request = "CREATE TABLE IF NOT EXISTS ca_models (id INTEGER PRIMARY KEY AUTOINCREMENT, ca_table TEXT, record_type TEXT, information_type TEXT, element_name TEXT, date TEXT, content TEXT);";
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
		APP.log("debug", "CA_MODEL.fetch");
		//APP.log("trace", UTIL.jsonStringify(_params));
		
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

		APP.log("debug", "CA_MODEL.handleData");
		//APP.log("debug", _data);
		if(_data.ok == true) {
			APP.log("debug", "connected");
			var db = Ti.Database.open(DBNAME);
			//db.execute("DELETE FROM ca_models;");
			db.execute("BEGIN TRANSACTION;");
			
			APP.ca_modele_prop = new Array();
			APP.ca_modele_values = {};
			var _data2;

			var ca_table = "ca_objects";
			var record_type;
			
			// Browsing data
		    for (var prop in _data) {
		    	var record_type = prop;
		        		
		        var _data2 = _data[prop];
		        if(prop != "ok") {
		        	for (var prop2 in _data2) {
		        		APP.ca_modele_prop.push(prop2);
		        		APP.ca_modele_values[prop2] = _data2[prop2];
		        		// id INTEGER PRIMARY KEY AUTOINCREMENT, ca_table TEXT, record_type TEXT, information_type TEXT, element_name TEXT, date TEXT, content TEXT
		        		
		        		var information_type = prop2;
		        		var insert_date = new Date().getTime();
		        		var content = JSON.stringify(_data2[prop2]);
	        			var element_data = null;
		        		if(prop2 == "elements") {
		        			var element_data = _data2[prop2];
		        			for(var element_name in element_data) {
								content = JSON.stringify(element_data[element_name]);
								content = content.replace(/'/g,"\'");
								// We need to clean the value before its insertion in the request
								// Constructing request to insert a line for each element for a particular type
								
		        				var request = "INSERT INTO ca_models (id, ca_table, record_type, information_type, element_name, date, content) VALUES (NULL, ?, ?, ?, ?, ?, ?);";
								db.execute(request, ca_table, record_type, information_type, element_name, insert_date, content);
		        			}
		        		} else {
		        			if(prop2 == "type_info") {

		        				//inserting informations about the record type: numeric_id and display_label
		        				var type_info_data = _data2[prop2];
		        				for(var info in type_info_data){
		        					if(info=="item_id"){
		        						content=type_info_data[info];
		        						var request = "INSERT INTO ca_models (id, ca_table, record_type, information_type, element_name, date, content) VALUES (NULL, ?, ?, ?, ?, ?, ?);";
										db.execute(request, ca_table, record_type, information_type, info, insert_date, content) ;
		        					
		        					}
		        					if(info=="idno"){
		        						content=type_info_data[info];
		        						var request = "INSERT INTO ca_models (id, ca_table, record_type, information_type, element_name, date, content) VALUES (NULL, ?, ?, ?, ?, ?, ?);";
										db.execute(request, ca_table, record_type, information_type, info, insert_date, content) ;
		        					
		        					}
		        					if(info=="display_label"){
		        						content=type_info_data[info];
		        						var request = "INSERT INTO ca_models (id, ca_table, record_type, information_type, element_name, date, content) VALUES (NULL, ?, ?, ?, ?, ?, ?);";
										db.execute(request, ca_table, record_type, information_type, info, insert_date, content) ;
		        					
		        					}
		        				}
		        				

		        			} else {
		        			// Inserting non element properties
			        		var request = "INSERT INTO ca_models (id, ca_table, record_type, information_type, date, content) VALUES (NULL, ?, ?, ?, ?, ?);";
							db.execute(request, ca_table, record_type, information_type, insert_date, content);
		        			}
		        		}
	        		} 
		        }
		    }
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
		APP.log("debug", "getModelFirstLevelInfo");
		APP.log("debug",  APP.ca_modele_prop);
		return APP.ca_modele_prop;
	};

	this.hasElementInfo = function(_ca_table, _element_name) {
		APP.log("debug", "CA-MODEL.hasElementInfo");

		var db = Ti.Database.open(DBNAME),
			request = "select content from ca_models where ca_table like '"+_ca_table+"' and element_name like '"+_element_name+"' limit 1",
			temp = [];
		var data = db.execute(request);
		var result = data.getRowCount();
		data.close();
		db.close();
		
		return result;
	};

	this.getElementInfo = function(_ca_table, _element_name) {
		APP.log("debug", "CA-MODEL.getElementInfo");

		var db = Ti.Database.open(DBNAME),
			request = "select content from ca_models where ca_table like '"+_ca_table+"' and element_name like '"+_element_name+"' limit 1",
			temp = [];
		var data = db.execute(request);
		// Fetching content, but caution, we store JSON inside SQLite with single quotes, need to revert them before using it

		if(data.getRowCount() > 0) {
			var content = data.fieldByName("content");
			// Sending back unserialized content
			var result = JSON.parse(content);
		} else {
			var result = false;
		}
		data.close();
		db.close();
		
		return result;

	};
	this.getTestResults = function(_ca_table, _element_name) {
		
		var db = Ti.Database.open(DBNAME),
			request = "select content from ca_models where ca_table like '"+_ca_table+"' and element_name like '"+_element_name+"' limit 1",
			temp = [];
		var data = db.execute(request);
		// Fetching content, but caution, we store JSON inside SQLite with single quotes, need to revert them before using it

		if(data.getRowCount() > 0) {
			var content = data.fieldByName("content");
			// Sending back unserialized content
			var result = content;
		} else {
			var result = false;
		}
		data.close();
		db.close();
		
		return result;
	};

	this.getObjectTypes = function(){
		var db = Ti.Database.open(DBNAME),
			request = "SELECT DISTINCT record_type, element_name, content FROM CA_MODELS where information_type=\"type_info\"",
			types = {}, rec_type_idno, rec_type_elt,rec_type_val;
		var data = db.execute(request);

		//builds a table of types from request results
		if(data.getRowCount() > 0) {
			var i = 0;
			while (data.isValidRow()) {
				rec_type_idno = data.fieldByName("record_type");
				rec_type_elt= data.fieldByName("element_name");
				rec_type_val= data.fieldByName("content");
				if (types[rec_type_idno] == null) {
					var tempobj = {};
				} else {
					var tempobj = types[rec_type_idno];
				}
				tempobj[rec_type_elt]=rec_type_val;
				types[rec_type_idno] = tempobj; 
				data.next();
				i++;
			}
			var result = types; 
		}else {
			var result = false;
		}
		data.close();
		db.close();	
		return result;
	}

	this.getElementsByType = function(type_name){
		APP.log("debug", "GETELEMENTSBYTYPE");
		//THERE IS A BUG SOMEWHERE IN HEREEE
		var db = Ti.Database.open(DBNAME),
				request = "SELECT DISTINCT element_name FROM CA_MODELS where information_type=\"elements\" and record_type=\""+ type_name + "\" ",
				elements = [], i=0;
		var data = db.execute(request);


		if(data.getRowCount() > 0) {
			
			while (data.isValidRow()) {
				elements[i]= data.fieldByName("element_name");
				data.next();
				i++;
			}
			var result = elements;
		}
		else {
			var result = false;
		}
		data.close();
		db.close();	
		//APP.log("debug", result);
		return result;

	}



}


module.exports = function() {
	return new Model();
};