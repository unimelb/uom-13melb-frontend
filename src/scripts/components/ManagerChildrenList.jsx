/**
 * @jsx React.DOM
 */

'use strict';

var React = require('react/addons');

var ManagerChildrenList = React.createClass({
	componentDidUpdate : function () {
		
	},
	componentDidMount : function () {
		this.componentDidUpdate();
	},
	render: function () {
		var moving = this.props.moving.map(function (area) { return area.area_id; });
		var children_list = this.props.children.map(function (child) {
			if (moving.indexOf(child.area_id) > -1) return null;
			return (
				<li key={child.area_id}>
					<a data-no-scroll href={"#manage/" + child.area_id}>
						{child.name}
					</a>
					<span className="controls">
						<a onClick={function () { this.props.onMoveChild(child); }.bind(this)}>
							<svg className="icon" dangerouslySetInnerHTML={{__html: '<use xlink:href="#pen" />'}}></svg> Move
						</a>
						<a onClick={function () { this.props.onRemoveChild(child.area_id); }.bind(this)}>
							<svg className="icon" dangerouslySetInnerHTML={{__html: '<use xlink:href="#trash" />'}}></svg> Remove
						</a>
					</span>
				</li>
			);
		}.bind(this));

		return (
			<div>
				<p>
					{this.props.parent
						? <span><a className="button-small cta" onClick={function () {
							this.props.onAreaSelect(this.props.parent);
						}.bind(this)}>Go up</a>&nbsp;</span>
						: null
					}
					<a className="button-small float-right" onClick={this.props.onNewChild}>New sub-category</a>&nbsp;
					<a className="button-small soft" onClick={this.props.onShowOrphans}>View hidden categories</a>
				</p>
				<ul className="checklist no-check">{children_list}</ul>
			</div>
		);
	}
});

module.exports = ManagerChildrenList;
