/**
 * @jsx React.DOM
 */

'use strict';

var React = require('react/addons');
require('../../styles/Contacts.css');

var AreaContacts = require("./AreaContacts.jsx");

var url_base = "http://uom-13melb.herokuapp.com/area/";
var cutoff = 10;

var Contacts = React.createClass({
	getInitialState: function () {
		return {
			path: [],
			contacts: [],
			descendents: {area: null, children: []},
			descendent_contact_count: 0
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
			url: url_base + new_props.area + "/descendents",
			dataType: "json",
			success: function (data) {
				this.setState({descendents: data});
			}.bind(this)
		});
		$.ajax({
			url: url_base + new_props.area + "/descendent_contact_count",
			dataType: "json",
			success: function (data) {
				this.setState({descendent_contact_count: data.contacts});
			}.bind(this)
		})
	},
	selectArea : function (area) {
		this.props.onAreaSelect(area);
	},
	render: function () {
		var contact_display = this.state.path.map(function (element) {
			return <AreaContacts area={element} />;
		});

		var subcontact_display = function (children) {
			return children.map(function (child) {
				var subcontacts = subcontact_display(child.children);
				return (
					<div className="child_area">
						<AreaContacts area={child.area} />
						{subcontacts}
					</div>
				);
			});
		};

		var descendent_contacts = subcontact_display(this.state.descendents.children);

		var explore = function (tree) {
			var sub_list = tree.children.map(explore);
			var load_area = function () {
				this.selectArea(tree.area.area_id);
				return false;
			}.bind(this);
			return (
				<li>
					<a href="#" onClick={load_area}>{tree.area.name}</a>
					<ul>
						{sub_list}
					</ul>
				</li>
			);
		}.bind(this);

		var descendents = this.state.descendents.children.map(explore);
		if (this.state.descendent_contact_count > cutoff) {
			return (
				<div>
					<h3>Descendents</h3>
					<ul>{descendents}</ul>
				</div>
			);
		} else {
			return (
				<div>
					{contact_display}
					{descendent_contacts}
				</div>
			);
		}
	}
});

module.exports = Contacts;
