/**
 * @jsx React.DOM
 */

'use strict';

var React = require('react/addons');
var util  = require("util");
require('../../styles/SearchBox.css');

var autoCompleteTimeout;

var SearchBox = React.createClass({
	getInitialState : function () {
		return {};
	},
	handleSubmit : function () {
		return false;
	},
	handleKeyDown : function (key) {
		if (key.key == "Escape") {
			this.refs.search.getDOMNode().value = "";
		} else if (
			key.key == "Backspace"
			&& this.refs.search.getDOMNode().value == ""
			&& this.props.tokens.length
		) {
			this.handleRemoveToken(this.props.tokens[this.props.tokens.length - 1].prev_area);
		} else if (
			key.key == "ArrowUp" ||
			key.key == "ArrowDown" ||
			key.key == "Enter"
		) {
			if (key.key == "Enter") {
				if (this.props.search_results.length) {
					this.refs.search.getDOMNode().value = "";
				}
			}
			key.preventDefault();
		}
	},
	handleKeyUp : function (key) {
		if (!(key.key == "ArrowUp" || key.key == "ArrowDown")) {
			var search_text = this.refs.search.getDOMNode().value;
			clearTimeout(autoCompleteTimeout);
			if (search_text.length > 2) {
				autoCompleteTimeout = setTimeout(function () {
					this.props.onSearch(search_text);
				}.bind(this), 200);
			} else {
				this.props.onSearch('');
			}

			this.refs.search_shadow.getDOMNode().innerHTML = this.refs.search.getDOMNode().value;
			var text_width = this.refs.search_shadow.getDOMNode().offsetWidth;
			this.refs.search.getDOMNode().style.width = (text_width + 100) + "px";
		}
	},
	handleFauxBoxClick : function () {
		this.refs.search.getDOMNode().focus();
	},
	handleRemoveToken : function (area) {
		this.props.onCloseToken(area);
	},
	componentWillReceiveProps : function (new_props) {
		this.refs.search.getDOMNode().focus();
	},
	componentDidMount : function () {
		this.refs.search.getDOMNode().focus();
	},
    render : function () {
    	var used_keys = {};
    	var tokens = this.props.tokens.map(function (token) {
    		var label = token.search_string ? token.search_string : " ";
    		var key = token.prev_area;
    		if (!(key in used_keys)) used_keys[key] = 0;
    		used_keys[key]++;
    		return <li key={key + "-" + used_keys[key]} onClick={function () { this.handleRemoveToken(token.prev_area); }.bind(this)}>
    			{label}
    		</li>;
    	}.bind(this));
    	var loading = this.props.isLoading
    		? <p className="spinner"><img src="images/spinner_32.gif" /></p>
    		: null;
        return (
            <form className="search_form" onSubmit={this.handleSubmit}>
            	<div className="search_box" onClick={this.handleFauxBoxClick}>
            		<ul id="search_tokens" ref="search_tokens">
            			{tokens}
            		</ul>
                	<input
                		type="text" ref="search"
                		onKeyDown={this.handleKeyDown}
                		onKeyUp={this.handleKeyUp}
                		onFocus={this.handleFocus} />
                </div>
                <div ref="search_shadow" className="search_shadow"></div>
                {loading}
            </form>
        );
    }
});

module.exports = SearchBox;
