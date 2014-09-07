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

function Model() {
	this.TABLE="";

	/**
	 * Initializes the model
	 * @param {Number} _id The UID of the component
	 */
	this.init = function() {
		APP.log("debug", "CA-UI.init()");

		var db = Ti.Database.open(DBNAME);
		db.execute("DROP TABLE IF EXISTS ca_uis;");
		db.execute("CREATE TABLE IF NOT EXISTS ca_uis (id INTEGER PRIMARY KEY AUTOINCREMENT, ca_table TEXT, code TEXT, information_type TEXT, screen_name TEXT, screen_label TEXT, date TEXT, content TEXT);");
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
		APP.log("debug", "CA-UI.fetch");
		//APP.log("trace", JSON.stringify(_params));

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
				url: _params.url,
				passthrough: _params.callback,
				success: this.handleData,
				failure: _params.error
			});
		} else {
			_params.callback();
		}
	};

	/**
	 * Handles the data return
	 * @param {Object} _data The returned data
	 * @param {String} _url The URL of the remote source
	 * @param {Function} _callback The function to run on data retrieval
	 */
	this.handleData = function(_data, _url, _callback) {
		APP.log("debug", "CA-UI.handleData");
		
		// Emptying cache
		var db = Ti.Database.open(DBNAME);
		db.execute("DELETE FROM ca_uis;");
		Ti.API.info("DELETE FROM ca_uis;");
		db.execute("BEGIN TRANSACTION;");
		Ti.API.info("BEGIN TRANSACTION;");
				
		Ti.API.info(_data);
		if(_data.ok == true) {

			// Defining store value for insertion date
			var insert_date = UTIL.cleanEscapeString(new Date().getTime());			
			
			// Browsing data
		    for (var prop in _data) {
		    	var record_type = UTIL.cleanEscapeString(prop);
		        var _data2 = _data[prop];
		        Ti.API.info(_data2);
		        if(prop != "ok") {

		        	// We are not at the WS request result, so we got a CA record table as first level
					var ca_table = UTIL.cleanEscapeString(prop);
					
		        	for (var prop2 in _data2) {
		        		Ti.API.info(prop2);
		        		
		        		var _data3 = _data2[prop2];
		        		
		        		// 2nd level : no direct type, but a code as sublevel
						var code = UTIL.cleanEscapeString(_data2[prop2].editor_code);
						
						for (var prop3 in _data3) {

			        		// 3rd level : getting information type
							var information_type = UTIL.cleanEscapeString(prop3);
		        			
		        			if(prop3 == "screens") {
		        				// 3rd level : for screens only, doing a 4th level
		        				
		        				var _data4 = _data3[prop3];
		        				for (var prop4 in _data4) {
									// 4rth level for screens, preparing store values
		        					var screen_name = UTIL.cleanEscapeString(_data4[prop4].idno);
		        					var screen_label = UTIL.cleanEscapeString(_data4[prop4].name);
		        					var content = UTIL.cleanEscapeString(JSON.stringify(_data4[prop4]));

		        					//id INTEGER PRIMARY KEY AUTOINCREMENT, ca_table TEXT, code TEXT, information_type TEXT, screen_name TEXT, screen_label TEXT, date TEXT, content TEXT
		        					var request = "INSERT INTO ca_uis (ca_table, code, information_type, screen_name, screen_label, date, content)"+ 
		        						"VALUES (" + ca_table+","+code+","+information_type+","+screen_name+","+screen_label+","+insert_date+","+content+");";
	        						Ti.API.info(request);
									db.execute(request);
		        				}
		        			} else {
		        				// 3rd level, non screen information
		        				var content = UTIL.cleanEscapeString(_data3[prop3]);
		        				//id INTEGER PRIMARY KEY AUTOINCREMENT, ca_table TEXT, code TEXT, information_type TEXT, screen_name TEXT, screen_label TEXT, date TEXT, content TEXT
	        					var request = "INSERT INTO ca_uis (ca_table, code, information_type, date, content) "+ 
	        						"VALUES (" + ca_table+","+code+","+information_type+","+insert_date+","+content+");";
        						Ti.API.info(request);
								db.execute(request);
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
	 * Returns all availables uis for a record table
	 */
	this.getAvailableUIsForTable = function(_ca_table) {
		var ca_table = UTIL.cleanEscapeString(_ca_table);
		APP.log("debug", "CA-UI.getAvailableUIsForTable");

		var db = Ti.Database.open(DBNAME),
			request = "select code from ca_uis where ca_table like "+ ca_table +" group by 1",
			temp = [];
		var data = db.execute(request);

		while(data.isValidRow()) {
			temp.push({
				code: data.fieldByName("code")
			});

			data.next();
		}

		data.close();
		db.close();

		return temp;
	};

	/**
	 * Returns first available ui for a record table
	 */
	this.getFirstAvailableUIForTable = function(_ca_table) {
		APP.log("debug", "CA-UI.getFirstAvailableUIForTable");
		var availableUIs = this.getAvailableUIsForTable(_ca_table);
		if(availableUIs[0]) return availableUIs[0]; 
		return false;
	};

	/**
	 * Returns all screens for a UI
	 */
	this.getAllScreensForUI = function(_ca_table,_ui_code) {
		var ca_table = UTIL.cleanEscapeString(_ca_table);
		var ui_code = UTIL.cleanEscapeString(_ui_code); 
		APP.log("debug", "CA-UI.getAllScreensForUI");

		var db = Ti.Database.open(DBNAME),
			request = "select screen_name, screen_label from ca_uis where ca_table like "+ca_table+" and code like "+ui_code+" and information_type like \"screens\" group by 1,2",
			temp = [];
		var data = db.execute(request);

		while(data.isValidRow()) {
			temp.push({
				code: data.fieldByName("screen_name"),
				preferred_labels: data.fieldByName("screen_label")
			});
			data.next();
		}

		data.close();
		db.close();

		return temp;
	};

	/**
	 * Returns first available screen for a UI
	 */
	this.getFirstAvailableScreenForUI = function(_ca_table,_ui_code) {
		APP.log("debug", "CA-UI.getFirstAvailableScreenForUI");
		var availableScreens = this.getAllScreensForUI(_ca_table,_ui_code);
		if(availableScreens[0]) return availableScreens[0]; 
		return false;
	};

	/**
	 * Returns all screens & contents for a UI
	 */
	this.getAllScreensWithContentForUI = function(_ca_table,_ui_code) {
		var ca_table = UTIL.cleanEscapeString(_ca_table);
		var ui_code = UTIL.cleanEscapeString(_ui_code); 
		APP.log("debug", "CA-UI.getAllScreensWithContentForUI");

		var db = Ti.Database.open(DBNAME),
			request = "select screen_name, screen_label, content from ca_uis where ca_table like "+ca_table+" and code like "+ui_code+" and information_type like \"screens\" group by 1,2";
			temp = [];
		var data = db.execute(request);

		while(data.isValidRow()) {
			//Ti.API.log(data.fieldByName("content"));
			// As JSON are stored inside the DB with single quotes, we need to replace theme before parsing JSON
			//Ti.API.log(data.fieldByName("content"));
			//Ti.API.log(UTIL.singleToDoubleQuotes(data.fieldByName("content")));
			var text = UTIL.singleToDoubleQuotes(data.fieldByName("content"));
			//Titanium.API.log(Titanium.API.WARN,text);
			var content = JSON.parse(text);
			
			//var content = [];
			temp.push({
				code: data.fieldByName("screen_name"),
				preferred_labels: data.fieldByName("screen_label"),
				content: content
			});
			data.next();
		}

		data.close();
		db.close();
		return temp;
	};
	
	/**
	 * Returns first available screen & its content for a UI
	 */
	this.getFirstAvailableScreenWithContentForUI = function(_ca_table,_ui_code) {
		APP.log("debug", "CA-UI.getFirstAvailableScreenForUI");
		var availableScreens = this.getAllScreensWithContentForUI(_ca_table,_ui_code);
		if(availableScreens[0]) return availableScreens[0]; 
		return false;
	};


	/**
	 * Returns all screens & contents for a UI
	 */
	this.getNonScreenInfosForUI = function(_ca_table,_ui_code) {
		var ca_table = UTIL.cleanEscapeString(_ca_table);
		var ui_code = UTIL.cleanEscapeString(_ui_code); 
		APP.log("debug", "CA-UI.getAllScreensForUI");

		var db = Ti.Database.open(DBNAME),
			request = "select information_type, content from ca_uis where ca_table like "+ca_table+" and code like "+ui_code+" and information_type not like \"screens\" group by 1,2",
			temp = [];
		var data = db.execute(request);

		while(data.isValidRow()) {
			temp.push({
				information_type: data.fieldByName("information_type"),
				content: JSON.parse(data.fieldByName("content"))
			});
			data.next();
		}
		data.close();
		db.close();

		return temp;		
	};

	/**
	 * Returns content for a screen
	 */
	this.getContentForScreen = function(_ca_table,_ui_code,_screen_code) {
		var ca_table = UTIL.cleanEscapeString(_ca_table);
		var ui_code = UTIL.cleanEscapeString(_ui_code);
		var screen_code = UTIL.cleanEscapeString(_screen_code);  
		APP.log("debug", "CA-UI.getAllScreensForUI");

		var db = Ti.Database.open(DBNAME),
			request = "select content from ca_uis where ca_table like "+ca_table+" and code like "+ui_code+" and screen_name like "+screen_code+" limit 1",
			temp = [];
		var data = db.execute(request);

		while(data.isValidRow()) {
			temp.push(JSON.parse(data.fieldByName("content")));
			data.next();
		}

		data.close();
		db.close();

		return temp;
	};

}

module.exports = function() {
	return new Model();
};