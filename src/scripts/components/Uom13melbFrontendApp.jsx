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

var url_base = "http://uom-13melb.herokuapp.com/area/";
var search_url = function (area) {
	return url_base + area + "/search";
}

// CSS
require('../../styles/reset.css');
require('../../styles/main.css');

var imageURL = '../../images/yeoman.png';

var Uom13melbFrontendApp = React.createClass({
	getInitialState : function () {
		return {
			"areas" : [],
			"selected_area" : 0,
			"current_area" : "root"
		};
	},
	componentDidMount : function () {
		document.addEventListener("keydown", this.handleKeyPress);
	},
	handleReset : function () {
		this.setState({"current_area" : "root"});
	},
	handleSearch : function (search_text) {
		this.setState({"selected_area" : 0});
		if (search_text.length == 0) {
			this.setState({areas : []});
		} else {
			$.ajax({
				url: search_url(this.state.current_area),
				dataType: "json",
				type: "GET",
				data: {q : search_text},
				success: function (data) {
					this.setState({areas : data})
				}.bind(this)
			});
		}
	},
	handleAreaSelect: function (area_id) {
		this.setState({current_area : area_id, areas : []});
	},
	handleMoveResultCursor : function (key) {
		var selected_area = this.state.selected_area;
		if (key == "Down" && selected_area < this.state.areas.length - 1) {
			this.setState({"selected_area" : selected_area + 1});
		} else if (key == "Up" && selected_area > 0) {
			this.setState({"selected_area" : selected_area - 1});
		} else if (key == "Enter") {
	  		this.handleAreaSelect(this.state.areas[selected_area].slice(-1)[0].area_id);
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
	render: function() {
		return (
			<div className="main" onKeyUp={this.handleKeyPress}>
				<h1>13MELB</h1>
				<SearchBox onSearch={this.handleSearch} onMoveResultCursor={this.handleMoveResultCursor} onReset={this.handleReset} />
				<CurrentArea area={this.state.current_area} />
				<AreaList data={this.state.areas} selected={this.state.selected_area} onClick={this.handleAreaSelect} />
				<Contacts area={this.state.current_area} onAreaSelect={this.handleAreaSelect} />
			</div>
		);
	}
});

React.renderComponent(<Uom13melbFrontendApp />, document.getElementById('content')); // jshint ignore:line

module.exports = Uom13melbFrontendApp;
