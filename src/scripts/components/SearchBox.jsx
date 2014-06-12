/**
 * @jsx React.DOM
 */

'use strict';

var React = require('react/addons');
require('../../styles/SearchBox.css');

var autoCompleteTimeout;

var SearchBox = React.createClass({
	handleSubmit : function () {
		//var search_text = this.refs.search.getDOMNode().value;
		//this.props.onSearch(search_text);
		return false;
	},
	handleReset : function () {
		this.props.onReset();
	},
	handleKeyDown : function (key) {
		if (key.key == "ArrowUp" || key.key == "ArrowDown" || key.key == "Enter") {
			//this.props.onMoveResultCursor(key.key);
			if (key.key == "Enter") this.refs.search.getDOMNode().value = "";
			key.preventDefault();
		}
		//return false;
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
		}
	},
	componentWillReceiveProps : function () {
		this.refs.search.getDOMNode().focus();
	},
	componentDidMount : function () {
		this.componentWillReceiveProps();
	},
    render : function () {
        return (
            <form className="search_form" onSubmit={this.handleSubmit}>
                <input type="text" ref="search" onKeyDown={this.handleKeyDown} onKeyUp={this.handleKeyUp} />
                <button>Submit (ENTER)</button> <button onClick={this.handleReset}>Reset (ESC)</button>
            </form>
        );
    }
});

module.exports = SearchBox;
