/**
 * docs.js
 * 
 * No need to define a columns obejct in the the model config.
 * Define collection name as the name of mongoDB collection to use.
 */

exports.definition = {

	config: {
	    	adapter: {
			type: "ti-collectiveaccess",
			collection_name: "docs",
			base_url: "http://fakerest.site.192.168.20.10.xip.io/login_ok.txt"
		}
	},
	
	extendModel: function(Model) {
		_.extend(Model.prototype, {
			
			idAttribute : "_id",
			
			validate: function(attrs) {
				// add here validation for single attributes returning errors 
			}
		});
		return Model;
	},
	
	extendCollection: function(Collection) {
		_.extend(Collection.prototype, {
			// extended functions and properties go here
		});
		return Collection;
	}

};


