/**
 * @jsx React.DOM
 */

'use strict';

var React = require('react/addons');
require('../../styles/CurrentArea.css');

var CurrentArea = React.createClass({
	render: function () {

		// generate path string
		var pathstr = this.props.path.map(function (path, index) {
			if (index == this.props.path.length - 1) return path.name;
			else return <span><a href={"#area/" + path.area_id}>{path.name}</a> > </span>;
		}.bind(this));

		return (
			<h2 className="current_area">
				{pathstr}
			</h2>
		);
	}
});

module.exports = CurrentArea;
