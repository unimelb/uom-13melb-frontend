/**
 * @jsx React.DOM
 */

'use strict';

var React = require('react/addons');
require('../../styles/AreaContacts.css');
var ZeroClipboard = require("zeroclipboard");

ZeroClipboard.config({
	swfPath: "//cdnjs.cloudflare.com/ajax/libs/zeroclipboard/2.1.1/ZeroClipboard.swf"
});

var zc_timeout;

var AreaContacts = React.createClass({
	componentDidMount : function () {
		clearTimeout(zc_timeout);
		zc_timeout = setTimeout(function () {
			var cells = document.getElementsByClassName("clickable");
			var client = new ZeroClipboard(cells);
			client.on("ready", function (event) {
				client.on("copy", function (event) {
					var clipboard = event.clipboardData;
					var to_copy = event.target.innerHTML;
					var last_word = to_copy.split(" ").slice(-1)[0];
					if (last_word.match(/^[0-9]{5}$/)) to_copy = last_word;
					clipboard.setData("text/plain", last_word);
				});
				client.on("aftercopy", function (event) {
					var target = event.target;
					target.style.backgroundColor = "#CFC";
					setTimeout(function () {
						target.style.backgroundColor = "transparent";
					}, 200);
				});
			});
		}.bind(this), 200);
	},
	render: function () {
		var collection_counter = 0;

		// notes text (present of the area has a note)
		var notes = this.props.area.note == null
			? null
			: <p className="notes">{this.props.area.note}</p>
		;

		// headings to look for
		var headings = [
			"first_name", "last_name", "position", "phone", "email", "address", "location", "url", "note"
		];

		// function renders a contact table from a collection,
		// possibly recursing for successor collections
		var render_contact_table = function (contacts, index, list, note) {
			var used_headings = [];

			// generate a list of <td> for the contact's properties
			var rows = contacts.contacts.map(function (contact) {
				var cells = {};

				headings.forEach(function (heading) {
					if (heading == "url") {

						// urls are handled specially due to their description
						if ("url" in contact) {
							var note = contact.url.note ? " (" + contact.url.note + ")" : null;
							cells["url"] = <td key="url"><a href={contact.url.url}>{contact.url.url}{note}</a></td>;
							used_headings.push("url");
						}
					} else if (heading in contact.contact_info) {

						// add <td> for data in heading
						used_headings.push(heading);
						var class_name = heading == "phone" || heading == "email" ? "clickable" : "";
						cells[heading] = <td key={heading} className={class_name}>{contact.contact_info[heading]}</td>;
					}
				}.bind(this));

				// return the list of <td>, along with the contact's ID (for react key)
				return {contact_id : contact.contact_id, cells : cells};
			}.bind(this));

			// figure out which headings are actually in use and generate header row
			var reduced_headings = headings.reduce(function (acc, heading) {
				return used_headings.indexOf(heading) > -1 ? acc.concat([heading]) : acc;
			}, []);
			var head_row = <tr>{reduced_headings.map(function (heading) {
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
			var class_name = "contact_table";
			var note_cell = null;
			if (note) {
				note_cell = <tr className="successor_note"><td colSpan={reduced_headings.length}>{note}</td></tr>;
				class_name += " successor";
			}
			var table = data_rows.length
				? <table className={class_name}>{note_cell}{head_row}{data_rows}</table>
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
			: this.props.contacts.map(render_contact_table);
		;

		var title;
		if (this.props.onAreaSelect) {
			var selectArea = function () {
				this.props.onAreaSelect(this.props.area.area_id);
				return false;
			}.bind(this);
			title = <a href="#" onClick={selectArea}>{this.props.area.name}</a>;
		} else title = this.props.area.name;

		// return the area's contacts/note if either exist, otherwise return `nothing'
		if (notes || contacts) {
		    return (
				<div className="collection">
					<h3>{title}</h3>
					{notes}
					{contacts}
				</div>
			);
		} else return <span></span>;
	}
});

module.exports = AreaContacts;
