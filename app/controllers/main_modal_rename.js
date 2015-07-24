

var APP = require("core");
var COMMONS = require("ca-commons");
var CONFIG = arguments[0];
var OBJECT_EDIT = require("models/ca-object-edit")();

APP.log("debug", CONFIG);

var type_id = CONFIG.obj_data.info1;

$.TABLE = "ca_objects";

