/**
 * Controller for the main view
 * 
 * @class Controllers.text
 * @uses core
 */
var APP = require("core");
var CONFIG = arguments[0];
var maxwidth = Ti.Platform.displayCaps.platformWidth;
var maxheight = Ti.Platform.displayCaps.platformHeight;

APP.log("debug", "text | " + JSON.stringify(CONFIG));

$.heading.color = APP.Settings.colors.hsb.primary.b > 70 ? "#000" : APP.Settings.colors.primary;

$.NavigationBar.setBackgroundColor(APP.Settings.colors.primary);

if(CONFIG.isChild === true) {
	$.NavigationBar.showBack(function(_event) {
		APP.removeChild();
	});
}

if(APP.Settings.useSlideMenu) {
	$.NavigationBar.showMenu(function(_event) {
		APP.toggleMenu();
	});
} else {
	$.NavigationBar.showSettings(function(_event) {
		APP.openSettings();
	});
}

$.NavigationBar.text = "Archivio Teatro Regio";

// Setting main view to full screen width
$.mainview.width = maxwidth;

var showRightbar = function() {
	$.mainview.animate({
		width:(maxwidth - $.rightbar.width)
	});
};
var hideRightbar = function() {
	$.mainview.animate({
		width:maxwidth
	});
};

$.NavigationBar.showRight({
	image: "/newport/hourglass.png",
	callback: function() {
		if($.rightbar.shown) {
			hideRightbar();
			$.rightbar.shown = false;
		} else {
			showRightbar();
			$.rightbar.shown = true;
		}
	}
});

// Calculating orientationchange to refresh mainview width
Ti.Gesture.addEventListener('orientationchange', function(e) {
	maxwidth = Ti.Platform.displayCaps.platformWidth;
	$.mainview.applyProperties({width:maxwidth});
});


var myModal = Ti.UI.createWindow({
    title           : 'My Modal',
    backgroundColor : 'transparent'
});
var wrapperView    = Ti.UI.createView(); // Full screen
var backgroundView = Ti.UI.createView({  // Also full screen
    backgroundColor : '#000',
    opacity         : 0.5,
    top: 47
});
if(OS_IOS && APP.Device.versionMajor >= 7) {
	backgroundView.top = 67;
}
var topcontainerView  = Ti.UI.createView({  // Set height appropriately
    width: Ti.UI.FILL,
    backgroundColor : '#111',
    color: "white"
});
topcontainerView.top = backgroundView.top; 
topcontainerView.height = maxheight / 6;

var topLeft  = Ti.UI.createView({  // Set height appropriately
	width:"60%",
	height:"100%",
	left:10,
	top:0
});
var topRight  = Ti.UI.createView({  // Set height appropriately
	width:"36%",
	height:"100%",
	right:10,
	top:0,
	textAlign: Ti.UI.TEXT_ALIGNMENT_RIGHT,
	layout:"vertical"	
});
var label1 = Ti.UI.createLabel({
  font: { fontSize:34 },
  text: 'Object 1',
  textAlign: Ti.UI.TEXT_ALIGNMENT_LEFT,
  top:10,
  left:10,
  width: Ti.UI.SIZE, height: Ti.UI.SIZE,
  color:"#ddd"
});
var textArea = Ti.UI.createTextArea({
	backgroundColor:"transparent",
	font: {fontSize:20},
	textAlign: 'left',
	left:10,
	value: "Here we have a short description\nlorem ipsum dolor sit amet\nconsectur adipisici elit sed eiusmod\ntempor incidunt ut ",
	top: 60,
	width: 420, 
	height : 70,
	color:"#ddd"
});
topLeft.add(label1);
topLeft.add(textArea);
topcontainerView.add(topLeft);
var closeButton    = Ti.UI.createButton({
	font: { fontSize:24, fontFamily:"GillSans" },
    title  : 'X',
    color: "#aaa",
    right: 0,
    top: 6
});
closeButton.addEventListener('click', function () {
    myModal.close();
});
var label2 = Ti.UI.createLabel({
  font: { fontSize:20, fontFamily:"Avenir-MediumOblique" },
  text: 'Some info about the item',
  textAlign: Ti.UI.TEXT_ALIGNMENT_RIGHT,
  right:10,
  width: Ti.UI.SIZE, height: Ti.UI.SIZE,
  color:"#ddd",
  right:10
});
var label3 = Ti.UI.createLabel({
  font: { fontSize:20, fontFamily:"Avenir-MediumOblique" },
  text: 'Even some more info',
  textAlign: Ti.UI.TEXT_ALIGNMENT_RIGHT,
  right:10,
  width: Ti.UI.SIZE, height: Ti.UI.SIZE,
  color:"#ddd",
  right:10
});
var editButton = Ti.UI.createButton({
	color:"#fff",
	backgroundColor: APP.Settings.colors.primary,
	title: 'Edit',
	width: 100,
	height: 34,
	right:10
});
//topcontainerView.add(closeButton);
topRight.add(closeButton);
topRight.add(label2);
topRight.add(label3);
topRight.add(editButton);
topcontainerView.add(topRight);

var imagecontainerView  = Ti.UI.createView({  // Set height appropriately
    height: 500,
    width: 480,
    bottom: 100,
    backgroundColor : '#FFF',
    color: "black"
});
var someLabel      = Ti.UI.createLabel({
    title : 'Here is your modal',
    top   : 40,
    color: "black"
});

var leftButtonView = Ti.UI.createView({
	left:40,
	bottom:100,
	height:100,
	width: 70
});
var leftButton    = Ti.UI.createButton({
	font: { fontSize:80, fontFamily:"ChalkboardSE-Regular" },
    title  : '<',
    color: "#fff"
});
leftButtonView.add(leftButton);
var rightButtonView = Ti.UI.createView({
	right:40,
	bottom:100,
	height:100,
	width: 70
});
var rightButton    = Ti.UI.createButton({
	font: { fontSize:80, fontFamily:"ChalkboardSE-Regular" },
    title  : '>',
    color: "#fff"
});
rightButtonView.add(rightButton);
imagecontainerView.add(someLabel);


wrapperView.add(backgroundView);
wrapperView.add(imagecontainerView);
wrapperView.add(topcontainerView);
wrapperView.add(leftButtonView);
wrapperView.add(rightButtonView);

myModal.add(wrapperView);

$.firstImage.addEventListener('click',function(e) {
	APP.closeMenu();
	myModal.open({
    	animate : true
	});
});