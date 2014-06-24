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
			"first_name", "last_name", "position", "phone", "email", "address", "location", "url", "note"
		];
		var num_contacts = 0;
		var render_contact_table = function (contacts) {
			var used_headings = [];
			var rows = contacts.contacts.map(function (contact) {
				num_contacts++;
				var cells = {};
				headings.forEach(function (heading) {
					if (heading == "url") {
						if ("url" in contact) {
							var note = contact.url.note ? " (" + contact.url.note + ")" : null;
							cells["url"] = <td><a href={contact.url.url}>{contact.url.url}{note}</a></td>;
							used_headings.push("url");
						}
					} else if (heading in contact.contact_info) {
						used_headings.push(heading);
						cells[heading] = <td>{contact.contact_info[heading]}</td>;
					}
				});
				return cells;
			});
			var reduced_headings = headings.reduce(function (acc, heading) {
				return used_headings.indexOf(heading) > -1 ? acc.concat([heading]) : acc;
			}, []);
			var head_row = <tr>{reduced_headings.map(function (heading) {
				return <th>{heading}</th>
			})}</tr>;
			var data_rows = rows.map(function (row) {
				return <tr>{reduced_headings.map(function (heading) {
					return row[heading] || <td></td>;
				})}</tr>;
			})
			var table = num_contacts
				? <table className="contact_table">{head_row}{data_rows}</table>
				: null
			;
			var successors = contacts.successors.map(function (successor) {
				var successor_coll = render_contact_table(successor.collection);
				return (
					<div className="succeeds">
						<p>{successor.note}</p>
						{successor_coll}
					</div>
				);
			});

			if (this.props.counter) this.props.counter(num_contacts);

			return (
				<div>
					{table}
					{successors}
				</div>
			);
		}.bind(this);

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
