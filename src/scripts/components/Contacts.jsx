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
	selectArea : function (area) {
		this.props.onAreaSelect(area);
	},
	render: function () {

		var class_name = this.props.isSearching ? "hidden" : "";

		if (!this.props.contact_info) {
			return <p><img src="images/spinner_32.gif" /></p>;
		} if (this.props.showDescendents && this.props.area_info.descendent_contact_count > cutoff) {

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

			var descendents = this.props.area_info.descendents.children.map(function (child) {
				return explore(child, 3);
			});

			return (
				<div className={class_name}>
					<h3>Descendents</h3>
					<ul>{descendents}</ul>
				</div>
			);
		} else {

			var contact_display = this.props.path.map(function (element) {
				return <AreaContacts area={element} contacts={this.props.contact_info[element.area_id]} />;
			}.bind(this));

			var subcontact_display = function (children) {
				return children.map(function (child) {
					var area_contacts = <AreaContacts area={child.area} contacts={this.props.contact_info[child.area.area_id]} />;
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
				? <div><hr />{subcontact_display(this.props.area_info.descendents.children)}</div>
				: /*this.state.descendent_contact_count
					? <p className="descendent_notice">{"Has " + this.state.descendent_contact_count + " descendent areas; select to view."}</p>
					: */null
			;						
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
