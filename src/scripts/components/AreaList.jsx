/**
 * @jsx React.DOM
 */

'use strict';

var React = require('react/addons');

var Contacts  = require("./Contacts.jsx");

var AreaList = React.createClass({
	previous : -1,
	componentDidUpdate : function () {
		//console.log(window.location.hash);
		//window.location.hash = "#result-" + this.props.selected;
		/*if (this.props.selected != 0 || this.previous > -1) {
			this.previous = this.props.selected;
			
		}*/
	},
	render: function () {

		// generate list by looping through each search result
		var area_list = this.props.areas.map(function (path, index) {

			// construct path text representation
			var area_id = path[path.length - 1]["area_id"];
			var area_path = path.map(function (path) {
				return path.name;
			}).join(" / ");

			// create contacts pane for area
			var class_name = this.props.selected == index ? "highlighted" : "unhighlighted";
			var contacts = <Contacts
				showDescendents={false}
				path={path}
				search_string={this.props.search_string}
				area_info={{descendent_contact_count : 0/*path[path.length - 1].descendent_contact_count*/}}
				onAreaSelect={this.props.onClick}
				contact_info={this.props.contacts} />
			;

			// return list item with contacts
			return (
				<li key={area_id} id={"result-" + index} className={class_name}>
					<div className="area">
						<a className="search_result"  name={"result-" + index} href="#" onClick={function () {
							this.props.onClick(area_id);
							return false;
						}.bind(this)}>{area_path}</a>
					</div>
					<div className="contacts">
						{contacts}
					</div>
				</li>
			);
		}.bind(this));

		// return an unordered list with search results
		return (
		    <ul className="area_list">
		    	{area_list}
		    </ul>
		);
	}
});

module.exports = AreaList;
