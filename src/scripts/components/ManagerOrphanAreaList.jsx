/**
 * @jsx React.DOM
 */

'use strict';

var React = require('react/addons');

var ManagerOrphanAreaList = React.createClass({
	render: function () {
		var orphan_dom = this.props.orphans.map(function (orphan) {
			return (
				<li>
					{orphan.name}
					<span className="controls">
						<a onClick={function () { this.props.onMoveChild(orphan); }.bind(this)}>
							<svg className="icon" dangerouslySetInnerHTML={{__html: '<use xlink:href="#pen" />'}}></svg> Move
						</a>
						<a>
							<svg className="icon" dangerouslySetInnerHTML={{__html: '<use xlink:href="#trash" />'}}></svg> Delete
						</a>
					</span>
				</li>
			);
		}.bind(this));
		return (
			<div>
				<h1>Hidden categories</h1>
				<p><a className="button-small soft" onClick={this.props.onHideOrphans}>View sub-categories</a></p>
				<ul className="checklist no-check">
					{orphan_dom}
				</ul>
			</div>
		);
	}
});

module.exports = ManagerOrphanAreaList;
