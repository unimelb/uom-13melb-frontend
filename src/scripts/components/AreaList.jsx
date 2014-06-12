/**
 * @jsx React.DOM
 */

'use strict';

var React = require('react/addons');
require('../../styles/AreaList.css');

var Contacts  = require("./Contacts.jsx");

var url_base = "http://uom-13melb.herokuapp.com/area/";

var AreaList = React.createClass({
	getInitialState : function () {
		return {
			"selected" : 0
		};
	},
	handleClick: function (area_id) {
		this.props.onClick(area_id);
	},
	componentWillReceiveProps : function (new_props) {
		this.state.selected = new_props.selected;
	},
	render: function () {
		var dom_object = this;
		var area_list = this.props.data.map(function (area, index) {
			var area_path = area.map(function (path) {
				return path.name;
			}).join(" > ");

			var click_handle = function () {
				dom_object.handleClick(area[area.length - 1].area_id);
			}

			var class_name = dom_object.state.selected == index ? "highlighted" : "unhighlighted";
			return (
				<li className={class_name}><a href="#" onClick={click_handle}>{area_path}</a></li>
			);
		});

		return (
		    <ul className="area_list">
		    	{area_list}
		    </ul>
		);
	}
});

module.exports = AreaList;
