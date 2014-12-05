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

	/*var backgroundView = Ti.UI.createView({  // Also full screen
	    backgroundColor : '#000',
	    opacity         : 0.5,
	    top: 47
	});*/
if(OS_IOS && APP.Device.versionMajor >= 7) {
	Ti.API.log("debug","IOS 7 ou +");
	$.backgroundView.setTop('67');
}

$.topcontainerView.setTop($.backgroundView.top); 
$.topcontainerView.setHeight(maxheight / 6);

$.label1.font={ fontSize:34 };
$.label1.text="Objet : "+CONFIG.idno;
$.textArea.value=CONFIG.display_label;


$.textArea.font={fontSize:20};
$.closeButton.font= { fontSize:24, fontFamily:"GillSans" };
$.label2.font={ fontSize:20, fontFamily:"Avenir-MediumOblique" };
$.label3.font={ fontSize:20, fontFamily:"Avenir-MediumOblique" };
$.editButton.setBackgroundColor(APP.Settings.colors.primary); 
//$.wrapperView.add(backgroundView);
//$.insideView.add(imagecontainerView);

$.leftButton.font= { fontSize:80, fontFamily:"ChalkboardSE-Regular" };
$.rightButton.font = { fontSize:80, fontFamily:"ChalkboardSE-Regular" };
$.closeButton.addEventListener('click', function () {
	    CONFIG.container.close();
	    CONFIG.container.remove(CONFIG.container.wrapperView);
});