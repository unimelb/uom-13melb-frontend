/**
 * @jsx React.DOM
 */

'use strict';

var React = require('react/addons');
require('../../styles/CurrentArea.css');

var url_base = "http://uom-13melb.herokuapp.com/area/";

var CurrentArea = React.createClass({
	/*getInitialState: function () {
		return {path: []};
	},
	componentWillReceiveProps: function (new_props) {
		$.ajax({
			url: url_base + new_props.area + "/path",
			dataType: "json",
			success: function (data) {
				this.setState({"path" : data});
			}.bind(this)
		});
	},*/
	render: function () {
		var pathstr = this.props.path.map(function (path) {
			return path.name;
		}).join(" > ");

		return (
			<h2 className="current_area">
				{pathstr}
			</h2>
		);
	}
});

module.exports = CurrentArea;
