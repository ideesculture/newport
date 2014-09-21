/**
 * Common utilities for CA WS models
 * 
 * @class Models.ca-commons
 * @uses core
 * @uses utilities
 */
var APP = require("core");
var UTIL = require("utilities");
var MOMENT = require('/iphone/moment'); 

/**
 * Returns last updated time for an item in the cache
 * @param {String} _url The URL of the file we're checking
 */
exports.isCacheValid = function(_url,_duration) {
	var validity = parseInt(UTIL.lastUpdate(_url)) + (_duration*60*1000);
	var now = new Date().getTime();
	var isValid = validity > now;
	Ti.API.log("COMMONS.isCacheValid: "+isValid);
	if(isValid) return true;
	return false;
};