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

var AreaContacts = React.createClass({
	componentDidMount : function () {
		setTimeout(function () {
			var ref = "contacts-" + this.props.area.area_id;
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
		}.bind(this), 100);
	},
	render: function () {
		var notes = this.props.area.note == null
			? null
			: <p className="notes">{this.props.area.note}</p>
		;

		var headings = [
			"first_name", "last_name", "position", "phone", "email", "address", "location", "url", "note"
		];
		var collection_counter = 0;
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
							cells["url"] = <td key="url"><a href={contact.url.url}>{contact.url.url}{note}</a></td>;
							used_headings.push("url");
						}
					} else if (heading in contact.contact_info) {
						used_headings.push(heading);
						var class_name = heading == "phone" || heading == "email" ? "clickable" : "";
						cells[heading] = <td key={heading} className={class_name}>{contact.contact_info[heading]}</td>;
					}
				}.bind(this));
				return {contact_id : contact.contact_id, cells : cells};
			}.bind(this));
			var reduced_headings = headings.reduce(function (acc, heading) {
				return used_headings.indexOf(heading) > -1 ? acc.concat([heading]) : acc;
			}, []);
			var head_row = <tr>{reduced_headings.map(function (heading) {
				return <th key={heading}>{heading}</th>
			})}</tr>;
			var data_rows = rows.map(function (row) {
				return <tr key={row.contact_id}>{reduced_headings.map(function (heading, index) {
					return row.cells[heading] || <td key={-index}>&nbsp;</td>;
				})}</tr>;
			})
			var ref = "contacts-" + this.props.area.area_id;
			var table = num_contacts
				? <table ref={ref} className="contact_table">{head_row}{data_rows}</table>
				: null
			;
			var successors = contacts.successors.map(function (successor, index) {
				var successor_coll = render_contact_table(successor.collection);
				return (
					<div key={index} className="succeeds">
						<p>{successor.note}</p>
						{successor_coll}
					</div>
				);
			});

			if (this.props.counter) this.props.counter(num_contacts);

			return (
				<div key={collection_counter++}>
					{table}
					{successors}
				</div>
			);
		}.bind(this);

		var contacts = !this.props.contacts
			? null
			: this.props.contacts.length == 0
				? null
				: this.props.contacts.map(render_contact_table);
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
