/**
 * @jsx React.DOM
 */

'use strict';

var React = require('react/addons');
require('../../styles/ManagerChildrenList.css');

var ManagerChildrenList = React.createClass({
	render: function () {
		var children_list = this.props.children.map(function (child) {
			return (
				<li key={child.area_id}>
					<a href={"#manage/" + child.area_id}>
						{child.name}
					</a>
					<button onClick={function () { this.props.onRemoveChild(child.area_id); }.bind(this)}>
						Remove
					</button>
				</li>
			);
		}.bind(this)).concat([<li key="new_child"><button onClick={this.props.onNewChild}>New child</button></li>]);
		return (
			<div className="manager_lists">
				<h3>Children</h3>
				<ul>{children_list}</ul>
			</div>
		);
	}
});

module.exports = ManagerChildrenList;
