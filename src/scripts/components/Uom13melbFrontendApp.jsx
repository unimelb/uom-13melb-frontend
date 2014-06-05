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
	componentWillMount: function () {
		$.ajax({
			url: url_base + "root",
			dataType: "json",
			success: function (data) {
				this.setState({current_area: data.area_id});
			}.bind(this)
		});
	},
	getInitialState : function () {
		return {
			"areas" : [],
			"current_area" : "root" // should get dynamically
		};
	},
	handleSearch : function (search_text) {
		console.log(search_text);
		$.ajax({
			url: search_url(this.state.current_area),
			dataType: "json",
			type: "GET",
			data: {q : search_text},
			success: function (data) {
				this.setState({areas : data})
			}.bind(this)
		});
	},
	handleAreaSelect: function (area_id) {
		this.setState({current_area : area_id, areas : []});
	},
	render: function() {
		return (
			<div className='main'>
				<SearchBox onSearch={this.handleSearch} />
				<CurrentArea area={this.state.current_area} />
				<AreaList data={this.state.areas} onClick={this.handleAreaSelect} />
				<Contacts area={this.state.current_area} />
			</div>
		);
	}
});

React.renderComponent(<Uom13melbFrontendApp />, document.getElementById('content')); // jshint ignore:line

module.exports = Uom13melbFrontendApp;
