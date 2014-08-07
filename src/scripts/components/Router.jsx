/**
 * @jsx React.DOM
 */

"use strict";

var React = require('react/addons');
var Backbone = require("backbone");

var DirectoryBrowser = require("./DirectoryBrowser.jsx");
var Manager = require("./Manager.jsx");

var render_main = function (component) {
	React.renderComponent(component, document.getElementById('main-content')); // jshint ignore:line		
}

var Workspace = Backbone.Router.extend({
	routes: {
		"": "default",
		"area(/:area)" : "default",
		"manage(/:area)" : "manage"
	},
	default : function (area) {
		if (!area) area = "root";
		render_main(<DirectoryBrowser area={area} router={this} />);
	},
	manage : function (area) {
		if (!area) area = "root";
		render_main(<Manager area={area} router={this} />);
	}
});

var router = new Workspace();
Backbone.history.start();
