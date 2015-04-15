/**
 * Controller for sending the data stored in "temp" table into the real distant db
 * 
 * 
 * @uses core
 */
var APP = require("core");
var HTTP = require("http");


var COMMONS = require("ca-commons");
var CONFIG = arguments[0];
var maxwidth = Ti.Platform.displayCaps.platformWidth;
var maxheight = Ti.Platform.displayCaps.platformHeight;
var OBJECT_EDIT = require("models/ca-object-edit")();



			
		
/**
 * Initializes the controller
 */
$.init = function() {

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

	//TEST
	//ENVOI de 1 donnée
	//try: send ONE data to the server
	var fieldToSave = {}; 
	var remove_attributes = []; 
	var attributes = {}; 
	var temptab = []; 
	var tempobj = {};
	var json = {}; 
	var data = OBJECT_EDIT.getSavedData(); 
	//$.label.text = data; 
	if (data.length>0){
		fieldToSave = data[0];
		//YOU HAVE TO SEND AN OBJET, NOT A STRING
		/*
		json = "{ 
			\"remove_attributes\" : [\""+fieldToSave.attribut+"\"],
			\"attributes\" : {
				\""+fieldToSave.attribut+"\" : [
        			{
            			\"locale\" : \"en_US\",
            			\""+fieldToSave.attribut+"\" : \""+fieldToSave.valeur+"\"
        			}
    			]
			}
		}";
		*/

		//builds the object to be sent
		tempobj["locale"]= "en_US"; 
		tempobj[fieldToSave.attribut]= fieldToSave.valeur; 
		temptab[0]= tempobj; 
		attributes[fieldToSave.attribut] = temptab; 
		remove_attributes[0] = fieldToSave.attribut;
		json.remove_attributes = remove_attributes;
		json.attributes = attributes; 
		//alert(JSON.stringify(json)); 



		$.label.text = JSON.stringify(json); 
		var ca_url = APP.Settings.CollectiveAccess.urlForObjectSave.url.replace(/ID/g,fieldToSave.object_id);
		//ca_url = ca_url.replace("?pretty=1&format=edit", "");
		$.label2.text = ca_url; 

		var error = function() {
			var dialog = Ti.UI.createAlertDialog({
			    message: 'Couldn\'t send data to the server',
			    ok: 'OK',
			    title: 'Error'
			  }).show();
		}

		var handleData = function(){
			var dialog = Ti.UI.createAlertDialog({
			    message: 'it worked!',
			    ok: 'OK',
			    title: 'Youpi'
			  }).show();
		}

		var callback = function(){
			var dialog = Ti.UI.createAlertDialog({
			    message: 'whatever that means',
			    ok: 'got it',
			    title: 'CALLBACK'
			  }).show();

		}



		HTTP.request({
			timeout: 2000,
			async:false,
			headers: [{name: 'Authorization', value: APP.authString}],
			type: "PUT",
			format: "JSON",
			data: json,
			//format:"text",
			url: ca_url,
			passthrough: callback,
			success: handleData,
			failure: error
		});

	}
	
	


	 /*
	 * @param {Object} _params The request paramaters to send
	 * @param {String} _params.url The URL to retrieve data from
	 * @param {Function} _params.callback The function to run on data retrieval
	 * @param {Function} _params.error The function to run on error
	 * @param {Number} _params.cache The length of time to consider cached data 'warm'
	 */
/*	  
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

	//$.label.text = "This will send data to the server when code is done.";



	//WRONG JSON
	//IDNO =/= object id !
	/*json = "{ 
		\"intrinsic_fields\" : { 
			\"idno\" : \""+ fieldToSave.object_id +"\",
		},
		\"remove_attributes\" : [\""+fieldToSave.attribut+"\"],
		\"attributes\" : {
			\""+fieldToSave.attribut+"\" : [
    			{
        			\"locale\" : \"en_US\",
        			\""+fieldToSave.attribut+"\" : \""+fieldToSave.valeur+"\"
    			}
			]
		}
	}";*/
};

// Kick off the init
$.init();