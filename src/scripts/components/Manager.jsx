/**
 * @jsx React.DOM
 */

'use strict';

var React = require('react/addons');
require('../../styles/Manager.css');
var config = require("../config.js");
var common = require("../common.js");

var Manager = React.createClass({
	willRecieveProps : function (new_props) {
		this.handleAreaSelect(new_props.area);
	},
	handleAreaSelect : function (area_id) {
		var url = config.url_base + area_id;
		common.multi_ajax([
			url + "/path",
			url + "/children"
		], function (results) {
			this.setState({
				area_path : results[0],
				area_children : results[1]
			});
		});
	},
	render: function () {
		return (
			<div />//<ManagerAreaBrowser />
		);
	}
});

module.exports = Manager;
