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
			else return <span key={index}><a onClick={function () {
				this.props.onAreaSelect(index ? path.area_id : "root");
				return false;
			}.bind(this)} href={"#"}>{path.name}</a> &rsaquo; </span>;
		}.bind(this));

		return (
			<h1 className="current_area path">
				{pathstr}
			</h1>
		);
	}
});

module.exports = CurrentArea;
