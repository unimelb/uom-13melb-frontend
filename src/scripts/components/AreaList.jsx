/**
 * @jsx React.DOM
 */

'use strict';

var React = require('react/addons');
require('../../styles/AreaList.css');

var Contacts  = require("./Contacts.jsx");

var url_base = "http://uom-13melb.herokuapp.com/area/";

var AreaList = React.createClass({
	handleClick: function (area_id) {
		this.props.onClick(area_id);
	},
	componentWillReceiveProps : function (new_props) {
		//this.state.selected = new_props.selected;
	},
	render: function () {
		var area_list = this.props.areas.map(function (path, index) {
			var area_id = path[path.length - 1]["area_id"];
			var area_path = path.map(function (path) {
				return path.name;
			}).join(" > ");

			var click_handle = function () {
				this.handleClick(area_id);
			}.bind(this);

			var class_name = this.props.selected == index ? "highlighted" : "unhighlighted";
			var contacts = <Contacts
				showDescendents={false}
				path={path}
				area_info={{descendent_contact_count : path[path.length - 1].descendent_contact_count}}
				contact_info={this.props.contacts} />
			;
			
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
		}.bind(this));

		return (
		    <ul className="area_list">
		    	{area_list}
		    </ul>
		);
	}
});

module.exports = AreaList;
