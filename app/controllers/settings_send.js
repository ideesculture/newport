/**
 * Controller for sending the data stored in "temp" table into the real distant db
 * settings_send.js
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
var id ="";
var attribut = ""; 



			
		
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

	var fieldToSave = {}; 
	var remove_attributes = []; 
	var attributes = {}; 
	var temptab = []; 
	var tempobj = {};
	var json = {}; 
	var data = OBJECT_EDIT.getSavedData(); 
	var row;
	//$.label.text = data; 
	if (data.length>0){
		for(row in data){
			json = {};
			fieldToSave = data[row];

			id = fieldToSave.object_id;
			attribut = fieldToSave.attribut;

			//builds the object to be sent:
			//1) remove_attributes
			if(fieldToSave.is_modified){
				remove_attributes[0] = fieldToSave.attribut;
				json.remove_attributes = remove_attributes;
			}
			//2) attributes
			tempobj ={}; attributes = {}; 
			tempobj["locale"]= "en_US"; 
			tempobj[fieldToSave.attribut]= fieldToSave.valeur; 
			temptab[0]= tempobj; 
			attributes[fieldToSave.attribut] = temptab; 
			json.attributes = attributes; 


			//alert(JSON.stringify(json)); 

			/******************************
			SENDS THE REQUEST 
			*************************/
			var ca_url = APP.Settings.CollectiveAccess.urlForObjectSave.url.replace(/ID/g,fieldToSave.object_id);
			$.label2.text = "Data export"; 


			
			var error = function() {
				var dialog = Ti.UI.createAlertDialog({
				    message: 'Couldn\'t send data to the server',
				    ok: 'OK',
				    title: 'Error'
				  }).show();
			}

			var handleData = function( o1, o2){
				alert("go erase data: "+ o1 + " , "+ o2);
				OBJECT_EDIT.cleanTempInsertTable(o1, o2);

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
				url: ca_url,
				passthrough: callback,
				success: handleData(id, attribut),
				failure: error
			});
		
		
		}

		$.label.text = "Data has been sent to the server successfully :)";
		
	}
	else
	{
		$.label2.text = "Data export"; 
		$.label.text = "There are no modifications to send to the server";

	}



};

// Kick off the init
$.init();