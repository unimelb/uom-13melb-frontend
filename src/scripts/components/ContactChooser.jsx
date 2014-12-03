/**
 * @jsx React.DOM
 */

'use strict';

var React = require('react/addons');

var ContactChooser = React.createClass({
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
		return (
			<div className="contact-chooser">
				<h3>Search for contact</h3>
				<input type="text" id="choosecontact" /><button onClick={function () {
					return false;
				}.bind(this)}>Search</button>
				<button onClick={this.props.onCancelChooseContact}>Cancel</button>
			</div>
		);
	}
});

module.exports = ContactEditor;
