/**
 * @jsx React.DOM
 */

'use strict';

var React = require('react/addons');
require('../../styles/ManagerOrphanAreaList.css');

var ManagerOrphanAreaList = React.createClass({
	render: function () {
		var orphan_dom = this.props.orphans.map(function (orphan) {
			return (
				<li>
					{orphan.name}
					<button onClick={function () { this.props.onMoveChild(orphan); }.bind(this)}>Move</button>
					<button>Permanently Remove</button>
				</li>
			);
		}.bind(this));
		return (
			<div>
				<button onClick={this.props.onHideOrphans}>View children</button>
				<h3>Orphans</h3>
				<ul>
					{orphan_dom}
				</ul>
			</div>
		);
	}
});

module.exports = ManagerOrphanAreaList;
