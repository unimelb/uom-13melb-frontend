/**
 * @jsx React.DOM
 */

'use strict';

var React = require('react/addons');
var ReactTransitionGroup = React.addons.TransitionGroup;

var SearchBox = require("./SearchBox.jsx");
var CurrentArea = require("./CurrentArea.jsx");
var AreaList = require("./AreaList.jsx");
var Contacts = require("./Contacts.jsx");

var limit = 40;

var url_base = "http://uom-13melb.herokuapp.com/area/";
var search_url = function (area) {
	return url_base + area + "/search";
}

// CSS
require('../../styles/reset.css');
require('../../styles/main.css');

var initialState = {
	"search_results" : [],
	"selected_area" : 0,
	"current_path" : [],
	"history" : ["root"],
	progressBarWidth : 0,
	//"isSearching" : false,
	tokens : [],
	contacts : {"root" : []},
	search_contacts : {},
	area_info : {
		descendents : {children : []},
		descendent_contact_count : 0
	}
};

var multi_ajax = function(calls, callback) {
	var count = calls.length;
	if (!count) callback([]);
	var results = [];
	calls.forEach(function (call, index) {
		if (!(call instanceof Object)) {
			call = {url : call};
		}
		call.success = function (data) {
			results[index] = data;
			if (!--count) callback(results);
		}
		if (!call.dataType) call.dataType = "json";
		$.ajax(call);
	});
}

var fetch_contact_info = function (areas, callback) {
	multi_ajax(
		areas.map(function (area) {
			return url_base + area + "/all_contacts";
		}),
		function (results) {
			console.log(results);
			var map = {};
			areas.forEach(function (area, index) {
				map[area] = results[index];
			});
			callback(map);
		}
	);
}

var path2area = function (path) {
	if (!path.length) return "root";
	else return path[path.length -1].area_id;
}

var Uom13melbFrontendApp = React.createClass({
	lastSearchString : "",
	lastAreaSelected : "",
	getInitialState : function () {
		return initialState;
	},
	componentDidMount : function () {
		document.addEventListener("keydown", this.handleKeyPress);
	},
	handleReset : function () {
		this.replaceState(initialState);
	},

	/**
	 * Main process 1: retrieving search results.
	 */
	handleSearch : function (search_text) {
		this.lastSearchString = search_text;

		if (search_text.length == 0) {

			// clear result list
			if (this.state.search_results.length) this.setState({search_results : []});
		} else {
			this.setState({progressBarWidth : 33});

			// do search
			var new_state = {
				selected_area : 0
			};
			var current_area_id = path2area(this.state.current_path);

			// fetch search results
			$.ajax({
				url: search_url(current_area_id),
				dataType: "json",
				type: "GET",
				data: {q : search_text},
				success: function (data) {

					// fetch contacts for all areas in results
					//new_state.search_results = data;
					this.setState({
						search_results : data,
						search_contacts : false
					});
					var contacts_to_fetch = [];
					data.forEach(function (path) {
						path.forEach(function (area) {
							contacts_to_fetch.push(area.area_id);
						}.bind(this));
					}.bind(this));

					this.setState({progressBarWidth : 66});

					fetch_contact_info(contacts_to_fetch,
						function (info) {
							// TERMINAL: update state (if still valid)

							if (this.lastSearchString == search_text) {
								this.setState({progressBarWidth : 0});	
								new_state.search_contacts = info;
								this.setState(new_state);
							}
						}.bind(this)
					);
				}.bind(this)
			});
		}
	},

	/**
	 * Main process 2: fetching the information for an area
	 */
	handleAreaSelect: function (area_id, token_removed) {
		this.lastAreaSelected = area_id;
		var new_state = {
			search_results : [],
			history : this.state.history.concat([area_id])
		};
		if (!token_removed) {
			new_state.tokens = this.state.tokens.concat([{
				search_string : this.lastSearchString,
				prev_area : path2area(this.state.current_path)
			}]);
		}

		this.setState({progressBarWidth : 33});
		
		// fetch information on area
		multi_ajax([
			url_base + area_id + "/path",
			url_base + area_id + "/descendents",
			url_base + area_id + "/descendent_contact_count"
		], function (results) {
			this.setState({progressBarWidth : 66});

			new_state.current_path = results[0];
			new_state.area_info = {
				descendents : results[1],
				descendent_contact_count : results[2].contacts
			};
			new_state.contacts = false;
			this.setState(new_state);

			// fetch contacts
			var contacts_to_fetch = [];
			if (new_state.area_info.descendent_contact_count <= limit) {
				new_state.current_path.forEach(function (area) {
					contacts_to_fetch.push(area.area_id);
				});
				var explore = function (area) {
					contacts_to_fetch.push(area.area.area_id);
					area.children.map(explore);
				}
				new_state.area_info.descendents.children.map(explore);
			}
			fetch_contact_info(contacts_to_fetch,
				function (info) {
					// if still valid
					if (area_id == this.lastAreaSelected) {
						this.setState({progressBarWidth : 0});
						
						// TERMINAL: update state
						new_state.contacts = info;
						this.setState(new_state);
					}
				}.bind(this)
			);
		}.bind(this));

	},
	handleMoveResultCursor : function (key) {
		var selected_area = this.state.selected_area;
		if (key == "Down" && selected_area < this.state.search_results.length - 1) {
			this.setState({"selected_area" : selected_area + 1});
		} else if (key == "Up" && selected_area > 0) {
			this.setState({"selected_area" : selected_area - 1});
		} else if (key == "Enter") {
			var search_results = this.state.search_results;
			if (selected_area < search_results.length) {
	  			this.handleAreaSelect(search_results[selected_area].slice(-1)[0].area_id);
	  		}
		}
	},
	handleKeyPress : function (key) {
		var pressed = key.keyIdentifier;
		if (pressed == "Up" || pressed == "Down" || pressed == "Enter") {
			this.handleMoveResultCursor(pressed);
			key.preventDefault();
		} else if (pressed == "U+001B") {
			this.handleReset();
			key.preventDefault();
		}
	},
	/*handleIsSearching : function (isSearching) {
		this.setState({"isSearching" : isSearching});
	},*/
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
	render: function() {

		var body = this.state.search_results.length
			? <AreaList
					areas={this.state.search_results}
					contacts={this.state.search_contacts}
					selected={this.state.selected_area}
					onClick={this.handleAreaSelect} />
			: <Contacts
				showDescendents={true}
				path={this.state.current_path}
				area_info={this.state.area_info}
				contact_info={this.state.contacts} />
		;

		return (
			<div className="main">
				<h1>13MELB</h1>
				<SearchBox
					onSearch={this.handleSearch}
					onMoveResultCursor={this.handleMoveResultCursor}
					onCloseToken={this.handleCloseToken}
					onReset={this.handleReset}
					progressBarWidth={this.state.progressBarWidth}
					//onIsSearching={this.handleIsSearching}
					area={this.state.area_id}
					tokens={this.state.tokens} />
				<CurrentArea path={this.state.current_path} />
				{body}
			</div>
		);
	}
});

React.renderComponent(<Uom13melbFrontendApp />, document.getElementById('content')); // jshint ignore:line

module.exports = Uom13melbFrontendApp;
