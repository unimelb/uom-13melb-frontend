/**
 * @jsx React.DOM
 */

'use strict';

var React = require('react/addons');
require('../../styles/SearchBox.css');

var SearchBox = React.createClass({
	handleSubmit : function () {
		var search_text = this.refs.search.getDOMNode().value;
		this.props.onSearch(search_text);
		return false;
	},

    render : function () {
        return (
            <form onSubmit={this.handleSubmit}>
                <input type="text" ref="search" />
            </form>
        );
    }
});

module.exports = SearchBox;
