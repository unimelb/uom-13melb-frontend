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
		var present = this.props.contacts.map(function (contact) {
			return contact.contact_id;
		});
		var contacts = this.props.foundContacts.map(function (contact, index) {
			if (present.indexOf(contact.contact_id) == -1) {
				return (
					<li><a onClick={function () {
						this.props.onLinkExistingContact(contact.contact_id);
					}.bind(this)}>{(contact.first_name + " " + contact.last_name) || contact.note}</a></li>
				);
			} else {
				return null;
			}
		}.bind(this));
		return (
			<div className="contact-chooser">
				<h1 id="existing-search-anchor">Search for existing contact</h1>
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
				<ul ref="contact-list" className="contact-list">
					{contacts}
				</ul>
				<p>
					<button className="button-small warning" onClick={this.props.onCancelLinkExistingContact}>Cancel</button>
				</p>
			</div>
		);
	}
});

module.exports = ContactChooser;
