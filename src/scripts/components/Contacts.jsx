/**
 * @jsx React.DOM
 */

'use strict';

var React = require('react/addons');
require('../../styles/Contacts.css');

var url_base = "http://uom-13melb.herokuapp.com/area/";

var Contacts = React.createClass({
	getInitialState: function () {
		return {
			path: [],
			contacts: [],
			descendents: {area: null, children: []}
		};
	},
	componentWillReceiveProps: function (new_props) {
		$.ajax({
			url: url_base + new_props.area + "/path",
			dataType: "json",
			success: function (data) {
				this.setState({path: data});
			}.bind(this)
		});
		$.ajax({
			url: url_base + new_props.area + "/all_contacts",
			dataType: "json",
			success: function (data) {
				this.setState({contacts: data});
			}.bind(this),
			error: function (xhr, status, err) {
				console.error(status, err.toString());
			}.bind(this)
		});
		$.ajax({
			url: url_base + new_props.area + "/descendents",
			dataType: "json",
			success: function (data) {
				this.setState({descendents: data});
			}.bind(this)
		});
	},
	render: function () {
		var path_info = this.state.path.map(function (element) {
			if (element.note) {
				return [
					<h3>{element.name}</h3>
				,
					<p>{element.note}</p>
				];
			} else {
				return null;
			}
		});

		var explore = function (tree) {
			var sub_list = tree.children.map(explore);
			console.log("tree");
			console.log(tree);
			return (
				<li>
					> {tree.area.name}
					<ul>
						{sub_list}
					</ul>
				</li>
			);
		}

		var descendents = this.state.descendents.children.map(explore);
		
		return (
			<div>
				{path_info}
				{this.state.contacts}
				Descendents:
				{descendents}
			</div>
		);
	}
});

module.exports = Contacts;
