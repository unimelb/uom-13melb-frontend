/**
 * @jsx React.DOM
 */

'use strict';

var React = require('react/addons');
require('../../styles/CurrentArea.css');

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
