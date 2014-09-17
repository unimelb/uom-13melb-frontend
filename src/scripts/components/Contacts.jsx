/**
 * @jsx React.DOM
 */

'use strict';

var React = require('react/addons');
require('../../styles/Contacts.css');

var AreaContacts = require("./AreaContacts.jsx");

var ZeroClipboard = require("zeroclipboard");

ZeroClipboard.config({
	swfPath: "//cdnjs.cloudflare.com/ajax/libs/zeroclipboard/2.1.1/ZeroClipboard.swf"
});

//var zc_timeout;


var cutoff = 40;

var Contacts = React.createClass({
	zc_timeout : null,
	selectArea : function (area) {
		this.props.onAreaSelect(area);
		return false;
	},
	componentDidMount : function () {
		var component = this;
		clearTimeout(this.zc_timeout);
		this.zc_timeout = setTimeout(function () {
			var cells = document.getElementsByClassName("clickable");
			var client = new ZeroClipboard(cells);
			client.on("ready", function (event) {
				client.on("copy", function (event) {
					var clipboard = event.clipboardData;
					var to_copy = event.target.innerHTML;
					var extension_match = to_copy.replace(/ /g, "").match(/(3|\)|^)(834(?=4)|903(?=5))([0-9]{5})$/);
					if (extension_match) to_copy = extension_match[3];
					clipboard.setData("text/plain", to_copy);
				});
				client.on("aftercopy", function (event) {
					var target = event.target;
					//target.style.backgroundColor = "#CFC";
					var whiteout = $(component.refs.whiteout.getDOMNode());
					whiteout.css({display : "block", opacity : 1});
					$(target).css({opacity : 0});
					whiteout.animate({opacity : 0}, 500, function () {
						whiteout.css({display : "none"});
					});
					$(target).animate({opacity : 1}, 500);
					/*setTimeout(function () {
						//target.style.backgroundColor = "transparent";
						component.refs.whiteout.getDOMNode().style.display = "none";
					}, 200);*/
				});
			});
		}.bind(this), 200);
		$(".show-more").each(function () {

			var less_text = "less...";
			var reference = $(this).parent();
			var box = reference.parent();

			$(this).on("click", function () {
				if ($(this).html() == less_text) {
					box.select("li").css({"display" : "none"});
					$(this).html("more...");
				} else {
					box.select("li").css({"display" : "block"});
					$(this).html(less_text);
				}
				return false;
			});
		});
	},
	componentDidUpdate : function () {
		this.componentDidMount();
	},
	render: function () {

		/**
		 * Loading... (i.e., an ancestor component is still retrieving the information)
		 */
		if (!this.props.contact_info) {
			return <p></p>;//<p className="spinner"><img src="//s3.amazonaws.com/uom-13melb/spinner_32.gif" /></p>;

		/**
		 * Show descendents (a.k.a. "functional areas")
		 */
		} else {
			// show all contacts above, and below if set to
			var contact_display = this.props.path.map(function (element, index) {
				return <AreaContacts
					showDescendents={this.props.showDescendents}
					key={element.area_id} area={element}
					contacts={this.props.contact_info[element.area_id]}
					search_string={this.props.search_string}
					onAreaSelect={index == this.props.path.length - 1 ? false : this.props.onAreaSelect} />;
			}.bind(this));
			//console.log(this.props.path);

			if (this.props.showDescendents && this.props.area_info.descendent_contact_count > cutoff) {
				//console.log('too many descendents');
				// too many descendents, show tree
				var explore = function (tree, depth) {
					var sub_list = null;
					if (tree.children.length) {
						if (depth) {
							sub_list = <ul>{tree.children.map(function (child) {
								return explore(child, depth - 1);
							})}</ul>;
						} else sub_list = <ul><li>...</li></ul>;
					}
					var load_area = function () {
						this.selectArea(tree.area.area_id);
						return false;
					}.bind(this);
					return (
						<li key={tree.area.area_id}>
							<a href="#" onClick={load_area}>{tree.area.name}</a>
							{sub_list}
						</li>
					);
				}.bind(this);

				var descendents = this.props.area_info.descendents.children.map(function (child) {
					var load_area = function () {
						this.selectArea(child.area.area_id);
						return false;
					}.bind(this);
					var child_lis = child.children.map(function (area) {
						return explore(area, 3);
					});
					if (child_lis.length > 7) {
						child_lis.push(<li><a className="show-more" href="#">more...</a></li>);
					}
					var subchildren = child.children.length
						? <ul>{child_lis}</ul>
						: <p>No further functional areas.</p>;
					return (
						<div key={child.area.area_id} className="child-summary">
							<div>
								<h4><a href="#" onClick={load_area}>{child.area.name}</a></h4>
								{subchildren}
							</div>
						</div>
					)
					
				}.bind(this));

				var descendent_groups = [];
				var descendent_group = [];
				descendents.forEach(function (desc, index) {
					descendent_group.push(desc);
					if (descendent_group.length == 4 || index == descendents.length - 1) {
						descendent_group.push(<hr className="clear" />);
						descendent_groups.push(<div className="descendent-group">{descendent_group}</div>);
						descendent_group = [];
					}
				});

				return (
					<div>
						{contact_display}
						<div className="descendents">
							{descendent_groups}
						</div>
						<hr className="clear" />
					</div>
				);

			/**
			 * Show individual contact display.
			 */
			} else {
				//console.log("at Contacts: " + this.props.showDescendents);
				var subcontact_display = function (children) {
					return children.map(function (child) {
						console.log("inside loop: " + this.props.showDescendents);
						var area_contacts = <AreaContacts
							area={child.area}
							showDescendents={this.props.showDescendents}
							contacts={this.props.contact_info[child.area.area_id]}
							needsDivision={children.length > 1}
							onAreaSelect={this.props.onAreaSelect} />;
						var subcontacts = subcontact_display(child.children);
						return (
							<div key={child.area.area_id} className="child_area">
								{area_contacts}
								{subcontacts}
							</div>
						) ;
					}.bind(this));
				}.bind(this);

				var num_descendents = this.props.area_info.descendent_contact_count || (
					this.props.path.length
						? this.props.path[this.props.path.length - 1].descendent_contact_count
						: 0
				);
				var descendent_contacts = this.props.showDescendents && num_descendents
					? <div><hr />{subcontact_display(this.props.area_info.descendents.children)}</div>
					: num_descendents
						? <p className="descendent_notice">{"Has " + num_descendents + " un-shown descendent contacts; select to view."}</p>
						: null
				;						
				return (
					<div>
						{contact_display}
						{descendent_contacts}
						<div ref="whiteout" className="whiteout"></div>
					</div>
				);
			}
		}
	}
});

module.exports = Contacts;
