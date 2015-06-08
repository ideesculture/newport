/**
 * Collectiveaccess model for object edition ca-object-edit.js
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

		//creates 3 tables: data before, while & after editing
		var db = Ti.Database.open(DBNAME);

		//cleans the db: delete all tables
		// you don't have to do that
		//if you dont change their structures
		var request = "DROP TABLE IF EXISTS " + _ca_table + "_edit_base ;";
		db.execute(request);
		var request = "DROP TABLE IF EXISTS " + _ca_table + "_edit_updates ;";
		db.execute(request);
		var request = "DROP TABLE IF EXISTS " + _ca_table + "_edit_temp_insert ;";
		db.execute(request);
		

		var request = "CREATE TABLE IF NOT EXISTS " + _ca_table + "_edit_base (id INTEGER PRIMARY KEY AUTOINCREMENT, object_id TEXT, json TEXT);";
		db.execute(request);
		var request = "CREATE TABLE IF NOT EXISTS " + _ca_table + "_edit_updates (id INTEGER PRIMARY KEY AUTOINCREMENT, object_id TEXT, attribute TEXT, json TEXT);";
		db.execute(request);
		var request = "CREATE TABLE IF NOT EXISTS " + _ca_table + "_edit_temp_insert (id INTEGER PRIMARY KEY AUTOINCREMENT, object_id TEXT, attribute TEXT, bundle_code TEXT, value TEXT, is_modified INTEGER, is_new INTEGER);";
		db.execute(request);

		//cleans update table so that it exclusively contains the fresh new modifications
		var request = "DELETE FROM " + _ca_table + "_edit_updates ;"; 
		db.execute(request);
		var request = "VACUUM;"; 
		db.execute(request);

		//ONLY FOR TESTING 
		//cleans the _edit_temp_insert table
		/*var request = "DELETE FROM " + _ca_table + "_edit_temp_insert ;"; 
		db.execute(request);
		var request = "VACUUM;"; 
		db.execute(request); */

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
		if(_data.ok == true) {
			var record = _data;
			delete(record.ok);
			APP.log("debug", "handleData:");
			APP.log("debug", APP.CURRENT_ID);

			
			// expanding attribute informations for editing process tracking
			for(var attribute in record.attributes) {
				for(var value in attribute) {
					var value_content = record.attributes[attribute][value];
					if((typeof value_content != "undefined") && (value_content != "")) {
						value_content.is_origin = 1;
						value_content.is_modified = 0;
						value_content.is_new = 0; 
						value_content.is_saved_in_buffer = 0;
						value_content.buffer_ref = 0;
						record.attributes[attribute][value] = value_content;
					}
				}
			}

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
			var request = "DELETE FROM " + APP.CURRENT_TABLE + "_edit_base where object_id = ?;";
			db.execute(request, APP.CURRENT_ID);
			
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

		APP.log("debug", "getBaseForEdition");
		//// TEMP SOLUTION
		///// BECAUSE "TEXT" KILLED MY CODE
		//// WE HAVE TO FIND SOMETHING BETTER !!!
		if((APP.CURRENT_ID*1)>0){
			APP.log("debug", "_____________________________________________");
			APP.log("debug", "______________ID INTEGER_________");
			APP.log("debug", APP.CURRENT_ID);
			APP.log("debug", "_____________________________________________");
			APP.CURRENT_ID= APP.CURRENT_ID+".0";
		} else {
			APP.log("debug", "_____________________________________________");
			APP.log("debug", "______________ID TEXT_________");
			APP.log("debug", APP.CURRENT_ID);
			APP.log("debug", "_____________________________________________");
		}
		//APP.CURRENT_ID= APP.CURRENT_ID+".0";
		//APP.log("debug", APP.CURRENT_ID);
		var db = Ti.Database.open(DBNAME), temp = {};
		var request = "select object_id, json from " + APP.CURRENT_TABLE + "_edit_base where object_id="+APP.CURRENT_ID+" order by id desc limit 1";
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
			// Sending back unserialized content
			var result = content; //JSON.parse(content);
		} else {
			var result = false;
		}

		data.close();
		db.close();
		//APP.log("debug", "resultat getBaseForEdition:");
		//APP.log("debug", result);
		return result;
	}

	this.getBundleValueForEmptyOne = function() {
		var value_content = {};
		value_content.is_origin = 1;
		value_content.is_modified = 0;
		value_content.is_saved_in_buffer = 0;
		value_content.buffer_ref = 0;
		
		return value_content;
	}

	//creates json from the objet given as parameter (value) and saves this data + the name of the modified attribute in a temp table
	this.insertTempAddition = function(attribute, value) {
		var db = Ti.Database.open(DBNAME);
		db.execute("BEGIN TRANSACTION;");
		//removes previous temp values
		var request = "DELETE FROM " + APP.CURRENT_TABLE + "_edit_updates WHERE object_id = ? AND attribute = ?;";
		db.execute(request, APP.CURRENT_ID, attribute);

		var json = JSON.stringify(value); 
		//APP.log("debug",json);
		//saves the new value
		var request = "INSERT INTO " + APP.CURRENT_TABLE + "_edit_updates (id, object_id, attribute, json) VALUES (NULL, ?, ?, ?);";
		db.execute(request, APP.CURRENT_ID, attribute, json);

		db.execute("END TRANSACTION;");
		db.close();
		APP.log("debug", "insertTempAddition OK");
		APP.log("debug", APP.CURRENT_ID);
		
	}

	//returns an array of objects, containing the name of the modified attribute and the json created in insertTempAddition
	this.getTempData = function() {
		var db = Ti.Database.open(DBNAME);
		db.execute("BEGIN TRANSACTION;");
		//removing previous temp values
		var request = "SELECT object_id, attribute, json FROM " + APP.CURRENT_TABLE + "_edit_updates WHERE object_id="+APP.CURRENT_ID+";";
		var data = db.execute(request);
		db.execute("END TRANSACTION;");
		
		var content = new Array() ; 
		var valeur, attribut; 
		if(data.getRowCount() > 0) { 
			var i = 0;
			while (data.isValidRow()) {
				valeur = data.fieldByName("json");
				attribut = data.fieldByName("attribute");
				var otemp = {} ;
				otemp.valeur = valeur;
				otemp.attribut = attribut; 
				content[i] = otemp; 
				data.next();
				i++;
			}
			// Sending back unserialized content: array containing attribute & its json 
			var result = content; 
		} else {
			var result = false;
		}

		data.close();
		db.close();

		APP.log("debug", "getTempData OK");
		return result;
	}

	//marche pas
	this.cleanEditUpdatesTable = function (){
		//cleans the _edit_updates table
		APP.log("debug", "DEBUG cleanEditUpdatesTable");

		var db = Ti.Database.open(DBNAME);
		db.execute("BEGIN TRANSACTION;");
		var request = "DELETE FROM " + APP.CURRENT_TABLE + "_edit_updates ;";
		db.execute(request);
		db.execute("END TRANSACTION;");
		APP.log("debug", "fini");
	}

	this.saveChanges = function() {
		APP.log("debug", "SAVE-CHANGES");
		var attribut, valeur, result, is_modified, is_new, bundle_code;
		var db = Ti.Database.open(DBNAME);
		db.execute("BEGIN TRANSACTION;");
		
		var request = "SELECT object_id, attribute, json FROM " + APP.CURRENT_TABLE + "_edit_updates WHERE object_id = '"+APP.CURRENT_ID+"' ;";
		var data = db.execute(request);
		db.execute("END TRANSACTION;");

		if(data.getRowCount() > 0) { 
			while (data.isValidRow()) {
				//get attribute OKDONE
				attribut = data.fieldByName("attribute");
				//get value: OKDONE
				//1)get json & parse it into an object
				var otmp = JSON.parse(data.fieldByName("json"));
				//2)get value, isnew and ismodified
				valeur= otmp[0][attribut]; 	
				is_modified = otmp[0].is_modified;
				is_new = otmp[0].is_new; 
				bundle_code = otmp[0].bundle;
				//Send to db
				db.execute("BEGIN TRANSACTION;");
				var request = "INSERT INTO " + APP.CURRENT_TABLE + "_edit_temp_insert (id, object_id, attribute, value, is_modified, is_new, bundle_code) VALUES (NULL, ?, ?, ?, ?, ?, ?);";
				db.execute(request, APP.CURRENT_ID, attribut, valeur, is_modified, is_new, bundle_code); 
				db.execute("END TRANSACTION;");
				data.next();
			}
		result = true; 
		/*db.execute("BEGIN TRANSACTION;");
		var request = "DELETE FROM " + _ca_table + "_edit_updates ;"; 
		db.execute(request);
		var request = "VACUUM;"; 
		db.execute(request);
		
		db.execute("END TRANSACTION;");*/
		} else {
			result = false;
		}
		db.close();


		return result; 
	}

	//returns an array of objects, containing the name and value of the modified attributes to save in the server
	this.getSavedData = function() {
		var db = Ti.Database.open(DBNAME);
		db.execute("BEGIN TRANSACTION;");
		//removing previous temp values
		var request = "SELECT object_id, attribute, value, is_new, is_modified, bundle_code FROM ca_objects_edit_temp_insert ;";
		var data = db.execute(request);
		db.execute("END TRANSACTION;");
		
		var content = new Array() ; 
		var valeur, attribut, object_id, is_new, is_modified, bundle_code; 
		if(data.getRowCount() > 0) { 
			var i = 0;
			while (data.isValidRow()) {
				valeur = data.fieldByName("value");
				attribut = data.fieldByName("attribute");
				object_id = data.fieldByName("object_id");
				is_new = data.fieldByName("is_new");
				is_modified = data.fieldByName("is_modified");
				bundle_code = data.fieldByName("bundle_code");
				var otemp = {} ;
				otemp.valeur = valeur;
				otemp.attribut = attribut; 
				otemp.is_new = is_new; 
				otemp.is_modified = is_modified; 
				otemp.bundle_code = bundle_code; 
				otemp.object_id = object_id; 
				content[i] = otemp; 
				data.next();
				i++;
			}
			// Sending back unserialized content: array containing attribute & its json 
			var result = content; 
		} else {
			var result = false;
		}

		data.close();
		db.close();

		APP.log("debug", "getSavedData OK, returns: ");
		APP.log("debug", result);
		return result;

	}

	//apparement, fait tout crasher
	
	this.cleanTempInsertTable = function (_id, _attribute){
		APP.log("debug", "cleanTempInsertTable");
		//APP.log("debug", _id);
		//APP.log("debug", _attribute);
		//cleans the _edit_temp_insert table
		var db = Ti.Database.open(DBNAME);
		db.execute("BEGIN TRANSACTION;");
		var request = "DELETE FROM ca_objects_edit_temp_insert WHERE object_id = ? AND attribute = ? ;";
		db.execute(request, _id, _attribute);
		db.execute("END TRANSACTION;");
		//APP.log("debug", "ok fini");

	}

	/*
	this.cleanTempInsertTable = function (){
		//cleans the _edit_temp_insert table
		var db = Ti.Database.open(DBNAME);
		db.execute("BEGIN TRANSACTION;");
		var request = "DELETE FROM ca_objects_edit_temp_insert;";
		db.execute(request);
		var request = "VACUUM;"; 
		db.execute(request);
		db.execute("END TRANSACTION;");

	}*/


}

module.exports = function() {
	return new Model();
};