/**
 * @jsx React.DOM
 */

'use strict';

var React = require('react/addons');
require('../../styles/ManagerCollectionList.css');

var ManagerCollectionList = React.createClass({
	get_checked : function (collection_id) {
		var checked = [];
		$("[name=coll" + collection_id + "]:checked").each(function () {
			checked.push($(this).val());
			$(this).removeAttr("checked");
		});
		return checked;
	},
	handleSplitCollection : function (collection_id) {
		var checked = this.get_checked(collection_id);
		this.props.onSplitCollection(collection_id, checked);
	},
	handleDeleteContacts : function (collection_id) {
		var checked = this.get_checked(collection_id);
		this.props.onDeleteContacts(collection_id, checked);
	},
	render: function () {
		var collection_recurse = function (collection) {
			var collection_id = collection.collection_id;
			if (this.props.collectionOperation && this.props.collectionOperationTarget == collection_id) {
				return null;
			}
			var contacts = collection.contacts.map(function (contact) {
				var info = contact.contact_info;
				var contact_label = info.first_name || info.last_name
					? info.first_name  + " " + info.last_name
					: ["note", "phone", "email", "address"].reduce(function (acc, label) {
						if (info[label] && !acc) return info[label];
						else return acc;
					}, "");
				return (
					<li ref={contact.contact_id}>
						<input type="checkbox"
							name={"coll" + collection_id}
							value={contact.contact_id}
						/>
						{contact_label}
						<button onClick={function () {
							this.props.onEditContact(contact.contact_id)
						}.bind(this)}>Edit</button>
					</li>
				);
			}.bind(this));
			var select_collection = this.props.collectionOperation == ""
				? null
				: <button onClick={function () {
					this.props.onSelectCollection(collection_id)
				}.bind(this)}>Select</button>;

			contacts = <div ref={collection_id}>{[
				<div ref={collection_id} className="collection_manager">
					{select_collection}
					<ul>{contacts}</ul>
					<button onClick={function () {
						this.handleSplitCollection(collection_id)
					}.bind(this)}>Split (selected)</button>
					<button onClick={function () {
						this.handleDeleteContacts(collection_id);
					}.bind(this)}>Delete (selected)</button>
					<button onClick={function () {
						this.props.onMergeCollection(collection_id)
					}.bind(this)}>Join</button>
					<button onClick={function () {
						this.props.onLinkCollection(collection_id)
					}.bind(this)}>Link (to predecessor)</button>
					<button onClick={function () {
						this.props.onCreateContact(collection_id);
					}.bind(this)}>New contact</button>
				</div>
			].concat(collection.successors.map(function (successor) {
				return (
					<div ref={successor.collection.collection_id} className="collection_successors">
						<p className="successor">
							{successor.note}
							<button onClick={function () {
								this.props.onUnlinkCollection(collection_id, successor.collection.collection_id);
							}.bind(this)}>Remove link</button>
						</p>
						{collection_recurse(successor.collection)}
					</div>
				);
			}.bind(this)))}</div>;

			return contacts;
		}.bind(this);

		var collection_html = this.props.contacts.length
			? this.props.contacts.map(collection_recurse)
			: <button onClick={function () {
				this.props.onCreateContact(null);
			}.bind(this)}>New contact</button>
		;

		var cancel = this.props.collectionOperation == ""
			? null
			: <button onClick={this.props.onCancelCollectionOperation}>Cancel {this.props.collectionOperation} operation</button>
		;

		return (
			<div className="manager_lists">
				<h3>Contacts</h3>
				<p>{collection_html}</p>
				{cancel}
			</div>
		);
	}
});

module.exports = ManagerCollectionList;
