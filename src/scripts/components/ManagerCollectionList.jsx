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
		console.log("render called");
		var collection_recurse = function (collection, i) {
			var collection_id = collection.collection_id;
			var faded = false;
			if (this.props.collectionOperation && this.props.collectionOperationTarget == collection_id) {
				//return <div key={i}></div>;
				faded = true;
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
					<li ref={contact.contact_id} key={contact.contact_id}>
						<input type="checkbox"
							name={"coll" + collection_id}
							value={contact.contact_id}
							id={"contact" + contact.contact_id}
						/>
						<label htmlFor={"contact" + contact.contact_id}><span>{contact_label}</span></label>
						<span className="controls">
							<a onClick={function () {
								this.props.onEditContact(contact.contact_id)
							}.bind(this)}><svg className="icon" dangerouslySetInnerHTML={{__html: '<use xlink:href="#pen" />'}}></svg> Edit</a>
							<a onClick={function () {
								if (confirm("Are you sure you want to delete this contact?")) {
									this.props.onDeleteContact(collection_id, contact.contact_id);
								}
							}.bind(this)}><svg className="icon" dangerouslySetInnerHTML={{__html: '<use xlink:href="#trash" />'}}></svg> Delete</a>
						</span>
					</li>
				);
			}.bind(this));
			//console.log(this.props.collectionOperation + ", " + collection_id);
			var select_collection = (this.props.collectionOperation == "")
				? null
				: <a className="button-small cta" onClick={function () {
					this.props.onSelectCollection(collection_id)
				}.bind(this)}>Select</a>;

			var cancel = this.props.collectionOperation == ""
				? null
				: <a className="button-small warning" onClick={this.props.onCancelCollectionOperation}>Cancel {this.props.collectionOperation} operation</a>
			;

			contacts = <div key={collection_id * 3} className={faded ? "" : ""}>{[
				<div key={collection_id * 3 + 2} className="collection_manager">
					<h2>Contact group</h2>
					{
						select_collection
							? (faded ? cancel : select_collection)
							: <span>
								<a className="button-small" onClick={function () {
									this.props.onCreateContact(collection_id);
								}.bind(this)}>New contact</a>&nbsp;
								<a className="button-small" onClick={function () {
									this.props.onLinkContact(collection_id)
								}.bind(this)}>Add existing contact</a>&nbsp;
								<a onClick={function () {
									this.props.onMergeCollection(collection_id)
								}.bind(this)} className="button-small soft">Merge</a>&nbsp;
								<a onClick={function () {
									this.props.onLinkCollection(collection_id)
								}.bind(this)} className="button-small soft">Link</a>&nbsp;
								<a onClick={function () {
									this.handleSplitCollection(collection_id)
								}.bind(this)} className="button-small soft">Split selected</a>
							</span>
					}
					<form>
						<fieldset>
							<ul className="checklist">{contacts}</ul>
						</fieldset>
					</form>
				</div>
			].concat(collection.successors.map(function (successor) {
				return (
					<div key={successor.collection.collection_id * 3 + 1} className="collection_successors">
						<div className="successor">
							{successor.note}
							<button onClick={function () {
								this.props.onUnlinkCollection(collection_id, successor.collection.collection_id);
							}.bind(this)}>Remove link</button>
						</div>
						{collection_recurse(successor.collection)}
					</div>
				);
			}.bind(this)))}</div>;
			return contacts;
		}.bind(this);

		var collection_html = this.props.contacts.length
			? this.props.contacts.map(collection_recurse)
			: <p><a className="button-small" onClick={function () {
				this.props.onCreateContact(null);
			}.bind(this)}>New contact</a> <a className="button-small" onClick={function () {
				this.props.onLinkContact(null)
			}.bind(this)}>Link existing</a></p>
		;

		return (
			<div className="manager_lists">
				<h1>Contacts</h1>
				<div>{collection_html}</div>
			</div>
		);
	}
});

module.exports = ManagerCollectionList;
