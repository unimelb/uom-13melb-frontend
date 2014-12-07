/**
 * @jsx React.DOM
 */

'use strict';

var React = require('react/addons');

var searchTimeout = null;
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
		searchTimeout = setTimeout(function () {
			var search = this.state.form_values.contact_search;
			if (search.length >= 3) this.props.onSearchForContact(search);
		}.bind(this), 200);
	},
	render: function () {
		var contacts = this.props.foundContacts.map(function (contact, index) {
			return (
				<p>{(contact.first_name + " " + contact.last_name) || contact.note}</p>
			);
		})
		return (
			<div className="contact-chooser">
				<form>
					<fieldset>
						<div className="inline">
							<input type="search" name="contact_search" ref="contact_search" value={this.state.form_values.contact_search || ''} onChange={this.handleFormEntry} />
							<button type="submit" value="Go" className="search-button">
								<svg className="icon" role="img" dangerouslySetInnerHTML={{__html: '<use xlink:href="#icon-search"></use>'}}></svg>
							</button>
						</div>
					</fieldset>
				</form>
				<div ref="contact-list" className="contact-list">
					{contacts}
				</div>
			</div>
		);
	}
});

module.exports = ContactChooser;
