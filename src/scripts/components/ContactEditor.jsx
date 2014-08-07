/**
 * @jsx React.DOM
 */

'use strict';

var React = require('react/addons');
require('../../styles/ContactEditor.css');

var dfs = function (all_contacts, contact_id) {
	if (!all_contacts.length) return null;
	for (var i = all_contacts.length - 1; i >= 0; i--) {
		var collection = all_contacts[i];
		for (var j = collection.contacts.length - 1; j >= 0; j--) {
			if (collection.contacts[j].contact_id == contact_id) {
				return collection.contacts[j];
			}
		};
		var in_successor = dfs(collection.successors);
		if (in_successor != null) return in_successor;
	};
	return null;
}

var ContactEditor = React.createClass({
	getInitialState : function () {
		return {
			form_values : {}
		};
	},
	handleFormEntry : function (e) {
		var new_form_values = this.state.form_values;
		new_form_values[e.target.name] = e.target.value;
		this.setState({form_values : new_form_values});
	},
	render: function () {
		var fields = [
			"first_name", "last_name", "position",
			"phone", "email", "address",
			"note", "url", "fax"
		];
		var contact = null;
		var contact_info = {};
		var form_inputs = [];
		if (this.props.contact_id) contact = dfs(this.props.contacts, this.props.contact_id);
		fields.forEach(function (key) {
			if (contact && contact.contact_info[key]) {
				contact_info[key] = contact.contact_info[key];
			} else {
				contact_info[key] = "";
			}
			form_inputs.push(
				<label key={key}>{key}
					<input
						type="text" ref={key} name={key}
						value={this.state.form_values[key] || contact_info[key]}
						onChange={this.handleFormEntry} />
				</label>
			);
		}.bind(this));
		return (
			<div className="contact-editor">
				<h3>Edit contact</h3>
				{form_inputs}
				<button onClick={function () {
					this.props.onSubmitContact(this.state.form_values)
				}.bind(this)}>Update</button>
				<button onClick={this.props.onCancelEditContact}>Cancel</button>
			</div>
		);
	}
});

module.exports = ContactEditor;
