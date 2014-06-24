/**
 * @jsx React.DOM
 */

'use strict';

var React = require('react/addons');
require('../../styles/Contacts.css');

var AreaContacts = require("./AreaContacts.jsx");

var url_base = "http://uom-13melb.herokuapp.com/area/";
var cutoff = 40;

var Contacts = React.createClass({
	counter : 0,
	getInitialState: function () {
		return {
			path: [],
			contacts: [],
			descendents: {area: null, children: []},
			descendent_contact_count: 0
		};
	},
	count : function (n) {
		this.counter += n;
		console.log(this.counter);
	},
	getCount : function () {
		return this.counter;
	},
	componentWillReceiveProps: function (new_props) {
		console.log("Contacts area: " + new_props.area);
		var done = 3;
		var newState = {};
		$.ajax({
			url: url_base + new_props.area + "/path",
			dataType: "json",
			success: function (data) {
				newState.path = data;
				if (!--done) this.setState(newState);
			}.bind(this)
		});
		$.ajax({
			url: url_base + new_props.area + "/descendents",
			dataType: "json",
			success: function (data) {
				newState.descendents = data;
				if (!--done) this.setState(newState);
			}.bind(this)
		});
		$.ajax({
			url: url_base + new_props.area + "/descendent_contact_count",
			dataType: "json",
			success: function (data) {
				newState.descendent_contact_count = data.contacts;
				if (!--done) this.setState(newState);
			}.bind(this)
		})
	},
	componentWillMount : function () {
		this.componentWillReceiveProps(this.props);
	},
	selectArea : function (area) {
		this.props.onAreaSelect(area);
	},
	render: function () {

		var contact_display = this.state.path.map(function (element) {
			return <AreaContacts area={element} />;
		}.bind(this));

		var subcontact_display = function (children) {
			return children.map(function (child) {
				var area_contacts = <AreaContacts area={child.area} />;
				var subcontacts = subcontact_display(child.children);
				return (
					<div className="child_area">
						{area_contacts}
						{subcontacts}
					</div>
				) ;
			}.bind(this));
		}.bind(this);

		var descendent_contacts = this.props.showDescendents
			? <div><hr />{subcontact_display(this.state.descendents.children)}</div>
			: this.state.descendent_contact_count
				? <p className="descendent_notice">{"Has " + this.state.descendent_contact_count + " descendent areas; select to view."}</p>
				: null
		;

		var explore = function (tree, depth) {
			var sub_list = null;
			if (tree.children.length) {
				if (depth) {
					sub_list = tree.children.map(function (child) {
						return explore(child, depth - 1);
					});
				} else sub_list = <li>...</li>;
			}
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

		var descendents = this.state.descendents.children.map(function (child) {
			return explore(child, 3);
		});

		var class_name = this.props.isSearching ? "hidden" : "";
		if (this.state.descendent_contact_count > cutoff && this.props.showDescendents) {
			return (
				<div className={class_name}>
					<h3>Descendents</h3>
					<ul>{descendents}</ul>
				</div>
			);
		} else {
			return (
				<div className={class_name}>
					{contact_display}
					{descendent_contacts}
				</div>
			);
		}
	}
});

module.exports = Contacts;
