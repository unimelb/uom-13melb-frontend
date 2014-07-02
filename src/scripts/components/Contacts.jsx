/**
 * @jsx React.DOM
 */

'use strict';

var React = require('react/addons');
require('../../styles/Contacts.css');

var AreaContacts = require("./AreaContacts.jsx");

var cutoff = 40;

var Contacts = React.createClass({
	selectArea : function (area) {
		this.props.onAreaSelect(area);
		return false;
	},
	render: function () {

		if (!this.props.contact_info) {

			// still loading contact info, so spin
			return <p className="spinner"><img src="images/spinner_32.gif" /></p>;

		} else if (this.props.showDescendents && this.props.area_info.descendent_contact_count > cutoff) {

			// too many descendents, show tree
			var explore = function (tree, depth) {
				var sub_list = null;
				if (tree.children.length) {
					if (depth) {
						sub_list = <ul>{tree.children.map(function (child) {
							return explore(child, depth - 1);
						})}</ul>;
					} else sub_list = <ul><li>...</li></ul>;
				}
				var load_area = function () {
					this.selectArea(tree.area.area_id);
					return false;
				}.bind(this);
				return (
					<li key={tree.area.area_id}>
						<a href="#" onClick={load_area}>{tree.area.name}</a>
						{sub_list}
					</li>
				);
			}.bind(this);

			var descendents = this.props.area_info.descendents.children.map(function (child) {
				return explore(child, 3);
			});

			return (
				<div>
					<h3>Descendents</h3>
					<ul>{descendents}</ul>
				</div>
			);
		} else {

			// show all contacts above, and below if set to
			var contact_display = this.props.path.map(function (element, index) {
				return <AreaContacts
					key={element.area_id} area={element}
					contacts={this.props.contact_info[element.area_id]}
					onAreaSelect={index == this.props.path.length - 1 ? false : this.props.onAreaSelect} />;
			}.bind(this));

			var subcontact_display = function (children) {
				return children.map(function (child) {
					var area_contacts = <AreaContacts
						area={child.area}
						contacts={this.props.contact_info[child.area.area_id]}
						onAreaSelect={this.props.onAreaSelect} />;
					var subcontacts = subcontact_display(child.children);
					return (
						<div key={child.area.area_id} className="child_area">
							{area_contacts}
							{subcontacts}
						</div>
					) ;
				}.bind(this));
			}.bind(this);

			var num_descendents = this.props.area_info.descendent_contact_count || (
				this.props.path.length
					? this.props.path[this.props.path.length - 1].descendent_contact_count
					: 0
			);
			var descendent_contacts = this.props.showDescendents && num_descendents
				? <div><hr />{subcontact_display(this.props.area_info.descendents.children)}</div>
				: num_descendents
					? <p className="descendent_notice">{"Has " + num_descendents + " un-shown descendent contacts; select to view."}</p>
					: null
			;						
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
