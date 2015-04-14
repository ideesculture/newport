/**
 * Controller for sending the data stored in "temp" table into the real distant db
 * 
 * @class Controllers.settings.credits
 * @uses core
 */
var APP = require("core");


var COMMONS = require("ca-commons");
var CONFIG = arguments[0];
var maxwidth = Ti.Platform.displayCaps.platformWidth;
var maxheight = Ti.Platform.displayCaps.platformHeight;
//var DETAILS = require("models/ca-objects-edit")();



			
		
/**
 * Initializes the controller
 */
$.init = function() {

	 /*
	 * @param {Object} _params The request paramaters to send
	 * @param {String} _params.url The URL to retrieve data from
	 * @param {Function} _params.callback The function to run on data retrieval
	 * @param {Function} _params.error The function to run on error
	 * @param {Number} _params.cache The length of time to consider cached data 'warm'
	 */
/*	 var url = APP.Settings.CollectiveAccess.urlForObjectEdit.url; 
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
	});*/

	$.label.text = "This will send data to the server when code is done.";

};

// Kick off the init
$.init();