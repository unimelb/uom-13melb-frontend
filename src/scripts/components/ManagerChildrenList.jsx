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
				<h1 id="manager-children">Sub-categories</h1>
				<p>
					<a className="button-small float-right" onClick={this.props.onNewChild}>New sub-category</a>&nbsp;
					<a className="button-small soft" onClick={this.props.onShowOrphans}>View hidden categories</a>
				</p>
				<ul className="checklist no-check">{children_list}</ul>
				<form encType="multipart/form-data" ref="bulk_import" action={this.props.domain + "area/" + this.props.area_id + "/upload"} method="post">
					<fieldset>
						<input type="file" name="datafile" />
						<input type="submit" value="Bulk import" />
					</fieldset>
				</form>
			</div>
		);
	}
});

module.exports = ManagerChildrenList;
