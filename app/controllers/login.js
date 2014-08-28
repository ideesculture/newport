var APP = require("core");
var UTIL = require("utilities");
var DATE = require("alloy/moment");
var HTTP = require("http");
var MODEL = require("models/ca-connexion")();

var CONFIG = arguments[0];

$.init = function() {
	APP.log("debug", "settings.init");
	
	MODEL.init(CONFIG.index);
	
	CONFIG.url = "http://fakerest.site.192.168.20.10.xip.io/login_ok.txt";

	$.NavigationBar.setBackgroundColor(APP.Settings.colors.primary);

	if(APP.Settings.useSlideMenu) {
		$.NavigationBar.showMenu(function(_event) {
			APP.toggleMenu();
		});
	} else {
		$.NavigationBar.showBack(function(_event) {
			APP.removeChild(true);
		});
	}
};

/**
 * Retrieves the data
 * @param {Object} _force Whether to force the request or not (ignores cached data)
 * @param {Object} _callback The function to run on data retrieval
 */
$.retrieveData = function(_force, _callback) {
	MODEL.fetch({
		url: CONFIG.url,
		cache: 0,
		callback: function() {
			$.handleData(MODEL.isConnected());

			if(typeof _callback !== "undefined") {
				_callback();
			}
		},
		error: function() {
			APP.closeLoading();

			if(typeof _callback !== "undefined") {
				_callback();
			}
		}
	});
};

/**
 * Handles the data return
 * @param {Object} _data The returned data
 */
$.handleData = function(_data) {
	APP.log("debug", "login.handleData");
	APP.log("debug",_data);
	APP.closeLoading();
};


// Event listeners
$.loginbutton.addEventListener("click", function(_event) {
	APP.log("debug", $.loginfield);
	
	APP.openLoading();
	$.retrieveData();
/*
	var fnSuccess = function(_data, _url) {
		APP.log("debug", "fnSuccess");
		Ti.UI.createAlertDialog({
			message: $.loginfield.value + "/" + $.loginfield.value,
			ok: 'Okay',
			title: 'Button'
		}).show();
	};
	var fnError = function() {
		APP.log("debug", "fnError");
		Ti.UI.createAlertDialog({
			message: "y'a pas bon :-(",
			ok: 'Close',
			title: 'Button'
		}).show();
	};
	HTTP.request({
		timeout: 2000,
		type: "GET",
		format: "JSON",
		url: "http://fakerest.site.192.168.20.10.xip.io/login_ok.txt",
		success: fnSuccess,
		failure: fnError
	});*/
});

Ti.UI.setBackgroundColor('#000');
var win = Ti.UI.createWindow({
  backgroundColor: 'black',
  exitOnClose: true,
  fullscreen: false,
  title: 'TableView Demo'
});

// generate random number, used to make each row appear distinct for this example
function randomInt(max){
  return Math.floor(Math.random() * max) + 1;
}

var IMG_BASE = 'https://github.com/appcelerator/titanium_mobile/raw/master/demos/KitchenSink/Resources/images/';
var defaultFontSize = Ti.Platform.name === 'android' ? 16 : 14;

var tableData = [];

for (var i=1; i<=20; i++){
  var row = Ti.UI.createTableViewRow({
    className:'forumEvent', // used to improve table performance
    selectedBackgroundColor:'white',
    rowIndex:i, // custom property, useful for determining the row during events
    height:110
  });
  
  var imageAvatar = Ti.UI.createImageView({
    image: IMG_BASE + 'custom_tableview/user.png',
    left:10, top:5,
    width:50, height:50
  });
  row.add(imageAvatar);
  
  var labelUserName = Ti.UI.createLabel({
    color:'#576996',
    font:{fontFamily:'Arial', fontSize:defaultFontSize+6, fontWeight:'bold'},
    text:'Fred Smith ' + i,
    left:70, top: 6,
    width:200, height: 30
  });
  row.add(labelUserName);
  
  var labelDetails = Ti.UI.createLabel({
    color:'#222',
    font:{fontFamily:'Arial', fontSize:defaultFontSize+2, fontWeight:'normal'},
    text:'Replied to post with id ' + randomInt(1000) + '.',
    left:70, top:44,
    width:360
  });
  row.add(labelDetails);
  
  var imageCalendar = Ti.UI.createImageView({
    image:IMG_BASE + 'custom_tableview/eventsButton.png',
    left:70, bottom: 2,
    width:32, height: 32
  });
  row.add(imageCalendar);
  
  var labelDate = Ti.UI.createLabel({
    color:'#999',
    font:{fontFamily:'Arial', fontSize:defaultFontSize, fontWeight:'normal'},
    text:'on ' + randomInt(30) + ' Nov 2012',
    left:105, bottom:10,
    width:200, height:20
  });
  row.add(labelDate);
  
  tableData.push(row);
}

var tableView = Ti.UI.createTableView({
  backgroundColor:'white',
  data:tableData
});

$.Wrapper.add(tableView);

// Kick off the init
$.init();