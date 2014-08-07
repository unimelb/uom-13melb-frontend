/**
 * @jsx React.DOM
 */

'use strict';

var React = require('react/addons');
require('../../styles/Manager.css');
var config = require("../config.js");
var common = require("../common.jsx");

var ManagerChildrenList = require("./ManagerChildrenList.jsx");
var ManagerCollectionList = require("./ManagerCollectionList.jsx");
var ContactEditor = require("./ContactEditor.jsx");

var domain = config.base_url.replace(/\/area\//g, "/");
var collection_url = domain + "collection/";
var area_url = domain + "area/";
var contact_url = domain + "contact/";

var Manager = React.createClass({
	getInitialState : function () {
		return {
			path : [{"root" : "root"}],
			children : [],
			contacts : [],
			form_values : {},
			loading : false,
			moving : [],
			collectionOperation : false,
			collectionOperationTarget : 0,
			editingContact : null,
			newContactCollection : 0
		};
	},
	getCurrentArea : function () {
		return common.path2area(this.state.path)
	},
	componentDidMount : function () {
		this.handleAreaSelect(this.props.area);
	},
	componentWillReceiveProps : function (new_props) {
		this.handleAreaSelect(new_props.area);
	},
	refresh_children : function () {
		$.ajax({
			url : config.base_url + common.path2area(this.state.path) + "/children",
			type : "GET",
			success : function (children) {
				this.setState({
					children : children,
					loading : false
				});
			}.bind(this)
		});
	},
	refresh_contacts : function () {
		$.ajax({
			url : config.base_url + common.path2area(this.state.path) + "/all_contacts",
			type : "GET",
			success : function (contacts) {
				this.setState({
					contacts : contacts,
					loading : false
				});
			}.bind(this)
		});
	},
	handleAreaSelect : function (area_id, change_url) {
		if (change_url) this.props.router.navigate("manage/" + area_id);
		this.setState({loading : true});
		var url = config.base_url + area_id;
		common.multi_ajax([
			url + "/path",
			url + "/children",
			url + "/all_contacts"
		], function (results) {
			var area = results[0][results[0].length - 1];
			this.setState({
				path : results[0],
				children : results[1],
				contacts : results[2],
				editingContact : null,
				form_values : {
					name : area.name,
					note : area.note
				},
				loading : false
			});
		}.bind(this));
		return false;
	},
	handleAreaUpdate : function () {
		this.setState({loading : true});
		$.ajax({
			url : config.base_url + common.path2area(this.state.path),
			type : "PUT",
			data : this.state.form_values,
			success : function () {
				var new_path = this.state.path;
				new_path[new_path.length - 1].name = this.state.form_values.name;
				this.setState({
					path : new_path,
					loading : false
				});
			}.bind(this)
		});
		return false;
	},
	handlePlaceArea : function (area_to_move) {
		this.setState({loading : true});
		$.ajax({
			url : config.base_url + area_to_move + "/parent",
			type : "PUT",
			data : {
				"area_id" : this.getCurrentArea()
			},
			success : function () {
				var new_moving = this.state.moving.filter(function (area) {
					return area.area_id != area_to_move
				});
				this.setState({moving : new_moving});
				this.refresh_children();
			}.bind(this)
		});
	},
	handleMoveChild : function (child) {
		var new_moving = this.state.moving;
		new_moving.push(child);
		this.setState({moving : new_moving});
	},
	handleRemoveChild : function (child_id) {
		$.ajax({
			url : config.base_url + child_id,
			type : "DELETE",
			success : function () {
				this.refresh_children();
			}.bind(this)
		})
	},
	handleNewChild : function () {
		var area_id = this.getCurrentArea();
		this.setState({loading : true});
		$.ajax({
			url : config.base_url + area_id,
			type : "POST",
			data : {name : "New area"},
			success : function (new_area) {
				this.handleAreaSelect(new_area.area_id, true);
			}.bind(this)
		});
	},
	handleFormEntry : function (e) {
		var new_form_values = this.state.form_values;
		new_form_values[e.target.name] = e.target.value;
		this.setState({form_values : new_form_values});
	},
	handleSplitCollection : function (collection_id, contact_ids) {
		$.ajax({
			url : collection_url + collection_id + "/contacts",
			type : "DELETE",
			data : {
				contacts : contact_ids
			},
			success : function (new_collection) {
				this.refresh_contacts();
			}.bind(this)
		});
	},
	handleDeleteContacts : function (collection_id, contact_ids) {
		var remaining = contact_ids.length;
		this.setState({loading : true});
		contact_ids.forEach(function (contact_id) {
			$.ajax({
				url : contact_url + contact_id,
				type : "DELETE",
				data : {
					collection_id : collection_id
				},
				success : function (contact) {
					if (!--remaining) {
						this.setState({loading : false});
						this.refresh_contacts();
					}
				}.bind(this)
			})
		}.bind(this));
	},
	handleMergeCollection : function (disappearing_collection_id) {
		this.setState({
			collectionOperation : "merge",
			collectionOperationTarget : disappearing_collection_id
		});
	},
	handleSelectCollection : function (collection_id) {
		var target_id = this.state.collectionOperationTarget;
		switch (this.state.collectionOperation) {
			case "merge":
				$.ajax({
					url : collection_url + target_id,
					type : "DELETE",
					data : {
						collection_id : collection_id
					},
					success : function (remaining_collection) {
						this.refresh_contacts();
					}.bind(this)
				});
				break;
			case "link":
				var note = window.prompt("Enter note for link");
				$.ajax({
					url : collection_url + collection_id + "/successors",
					type : "POST",
					data : {
						collection_id : target_id,
						note : note
					},
					success : function () {
						this.refresh_contacts();
					}.bind(this)
				})
				break;
		}
		this.setState({
			collectionOperation : false
		});
	},
	handleLinkCollection : function (successor_collection_id) {
		this.setState({
			collectionOperation : "link",
			collectionOperationTarget : successor_collection_id
		});
	},
	handleUnlinkCollection : function (pred_id, succ_id) { 
		$.ajax({
			url : collection_url + pred_id + "/successors",
			type : "DELETE",
			data : {
				collection_id : succ_id
			},
			success : function () {
				this.refresh_contacts();
			}.bind(this)
		})
	},
	handleCancelCollectionOperation : function () {
		this.setState({
			collectionOperation : false
		});
	},
	handleCreateContact : function (collection_id) {
		this.setState({
			editingContact : 0,
			newContactCollection : collection_id
		});
	},
	handleEditContact : function (contact_id) {
		this.setState({
			editingContact : contact_id
		});
	},
	handleSubmitContact : function (contact_info) {
		console.log("submit contact");
		if (this.state.editingContact === 0) {
			console.log("create");
			var collection;
			var do_new_contact = function (collection_id) {
				$.ajax({
					url : collection_url + collection_id + "/contacts",
					type : "POST",
					data : contact_info,
					success : function () {
						this.setState({
							editingContact : null
						});
						this.refresh_contacts();
					}.bind(this)
				})
			}.bind(this);
			this.setState({
				loading : true
			});
			if (!this.state.newContactCollection) {
				$.ajax({
					url : area_url + common.path2area(this.state.path) + "/collections",
					type : "POST",
					success : function (data) {
						do_new_contact(data.collection_id);
					}.bind(this)
				});
			} else {
				do_new_contact(this.state.newContactCollection);
			}
		} else {
			$.ajax({
				url : contact_url + this.state.editingContact,
				type : "PUT",
				data : contact_info,
				success : function (data) {
					this.setState({
						editingContact : null
					});
					this.refresh_contacts();
				}.bind(this)
			});
		}
	},
	handleCancelEditContact : function () {
		this.setState({
			editingContact : null
		});
	},
	handleDidBulkImport : function (response) {
		console.log(response);
		if (response.error) alert(response.error);
		else {
			this.refresh_children();
		}
	},
	render: function () {
		
		var path = this.state.path.map(function (segment, index) {
			if (index == this.state.path.length - 1) return segment.name;
			else return (
				<span>
					<a key={segment.area_id} href={"#manage/" + segment.area_id}>
						{segment.name}
					</a>
					{" › "}
				</span>
			);
		}.bind(this));

		var form = (
			<form>
				<label htmlFor="area_name">Name:</label>
				<input type="text" name="name" ref="name" value={this.state.form_values.name} onChange={this.handleFormEntry} />
				<label htmlFor="area_note">Note:</label>
				<input type="text" name="note" ref="note" value={this.state.form_values.note} onChange={this.handleFormEntry} />
				<button onClick={this.handleAreaUpdate}>Update</button>
			</form>
		);

		var moving_shelve = this.state.moving.map(function (area) {
			return (
				<li>
					<a onClick={function () { this.handlePlaceArea(area.area_id); }.bind(this)}>
						{area.name}
					</a>
				</li>
			);
		}.bind(this));

		var loading = common.loading(this.state.loading);

		return (
			<div className="page-inner">
				<div role="main" className="main">
					<section className="manager">
						<h1>Manager</h1>
						<h2>{path}</h2>
						{loading}
						<ul className="shelve">{moving_shelve}</ul>
						<hr className="clear" />
						{form}
						{
							this.state.editingContact !== null
								? <ContactEditor
									contacts={this.state.contacts}
									contact_id={this.state.editingContact}
									onSubmitContact={this.handleSubmitContact}
									onCancelEditContact={this.handleCancelEditContact} />
								:
									<div>
										<ManagerChildrenList
											area_id={common.path2area(this.state.path)}
											moving={this.state.moving}
											children={this.state.children}
											onAreaSelect={this.handleAreaSelect}
											onRemoveChild={this.handleRemoveChild}
											onMoveChild={this.handleMoveChild}
											onDidBulkImport={this.handleDidBulkImport}
											domain={domain}
											onNewChild={this.handleNewChild} />
										<ManagerCollectionList
											contacts={this.state.contacts}
											collectionOperation={this.state.collectionOperation}
											collectionOperationTarget={this.state.collectionOperationTarget}
											onCancelCollectionOperation={this.handleCancelCollectionOperation}
											onSplitCollection={this.handleSplitCollection}
											onMergeCollection={this.handleMergeCollection}
											onSelectCollection={this.handleSelectCollection}
											onLinkCollection={this.handleLinkCollection}
											onUnlinkCollection={this.handleUnlinkCollection}
											onCreateContact={this.handleCreateContact}
											onEditContact={this.handleEditContact}
											onDeleteContacts={this.handleDeleteContacts}
										/>
									</div>
						}
						<hr className="clear" />
					</section>
				</div>
			</div>
		);
	}
});

module.exports = Manager;
