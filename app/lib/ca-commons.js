/**
 * Common utilities for CA WS models
 * 
 * @class Models.ca-commons
 * @uses core
 * @uses utilities
 */
var APP = require("core");
var UTIL = require("utilities");
var MOMENT = require('alloy/moment'); 

APP.locale = APP.Settings.CollectiveAccess.locale;
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

/**
 * Local function to get extension of file
 * @param {function} fn
 */
var _getExtension = function(fn) {
    // from http://stackoverflow.com/a/680982/292947
    var re = /(?:\.([^.]+))?$/;
    var tmpext = re.exec(fn)[1];
    return (tmpext) ? tmpext : '';
};

/**
 * Returns cached version of an image from URL
 * @param {String} _url The URL of the file we're checking
 */
exports.getRemoteFile = function(_url) {
	var md5;
	md5 = Ti.Utils.md5HexDigest(_url)+"."+_getExtension(_url);
	var f = Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory,md5);
	
	if (!f.exists()) {
        var c = Titanium.Network.createHTTPClient();
        c.onload = function() {
            f.write(this.responseData);
        }
        c.open('GET',_url, true);
        c.send();         
	}
	return f.nativePath;
}
