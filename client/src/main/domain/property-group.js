(function() {
	"use strict";
	
	var precondition = require('./contract').precondition;
	
	exports.isGroup = function (candidate) {
		return candidate instanceof PropertyGroup;
	};
	
	exports.newGroup = function (index, color, properties) {
		precondition(_.isNumber(index), 'PropertyGroup requires an index');
		precondition(_.isString(color), 'PropertyGroup requires a color');
		precondition(_.isFunction(properties), 'PropertyGroup requires a function to list its properties');
		
		return new PropertyGroup(index, color, properties);
	};
	
	function PropertyGroup(index, color, properties) {
		this._index = index;
		this._color = color;
		this._properties = properties;
	}
	
	PropertyGroup.prototype.index = function () {
		return this._index;
	};
	
	PropertyGroup.prototype.color = function () {
		return this._color;
	};
	
	PropertyGroup.prototype.properties = function () {
		return this._properties(this._index);
	};
	
	PropertyGroup.prototype.compareTo = function (other) {
		precondition(other && other instanceof PropertyGroup,
			'Comparing this group to another group requires that other group');
			
		if (this._index === other._index) {
			return 0;
		}
		
		return (this._index < other._index ? 1 : -1);
	};
}());