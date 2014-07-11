/**
 * @jsx React.DOM
 */

'use strict';

var React = require('react/addons');
var config = require("./config.js");

module.exports = {
	multi_ajax : function(calls, callback) {
		var count = calls.length;
		if (!count) callback([]);
		var results = [];
		calls.forEach(function (call, index) {
			if (!(call instanceof Object)) {
				call = {url : call};
			}
			call.success = function (data) {
				results[index] = data;
				if (!--count) callback(results);
			}
			if (!call.dataType) call.dataType = "json";
			$.ajax(call);
		});
	},
	fetch_contact_info : function (areas, callback) {
		this.multi_ajax(
			areas.map(function (area) {
				return config.base_url + area + "/all_contacts";
			}),
			function (results) {
				var map = {};
				areas.forEach(function (area, index) {
					map[area] = results[index];
				});
				callback(map);
			}
		);
	},
	path2area : function (path) {
		if (!path.length) return "root";
		else return path[path.length -1].area_id;
	},
	loading : <p className="spinner"><img src="//s3.amazonaws.com/uom-13melb/spinner_32.gif" /></p>
};