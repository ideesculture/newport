/**
 * Controller for the details modal view
 * 
 * @class Controllers.text
 * @uses core
 */
 var APP = require("core");
var COMMONS = require("ca-commons");
var CONFIG = arguments[0];
var maxwidth = Ti.Platform.displayCaps.platformWidth;
var maxheight = Ti.Platform.displayCaps.platformHeight;

	$.backgroundView.backgroundColor='#000';
	$.backgroundView.opacity=0.5;
	$.backgroundView.top=47;
	
	if(OS_IOS && APP.Device.versionMajor >= 7) {
		$.backgroundView.top = 67;
	}
	$.topcontainerView.width = "Ti.UI.FILL";
	$.topcontainerView.backgroundColor = '#111';
	$.topcontainerView.color= "white";
	$.topcontainerView.top = $.backgroundView.top; 
	$.topcontainerView.height = maxheight / 6;
	
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
	$.topcontainerView.add(topLeft);
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
	$.topcontainerView.add(topRight);
	
	$.imagecontainerView.height= 500;
	$.imagecontainerView.width= 480;
	$.imagecontainerView.bottom= 100;
	$.imagecontainerView.backgroundColor='#FFF';
	$.imagecontainerView.color="black";

	var someLabel      = Ti.UI.createLabel({
	    title : 'Here is your modal',
	    top   : 40,
	    color: "black"
	});
	
	var leftButton    = Ti.UI.createButton({
		font: { fontSize:80, fontFamily:"ChalkboardSE-Regular" },
	    title  : '<',
	    color: "#fff"
	});
	$.leftButtonView.add(leftButton);
	var rightButton    = Ti.UI.createButton({
		font: { fontSize:80, fontFamily:"ChalkboardSE-Regular" },
	    title  : '>',
	    color: "#fff"
	});
	$.rightButtonView.add(rightButton);
	$.imagecontainerView.add(someLabel);
	
	/*
	$.wrapperView.add(backgroundView);
	$.wrapperView.add(imagecontainerView);
	$.wrapperView.add(topcontainerView);
	$.wrapperView.add(leftButtonView);
	$.wrapperView.add(rightButtonView);
	*/