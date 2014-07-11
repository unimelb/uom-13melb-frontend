/**
 * @jsx React.DOM
 */

'use strict';

var React = require('react/addons');
require('../../styles/Manager.css');
var config = require("../config.js");
var common = require("../common.jsx");

var ManagerChildrenList = require("./ManagerChildrenList.jsx");
var ManagerContactList = require("./ManagerContactList.jsx");

var Manager = React.createClass({
	getInitialState : function () {
		return {
			path : [{"root" : "root"}],
			children : [],
			contacts : [],
			form_values : {},
			loading : false
		};
	},
	componentDidMount : function () {
		this.handleAreaSelect(this.props.area);
	},
	componentWillReceiveProps : function (new_props) {
		this.handleAreaSelect(new_props.area);
	},
	refresh_children : function () {
		$.ajax({
			url : config.base_url + common.path2area(this.state.path) + "/children",
			type : "GET",
			success : function (children) {
				this.setState({
					children : children,
					loading : false
				});
			}.bind(this)
		});
	},
	handleAreaSelect : function (area_id) {
		this.setState({loading : true});
		var url = config.base_url + area_id;
		common.multi_ajax([
			url + "/path",
			url + "/children",
			url + "/all_contacts"
		], function (results) {
			var area = results[0][results[0].length - 1];
			this.setState({
				path : results[0],
				children : results[1],
				contacts : results[2],
				form_values : {
					name : area.name,
					note : area.note
				},
				loading : false
			});
		}.bind(this));
		return false;
	},
	handleAreaUpdate : function () {
		this.setState({loading : true});
		$.ajax({
			url : config.base_url + common.path2area(this.state.path),
			type : "PUT",
			data : this.state.form_values,
			success : function () {
				var new_path = this.state.path;
				new_path[new_path.length - 1].name = this.state.form_values.name;
				this.setState({
					path : new_path,
					loading : false
				});
			}.bind(this)
		});
		return false;
	},
	handleAreaMove : function () {

	},
	handleRemoveChild : function (child_id) {
		$.ajax({
			url : config.base_url + child_id,
			type : "DELETE",
			success : function () {
				this.refresh_children();
			}.bind(this)
		})
	},
	handleNewChild : function () {
		var area_id = common.path2area(this.state.path);
		this.setState({loading : true});
		$.ajax({
			url : config.base_url + area_id,
			type : "POST",
			data : {name : "New area"},
			success : function () {
				this.handleAreaSelect(area_id);
			}.bind(this)
		});
	},
	handleFormEntry : function (e) {
		var new_form_values = this.state.form_values;
		new_form_values[e.target.name] = e.target.value;
		this.setState({form_values : new_form_values});
	},
	render: function () {
		
		var path = this.state.path.map(function (segment, index) {
			if (index == this.state.path.length - 1) return segment.name;
			else return (
				<a key={segment.area_id} href={"#manage/" + segment.area_id}>
					{segment.name + " › "}
				</a>
			);
		}.bind(this));

		var form = (
			<form>
				<label htmlFor="area_name">Name:</label>
				<input type="text" name="name" ref="name" value={this.state.form_values.name} onChange={this.handleFormEntry} />
				<label htmlFor="area_note">Note:</label>
				<input type="text" name="note" ref="note" value={this.state.form_values.note} onChange={this.handleFormEntry} />
				<button onClick={this.handleAreaUpdate}>Update</button>
				<button onClick={this.handleAreaMove}>Move to new parent</button>
			</form>
		);

		var loading = this.state.loading
			? loading
			: null;

		return (
			<div className="page-inner">
				<div role="main" className="main">
					<section>
						<h1>Manager</h1>
						<h2>{path}</h2>
						{loading}
						{form}
						<ManagerChildrenList
							children={this.state.children}
							onAreaSelect={this.handleAreaSelect}
							onRemoveChild={this.handleRemoveChild}
							onNewChild={this.handleNewChild} />
						<ManagerContactList />
					</section>
				</div>
			</div>
		);
	}
});

module.exports = Manager;
