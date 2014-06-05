/**
 * @jsx React.DOM
 */

'use strict';

var React = require('react/addons');
require('../../styles/AreaList.css');

require("./Contacts.jsx");

var url_base = "http://uom-13melb.herokuapp.com/area/";

var AreaList = React.createClass({
	handleClick: function (area_id) {
		this.props.onClick(area_id);
	},
	render: function () {
		var dom_object = this;
		var area_list = this.props.data.map(function (area) {
			var area_path = area.map(function (path) {
				return (
					<span>
						&nbsp;&gt;&nbsp;{path.name}
					</span>
				);
			});
			var click_handle = function () {
				dom_object.handleClick(area[area.length - 1].area_id);
			}
			return (
				<div>
					<p><a href="#" onClick={click_handle}>{area_path}</a></p>
				</div>
			);
		});

		return (
		    <div>
		    	{area_list}
		    </div>
		);
	}
});

module.exports = AreaList;
