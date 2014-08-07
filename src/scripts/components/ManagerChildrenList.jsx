/**
 * @jsx React.DOM
 */

'use strict';

var React = require('react/addons');
require('../../styles/ManagerChildrenList.css');

var ManagerChildrenList = React.createClass({
	componentDidUpdate : function () {
		var form = this.refs.bulk_import.getDOMNode();
		$(form).ajaxForm(function (data) {
			this.props.onDidBulkImport(data);
			setTimeout(function () {
				$(form).find("input[type=submit]").removeAttr("disabled");
			}, 1000);
		}.bind(this));
		$(form).on("submit", function () {
			$(form).find("input[type=submit]").attr("disabled", "disabled");
		});
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
					<a href={"#manage/" + child.area_id}>
						{child.name}
					</a>
					<button onClick={function () { this.props.onRemoveChild(child.area_id); }.bind(this)}>
						Remove
					</button>
					<button onClick={function () { this.props.onMoveChild(child); }.bind(this)}>
						Move
					</button>
				</li>
			);
		}.bind(this)).concat([
			<li key="new_child">
				<button onClick={this.props.onNewChild}>New child</button>
				<form encType="multipart/form-data" ref="bulk_import" action={"http://localhost:5000/area/" + this.props.area_id + "/upload"} method="post">
					<input type="file" name="datafile" />
					<input type="submit" value="Bulk import" />
				</form>
			</li>
		]);
		return (
			<div className="manager_lists">
				<h3>Children</h3>
				<ul>{children_list}</ul>
			</div>
		);
	}
});

module.exports = ManagerChildrenList;
