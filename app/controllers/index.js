/**
 * Main application controller
 * 
 * **NOTE: This controller is opened first upon application start and
 * initializes the core application code (`APP.init`). This controller
 * also sets UI elements to global scope for easy access.**
 * 
 * @class Controllers.index
 * @uses core
 */

// Pull in the core APP singleton
var APP = require("core");
//require('com.arihiro.titestfairy').begin("b911dae286a68622d9e1cb8fb15ee847b85d27fc");
Ti.API.info("index.js");

// Make sure we always have a reference to global elements throughout the APP singleton
APP.MainWindow = $.MainWindow;
APP.GlobalWrapper = $.GlobalWrapper;
APP.ContentWrapper = $.ContentWrapper;
APP.SlideMenu = $.SlideMenu;
APP.Tabs = $.Tabs;

// Start the APP
APP.init();