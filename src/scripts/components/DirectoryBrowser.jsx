/**
 * @jsx React.DOM
 */

'use strict';

var config = require("../config.js");
var common = require("../common.jsx");
var React = require('react/addons');

var SearchBox = require("./SearchBox.jsx");
var CurrentArea = require("./CurrentArea.jsx");
var AreaList = require("./AreaList.jsx");
var Contacts = require("./Contacts.jsx");

var limit = 40;

var url_base = config.base_url;
var search_url = function (area) {
	return url_base + area + "/search";
}

// CSS
// require('../../styles/reset.css');
//require('../../styles/uom.min.css');
require('../../styles/main.css');

var initialState = {
	search_results : [],
	selected_area : 0,
	current_path : [],
	history : ["root"],
	isLoading : false,
	tokens : [],
	contacts : {"root" : []},
	search_contacts : {},
	area_info : {
		descendents : {children : []},
		descendent_contact_count : 0
	},
	load_percentage : 0
};

var DirectoryBrowser = React.createClass({
	lastSearchString : "",
	lastAreaSelected : "",
	getInitialState : function () {
		return initialState;
	},
	componentDidMount : function () {
		document.addEventListener("keydown", this.handleKeyPress);
		this.handleAreaSelect(this.props.area, true);
	},
	componentWillReceiveProps : function (new_props) {
		this.handleAreaSelect(new_props.area);
	},
	handleReset : function () {
		this.replaceState(initialState);
		this.handleAreaSelect("root", true);
	},

	/**
	 * Main process 1: retrieving search results.
	 */
	handleSearch : function (search_text) {
		if (search_text == this.lastSearchString) return;
		this.lastSearchString = search_text;

		if (search_text.length == 0) {

			// clear result list
			this.setState({
				search_results : [],
				isLoading : false
			});

		} else {

			// do search
			this.setState({isLoading : true});
			var current_area_id = common.path2area(this.state.current_path);

			// fetch search results
			common.multi_ajax([{
				url: search_url(current_area_id),
				dataType: "json",
				type: "GET",
				data: {q : search_text},
			}], function (data) {
					data = data[0];

				// fetch contacts for all areas in results
				if (this.lastSearchString == search_text) {
					this.setState({
						search_results : data,
						search_contacts : {},
						isLoading : false,
						selected_area : -1
					});
					var contacts_to_fetch = [];
					var batches = [];
					data.forEach(function (path, index) {
						path.forEach(function (area) {
							contacts_to_fetch.push(area.area_id);
						}.bind(this));
						if (index % 3 == 2 || index == data.length - 1) {
							batches.push(contacts_to_fetch);
							contacts_to_fetch = [];	
						}
					}.bind(this));

					var fetch_batch = function (batch_number) {
						common.fetch_contact_info(batches[batch_number],
							function (info) {
								if (this.lastSearchString != search_text) return false;
								else {
									var existing_contacts = info;//this.state.search_contacts;
									//console.log(this.state.search_contacts);
									Object.keys(this.state.search_contacts).forEach(function (key) {
										existing_contacts[key] = this.state.search_contacts[key];
									}.bind(this));
									this.setState({
										search_contacts : existing_contacts,
										load_percentage : (batch_number + 1) / batches.length
									});
									if (++batch_number < batches.length) {
										fetch_batch(batch_number);
									} else {
										this.setState({
											load_percentage : 0
										});
									}
									return true;
								}
							}.bind(this)
						);
					}.bind(this);
					if (batches.length) fetch_batch(0);
				}
			}.bind(this));
		}
	},

	/**
	 * Main process 2: fetching the information for an area
	 */
	handleAreaSelect: function (area_id, token_removed) {
		if (area_id == "root") token_removed = true;
		this.lastAreaSelected = area_id;
		var new_state = {
			search_results : [],
			history : this.state.history.concat([area_id])
		};
		if (!token_removed) {
			new_state.tokens = this.state.tokens.concat([{
				search_string : this.lastSearchString,
				prev_area : common.path2area(this.state.current_path)
			}]);
		}

		this.setState({isLoading : true});
		
		// fetch information on area
		common.multi_ajax([
			url_base + area_id + "/path",
			url_base + area_id + "/descendents?depth=1",
			url_base + area_id + "/descendent_contact_count"
		], function (results) {

			if (area_id == this.lastAreaSelected) {

				new_state.current_path = results[0];
				new_state.area_info = {
					descendents : results[1],
					descendent_contact_count : results[2].contacts
				};
				if (!token_removed) {
					var last_token = new_state.tokens[new_state.tokens.length - 1];
					if (last_token.search_string == "" && new_state.current_path.length) {
						var ns_name = new_state.current_path[new_state.current_path.length - 1].name;
						last_token.search_string = ns_name;
					}
				}
				new_state.contacts = false;
				new_state.isLoading = false;
				this.setState(new_state);

				// fetch contacts
				var contacts_to_fetch = [];
				new_state.current_path.forEach(function (area) {
					contacts_to_fetch.push(area.area_id);
				});
				if (new_state.area_info.descendent_contact_count <= limit) {
					var explore = function (area) {
						contacts_to_fetch.push(area.area.area_id);
						area.children.map(explore);
					}
					new_state.area_info.descendents.children.map(explore);
				}
				common.fetch_contact_info(contacts_to_fetch,
					function (info) {
						
						// TERMINAL: update state if still valid
						if (area_id == this.lastAreaSelected) {
							if ($("#search_box").val) $("#search_box").val("");
							this.props.router.navigate("area/" + area_id);
							new_state.contacts = info;
							console.log(new_state.contacts);
							this.setState(new_state);
						}
					}.bind(this)
				);
			}
		}.bind(this));

	},

	/**
	 * Keyboard controls for navigation.
	 */
	handleMoveResultCursor : function (key) {
		var selected_area = this.state.selected_area;
		if (key == "Down" && selected_area < this.state.search_results.length - 1) {
			this.setState({selected_area : selected_area + 1});
		} else if (key == "Up" && selected_area > -1) {
			this.setState({selected_area : selected_area - 1});
		} else if (key == "Enter") {
			var search_results = this.state.search_results;
			if (selected_area == -1) selected_area = 0;
			if (selected_area < search_results.length) {
	  			this.handleAreaSelect(common.path2area(search_results[selected_area]));
	  		}
		}
		if (selected_area != this.state.selected_area) {
			$('html, body').animate({
		    	scrollTop: $("#result-" + this.state.selected_area).offset().top
		    }, 100);
		}
	},
	handleKeyPress : function (key) {
		var pressed = key.keyIdentifier;
		if (pressed == "Up" || pressed == "Down" || pressed == "Enter") {
			this.handleMoveResultCursor(pressed);
			key.preventDefault();
		} else if (pressed == "U+001B") { // escape
			this.handleReset();
			key.preventDefault();
		}
	},

	/**
	 * Close token (go back)
	 */
	handleCloseToken : function (area) {
		var tokens = this.state.tokens;
		for (var i = 0; i < tokens.length; i++) {
			if (tokens[i].prev_area == area) {
				this.setState({"tokens" : tokens.slice(0, i)});
				break;
			}
		}
		this.handleAreaSelect(area, true);
	},

	/**
	 * Render! Basically just passes data to sub-components.
	 */
	render: function() {

		var load_percentage = this.state.load_percentage !== undefined
			? <div className="loading" style={{width : this.state.load_percentage * 100 + "%"}}>&nbsp;</div>
			: null
		;

		var body = this.state.search_results.length
			? <AreaList
					areas={this.state.search_results}
					contacts={this.state.search_contacts}
					selected={this.state.selected_area}
					search_string={this.lastSearchString}
					onClick={this.handleAreaSelect} />
			: <Contacts
				showDescendents={true}
				path={this.state.current_path}
				area_info={this.state.area_info}
				onAreaSelect={this.handleAreaSelect}
				contact_info={this.state.contacts} />
		;

		return (
			<div className="page-inner">
				<div role="main" className="main">
					<section id="result--1">
						<SearchBox
							onSearch={this.handleSearch}
							onCloseToken={this.handleCloseToken}
							isLoading={this.state.isLoading || !this.state.contacts}
							area={this.state.area_id}
							search_results={this.state.search_results}
							tokens={this.state.tokens} />
						<div className="results">
							<CurrentArea path={this.state.current_path} />
							{load_percentage}
							{body}
							<p><a href={"#manage/" + common.path2area(this.state.current_path)}>Manage</a></p>
						</div>
					</section>
				</div>
			</div>
		);
	}
});

module.exports = DirectoryBrowser;
