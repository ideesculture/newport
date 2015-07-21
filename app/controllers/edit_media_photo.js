var APP = require("core");
var CONFIG = arguments[0];
var COMMONS = require("ca-commons");



$.init = function() {
	$.bundleItemName.text = "Medias";
	if (CONFIG.image_file){
		var image_file=COMMONS.getRemoteFile(CONFIG.image_file);
		$.imageView.image = image_file; 
	}
}
// Folding bundle 
$.bundleItem.addEventListener("click", function(_event) {
	APP.openLoading();
	setTimeout(function() {
		if ($.bundleItemElements.visible == true) {			
			$.bundleItemElements.visible = false;
			$.bundleItemElements.height = 1;
			$.addNewButtonView.visible = false;
			$.addNewButtonView.height = 1;
			$.arrowIcon.image = "/icons/black/ca_arrow_down.png";
		} else {
			$.bundleItemElements.visible = true;
			$.bundleItemElements.height = Ti.UI.SIZE;
			$.addNewButtonView.visible = true;
			$.addNewButtonView.height = Ti.UI.SIZE;
			$.arrowIcon.image = "/icons/black/ca_arrow_up.png";
		}
	},300);
	APP.closeLoading();
	
});

$.addNewButton.addEventListener("click", function(_event) {
	//attempt to open camera, for the user to take pictures of an object
	Titanium.Media.showCamera({
		success:function(event) {
			// called when media returned from the camera
			Ti.API.debug('Our type was: '+event.mediaType);
			if(event.mediaType == Ti.Media.MEDIA_TYPE_PHOTO) {
				var imageView = Ti.UI.createImageView({
					width:win.width,
					height:win.height,
					image:event.media
				});
				win.add(imageView);
			} else {
				alert("got the wrong type back ="+event.mediaType);
			}
		},
		cancel:function() {
			// called when user cancels taking a picture
		},
		error:function(error) {
			// called when there's an error
			var a = Titanium.UI.createAlertDialog({title:'Camera'});
			if (error.code == Titanium.Media.NO_CAMERA) {
				a.setMessage('Please run this test on device');
			} else {
				a.setMessage('Unexpected error: ' + error.code);
			}
			a.show();
		},
		saveToPhotoGallery:true,
	    // allowEditing and mediaTypes are iOS-only settings
		allowEditing:true,
		mediaTypes:[Ti.Media.MEDIA_TYPE_VIDEO,Ti.Media.MEDIA_TYPE_PHOTO]
	});
});

$.addFileButton.addEventListener("click", function(_event) {
   Titanium.Media.openPhotoGallery({
       success:function(event)
       {             
           Ti.API.debug('Our type was: '+event.mediaType);
           if(event.mediaType == Ti.Media.MEDIA_TYPE_PHOTO)
           {
               UploadPhoto(event.media);
           }
       },
       cancel:function()
       {   
       },
       error:function(err)
       {
           Ti.API.error(err);
       },
       mediaTypes:[Ti.Media.MEDIA_TYPE_PHOTO]
   });
});

function UploadPhoto(media){
       // alert('what should i do NOW ??? ???');
       	$.imageView.image = media;
}

$.init();