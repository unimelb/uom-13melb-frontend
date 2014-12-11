/**
 * @jsx React.DOM
 */

'use strict';

var React = require('react/addons');
var config = require("../config.js");
var common = require("../common.jsx");

var ManagerChildrenList = require("./ManagerChildrenList.jsx");
var ManagerOrphanAreaList = require("./ManagerOrphanAreaList.jsx");
var ManagerCollectionList = require("./ManagerCollectionList.jsx");
var ContactEditor = require("./ContactEditor.jsx");
var ContactChooser = require("./ContactChooser.jsx");
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
			newContactCollection : 0,
			orphan_areas : null,
			searchingForContacts : false,
			foundContacts : [],
			position: ''
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
	componentDidUpdate: function () {
		if (this.state.position != '') {
			var position = this.state.position;
			this.setState({position: ''});
			$('html, body').animate({
	    	scrollTop: $(position).offset().top - 40
	    }, 100);
	  }
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
				loading : false,
				position: "#manager-children"
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
	handleDeleteContact : function (collection_id, contact_id) {
		$.ajax({
			url : contact_url + contact_id,
			type : "DELETE",
			data : {
				collection_id : collection_id
			},
			success : function (contact) {
				this.setState({loading : false});
				this.refresh_contacts();
			}.bind(this)
		})
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
	handleLinkExistingContact : function (contact_id) {
		var link_contact = function (collection_id) {
			$.ajax({
				url: collection_url + collection_id + "/contacts",
				type: "POST",
				data : {
					contact_id: contact_id
				},
				success: function () {
					this.setState({
						searchingForContacts: false,
						position: "#manager-collections"
					});
					this.refresh_contacts();
				}.bind(this)
			})
		}.bind(this);
		if (this.state.searchingForContacts === null) {
			$.ajax({
				url : area_url + common.path2area(this.state.path) + "/collections",
				type : "POST",
				success : function (data) {
					link_contact(data.collection_id);
				}.bind(this)
			});
		} else {
			link_contact(this.state.searchingForContacts);
		}
	},
	handleSearchForContact : function (text) {
		$.ajax({
			url: contact_url + "?q=" + text,
			success: function (results) {
				this.setState({
					foundContacts: results
				});
			}.bind(this)
		});
	},
	handleCancelLinkExistingContact: function () {
		this.setState({
			searchingForContacts: false,
			position: "#manager-collections"
		});
	},
	handleBeginSearchingForContact : function (collection_id) {
		this.setState({
			searchingForContacts: collection_id,
			position: "#existing-search-anchor"
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
			editingContact : null,
			position: "#manager-collections"
		});
	},
	handleDidBulkImport : function (response) {
		console.log(response);
		if (response.error) alert(response.error);
		else {
			this.refresh_children();
		}
	},
	handleViewOrphans : function () {
		$.ajax({
			url : domain + "orphan/area",
			type : "GET",
			success : function (data) {
				this.setState({orphan_areas : data});
			}.bind(this)
		})
	},
	handleHideOrphans : function () {
		this.setState({orphan_areas : null});
	},
	render: function () {
		
		var path = this.state.path.map(function (segment, index) {
			if (index == this.state.path.length - 1) return <span key={index}>{segment.name}</span>;
			else return (
				<span key={index}>
					<a key={segment.area_id} data-no-scroll href={"#manage/" + segment.area_id}>
						{segment.name}
					</a>
					{" › "}
				</span>
			);
		}.bind(this));

		var form = (
			<form>
				<fieldset>
					<div>
						<label htmlFor="area_name">Name:</label>
						<input type="text" name="name" ref="name" value={this.state.form_values.name} onChange={this.handleFormEntry} />
					</div>
					<div>
						<label htmlFor="area_note">Note:</label>
						<input type="text" name="note" ref="note" value={this.state.form_values.note} onChange={this.handleFormEntry} />
					</div>
				</fieldset>
				<footer>
					<input type="submit" onClick={this.handleAreaUpdate} value="Update" />
				</footer>
			</form>
		);

		var moving_shelve = this.state.moving.map(function (area, i) {
			return (
				<li key={i}>
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
					<header>
						<h1>Manage Contacts</h1>
					</header>
					<div className="manager">
						<section>
							<h1 className={path}>{path}</h1>
							{loading}
							{form}
							{this.state.searchingForContacts !== false
								? <ContactChooser
									onSearchForContact={this.handleSearchForContact}
									onLinkExistingContact={this.handleLinkExistingContact}
									onCancelLinkExistingContact={this.handleCancelLinkExistingContact}
									contacts={
										this.state.searchingForContacts
											? this.state.contacts.filter(function (coll) {
													return coll.collection_id == this.state.searchingForContacts
											}.bind(this))[0].contacts
											: []
									}
									foundContacts={this.state.foundContacts} />
								: this.state.editingContact !== null
									? <ContactEditor
										contacts={this.state.contacts}
										contact_id={this.state.editingContact}
										onSubmitContact={this.handleSubmitContact}
										onCancelEditContact={this.handleCancelEditContact} />
									:
										<div>
											{this.state.orphan_areas
												? <ManagerOrphanAreaList
													orphans={this.state.orphan_areas}
													onMoveChild={this.handleMoveChild}
													onHideOrphans={this.handleHideOrphans} />
												: <ManagerChildrenList
													area_id={common.path2area(this.state.path)}
													moving={this.state.moving}
													children={this.state.children}
													onAreaSelect={this.handleAreaSelect}
													onRemoveChild={this.handleRemoveChild}
													onMoveChild={this.handleMoveChild}
													onDidBulkImport={this.handleDidBulkImport}
													domain={domain}
													onNewChild={this.handleNewChild}
													onShowOrphans={this.handleViewOrphans} />
											}
											{this.state.moving.length ? <div>
												<h2>Categories being moved: select to place</h2>
												<ul className="shelve">{moving_shelve}</ul>
											</div> : null}
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
												onLinkContact={this.handleBeginSearchingForContact}
												onEditContact={this.handleEditContact}
												onDeleteContacts={this.handleDeleteContacts}
												onDeleteContact={this.handleDeleteContact}
											/>
										</div>
							}
						</section>
						<p className="center">
							<a data-no-scroll href="#" className="button-small soft" onClick={function (e) {
								this.props.router.navigate("area/" + common.path2area(this.state.path), {trigger: true});
								e.stopPropagation();
								return false;
							}.bind(this)}>
								Return to browsing
							</a>
						</p>
					</div>
				</div>
			</div>
		);
	}
});

module.exports = Manager;
