/**
 * @jsx React.DOM
 */

'use strict';

var React = require('react/addons');
require('../../styles/CurrentArea.css');

var url_base = "http://uom-13melb.herokuapp.com/area/";

var CurrentArea = React.createClass({
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
