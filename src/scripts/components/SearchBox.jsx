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
		//var search_text = this.refs.search.getDOMNode().value;
		//this.props.onSearch(search_text);
		return false;
	},
	handleReset : function () {
		this.props.onReset();
	},
	handleKeyDown : function (key) {
		if (key.key == "Escape") {
			this.refs.search.getDOMNode().value = "";
		} else if (key.key == "Backspace" && this.refs.search.getDOMNode().value == "") {
			this.handleRemoveToken(this.props.tokens[this.props.tokens.length - 1].prev_area);
		} else if (
			key.key == "ArrowUp" ||
			key.key == "ArrowDown" ||
			key.key == "Enter"
		) {
			//this.props.onMoveResultCursor(key.key);
			if (key.key == "Enter") {
				this.refs.search.getDOMNode().value = "";
			}
			key.preventDefault();
		}
		//return false;
	},
	handleKeyUp : function (key) {
		if (!(key.key == "ArrowUp" || key.key == "ArrowDown")) {
			var search_text = this.refs.search.getDOMNode().value;
			clearTimeout(autoCompleteTimeout);
			if (search_text.length > 2) {
				//this.props.onIsSearching(true);
				autoCompleteTimeout = setTimeout(function () {
					this.props.onSearch(search_text);
				}.bind(this), 200);
			} else {
				this.props.onSearch('');
				//this.props.onIsSearching(false);
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
		this.componentWillReceiveProps();
	},
    render : function () {
    	var tokens = this.props.tokens.map(function (token) {
    		var label = token.search_string ? token.search_string : " ";
    		return <li onClick={function () { this.handleRemoveToken(token.prev_area); }.bind(this)}>
    			{label}
    		</li>;
    	}.bind(this));
    	var progressbar_style = {"width" : this.props.progressBarWidth + "%"};
        return (
            <form className="search_form" onSubmit={this.handleSubmit}>
            	<div className="search_box" onClick={this.handleFauxBoxClick}>
            		<ul id="search_tokens" ref="search_tokens">
            			{tokens}
            		</ul>
                	<input type="text" ref="search" onKeyDown={this.handleKeyDown} onKeyUp={this.handleKeyUp} />
                </div>
                <div className="progressbar" style={progressbar_style}></div>
                <div ref="search_shadow" className="search_shadow"></div>
            </form>
        );
        //<button>Submit (ENTER)</button> <button onClick={this.handleReset}>Reset (ESC)</button>
    }
});

module.exports = SearchBox;
