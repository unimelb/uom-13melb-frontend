/**
 * @jsx React.DOM
 */

'use strict';

var React = require('react/addons');
var config = require("./config.js");

module.exports = {
	cache : {},
	cache_keys : [],
	add_cache : function (key, value) {
		if (this.cache_keys.length > 10000) {
			delete this.cache[this.cache_keys.shift()];
		}
		this.cache[key] = value;
		this.cache_keys.push(key);
		console.log(key + " added to cache");
	},
	get_cache : function (key) {
		if (key in this.cache) {
			console.log("cache hit for " + key);
			return this.cache[key];
		} else return false;
	},
	multi_ajax : function(calls, callback) {
		var count = calls.length;
		if (!count) callback([]);
		var results = [];
		calls.forEach(function (call, index) {
			if (!(call instanceof Object)) {
				call = {url : call};
			}
			var key = call.url + (call.data ? JSON.stringify(call.data) : "");
			call.success = function (data, in_cache) {
				results[index] = data;
				if (in_cache !== true) this.add_cache(key, data);
				if (!--count) callback(results);
			}.bind(this);
			if (!call.dataType) call.dataType = "json";
			var data = this.get_cache(key);
			if ((!call.type || call.type == "GET") && data) call.success(data, true);
			else $.ajax(call);
		}.bind(this));
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
	loading : function (loading) {
		return loading
			? <p className="spinner"><img src="//s3.amazonaws.com/uom-13melb/spinner_32.gif" /></p>
			: <p className="spinner"></p>
		;
	}
};