/**
 * @jsx React.DOM
 */

'use strict';

var React = require('react/addons');
require('../../styles/AreaContacts.css');

var url_base = "http://uom-13melb.herokuapp.com/area/";

var AreaContacts = React.createClass({
	getInitialState : function () {
		return {"contacts" : []};
	},
	componentWillReceiveProps : function (new_props) {
		$.ajax({
			url : url_base + new_props.area.area_id + "/all_contacts",
			dataType : "json",
			success : function (data) {
				if (this.isMounted()) {
					this.setState({"contacts" : data});
				}
			}.bind(this)
		});
	},
	componentWillMount : function () {
		this.componentWillReceiveProps(this.props);
	},
	render: function () {
		var notes = this.props.area.note == null
			? null
			: <p className="notes">{this.props.area.note}</p>
		;

		var headings = [
			"first_name", "last_name", "position", "phone", "email", "note"
		];
		var render_contact_table = function (contacts) {
			var rows = contacts.contacts.map(function (contact) {
				var cells = headings.map(function (heading) {
					if (heading in contact.contact_info) {
						return <td>{contact.contact_info[heading]}</td>;
					} else return <td></td>;
				});
				return <tr>{cells}</tr>;
			});
			var table = <table className="contact_table">{rows}</table>;
			var successors = contacts.successors.map(function (successor) {
				var successor_coll = render_contact_table(successor.collection);
				return (
					<div className="succeeds">
						<p>{successor.note}</p>
						{successor_coll}
					</div>
				);
			});

			return (
				<div>
					{table}
					{successors}
				</div>
			);
		};

		var contacts = this.state.contacts.length == 0
			? null
			: this.state.contacts.map(render_contact_table);
		;

		if (notes || contacts) {
		    return (
				<div className="collection">
					<h3>{this.props.area.name}</h3>
					{notes}
					{contacts}
				</div>
			);
		} else return <span></span>;
	}
});

module.exports = AreaContacts;
