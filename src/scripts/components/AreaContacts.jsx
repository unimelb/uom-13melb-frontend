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

var url_base = "http://uom-13melb.herokuapp.com/area/";

var AreaContacts = React.createClass({
	/*getInitialState : function () {
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
	},*/
	componentDidMount : function () {
		setTimeout(function () {
			var ref = "contacts-" + this.props.area.area_id;
			console.log("ref: " + ref);
			var cells = document.getElementsByClassName("clickable");
			var client = new ZeroClipboard(cells);
			client.on("ready", function (event) {
				client.on("copy", function (event) {
					var clipboard = event.clipboardData;
					clipboard.setData("text/plain", event.target.innerHTML);
				});
				client.on("aftercopy", function (event) {
					var target = event.target;
					target.style.backgroundColor = "#CFC";
					setTimeout(function () {
						target.style.backgroundColor = "transparent";
					}, 200);
				});
			});
		}.bind(this), 500);
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
						var class_name = heading == "phone" || heading == "email" ? "clickable" : "";
						cells[heading] = <td className={class_name}>{contact.contact_info[heading]}</td>;
					}
				}.bind(this));
				return cells;
			}.bind(this));
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
			var ref = "contacts-" + this.props.area.area_id;
			console.log(ref);
			var table = num_contacts
				? <table ref={ref} className="contact_table">{head_row}{data_rows}</table>
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

		//console.log(this.props.area.area_id);
		//console.log(this.props.contacts);
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
