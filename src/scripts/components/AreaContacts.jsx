/**
 * @jsx React.DOM
 */

'use strict';

var React = require('react/addons');

var AreaContacts = React.createClass({
	render: function () {
		var collection_counter = 0;

		// notes text (present of the area has a note)
		var notes = this.props.area.note == null || this.props.area.note.trim() == ""
			? null
			: <p className="notes">{this.props.area.note}</p>
		;

		// headings to look for
		//console.log(this.props.showDescendents);
		var headings = this.props.showDescendents
			? ["name", "position", "phone", "email", "address", "location", "url", "note"]
			: ["name", "phone", "email", "note"]
		;

		// function renders a contact table from a collection,
		// possibly recursing for successor collections
		var render_contact_table = function (contacts, index, list, note) {
			var used_headings = [];

			// generate a list of <td> for the contact's properties
			var rows = contacts.contacts.sort(function (ca, cb) {
				if ((ca.contact_info.last_name || "") > (cb.contact_info.last_name || "")) return 1;
				if ((ca.contact_info.last_name || "") < (cb.contact_info.last_name || "")) return -1;
				else return 0;
			}).map(function (contact) {
				var cells = {};

				headings.forEach(function (heading) {
					if (heading == "url") {

						// urls are handled specially due to their description
						if ("url" in contact) {
							var note = contact.url.note ? " (" + contact.url.note + ")" : null;
							cells["url"] = <td key="url"><a href={contact.url.url}>{contact.url.url}{note}</a></td>;
							used_headings.push("url");
						}
					} else if (heading == "name" && (
						"first_name" in contact.contact_info || "last_name" in contact.contact_info
					)) {
						name = contact.contact_info.first_name + " " || "";
						name += contact.contact_info.last_name || "";
						cells["name"] = <td key="name">{name}</td>;
						used_headings.push("name");
					} else if (heading == "note" && !("first_name" in contact.contact_info || "last_name" in contact.contact_info)) {
						cells["name"] = <td key="name"><em>{contact.contact_info.note}</em></td>;
						used_headings.push("name");
					} else if (heading in contact.contact_info) {
						// add <td> for data in heading
						used_headings.push(heading);
						var class_name = heading == "phone" || heading == "email" ? "clickable" : "";
						cells[heading] = <td key={heading} className={class_name}>{contact.contact_info[heading]}</td>;
					} else if (!this.props.showDescendents) {
						used_headings.push(heading);
						cells[heading] = <td key={heading}>&mdash;</td>;
					}
				}.bind(this));

				// return the list of <td>, along with the contact's ID (for react key)
				return {contact_id : contact.contact_id, cells : cells};
			}.bind(this));

			// figure out which headings are actually in use and generate header row
			var reduced_headings = headings.reduce(function (acc, heading) {
				return used_headings.indexOf(heading) > -1 ? acc.concat([heading]) : acc;
			}, []);
			var head_row = <tr className="header">{reduced_headings.map(function (heading) {
				return <th key={heading}>{heading}</th>
			})}</tr>;

			// convert <td> for all contacts into a row, adding blank cells for missing
			// data that is present in other rows
			var data_rows = rows.map(function (row) {
				return <tr key={row.contact_id}>{reduced_headings.map(function (heading, index) {
					return row.cells[heading] || <td key={-index}>&nbsp;</td>;
				})}</tr>;
			});

			// create table
			var class_name = "contact_table" + (this.props.showDescendents ? " full" : " reduced");
			var note_cell = null;
			if (note) {
				note_cell = <div className="successor-note">{note}</div>;
				class_name += " successor";
			}
			if (contacts.successors.length || note) class_name += " linked";
			if (contacts.primary) class_name += " primary";
			var table = data_rows.length
				? [note_cell, <table className={class_name}><thead>{head_row}</thead><tbody>{data_rows}</tbody></table>]
				: null
			;

			// generate table for successor, if necessary
			var successors = contacts.successors.map(function (successor, index) {
				var successor_coll = render_contact_table(successor.collection, null, null, successor.note);
				return (
					<div key={index} className="succeeds">
						{successor_coll}
					</div>
				);
			});

			// return the table, with a unique ID (since it's in a list)
			return (
				<div key={collection_counter++}>
					{table}
					{successors}
				</div>
			);
		}.bind(this);

		// actually call the render function on the contacts (if they exist)
		var contacts = !this.props.contacts || this.props.contacts.length == 0
			? null
			: this.props.contacts.sort(function (a, b) {
					if (a.primary && !b.primary) return -1;
					else if (b.primary && !a.primary) return 1;
					else {
						if (a.collection_id < b.collection_id) return -1;
						else if (a.collection_id > b.collection_id) return 1;
						else return 0;
					};
				}).map(render_contact_table);
		;

		var title = this.props.area.name;
		if (this.props.onAreaSelect) {
			var selectArea = function () {
				this.props.onAreaSelect(this.props.area.area_id);
				return false;
			}.bind(this);
			title = <a href="#" onClick={selectArea}>{title}</a>;
		}
		if (this.props.path && this.props.path.length) {
			title = [title, " (" + this.props.path.map(function (area) {
				return area.name;
			}).join(" / ") + ")"];
		}

		

		// return the area's contacts/note if either exist, otherwise return `nothing'
		if (notes || contacts || this.props.needsDivision) {
		    return (
				<div className="collection">
					<h2>{title}</h2>
					{notes}
					{contacts}
				</div>
			);
		} else return <span></span>;
	}
});

module.exports = AreaContacts;
