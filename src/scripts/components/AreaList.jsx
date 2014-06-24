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
			var area_id = area[area.length - 1]["area_id"];
			console.log(area_id);
			var area_path = area.map(function (path) {
				return path.name;
			}).join(" > ");

			var click_handle = function () {
				dom_object.handleClick(area_id);
			}

			var class_name = dom_object.state.selected == index ? "highlighted" : "unhighlighted";
			var contacts = <Contacts showDescendents={false} area={area_id} />;
			console.log(contacts);
			return (
				<li key={area_id} className={class_name}>
					<div className="area">
						<a href="#" onClick={click_handle}>{area_path}</a>
					</div>
					<div className="contacts">
						{contacts}
					</div>
				</li>
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
