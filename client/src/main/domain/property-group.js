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
	
	exports.companyGroup = function (index, color, properties, prices) {
		precondition(_.isNumber(index), 'Company property group requires an index');
		precondition(_.isString(color), 'Company property group requires a color');
		precondition(_.isFunction(properties), 'Company property group requires a function to list its properties');
		precondition(_.isNumber(prices.value) && prices.value > 0, 'Company property group requires a value');
		precondition(_.isArray(prices.multipliers) && prices.multipliers.length === 2,
			'Company property group requires a list of multipliers');
		
		var group = new PropertyGroup(index, color, properties);
		
		group.propertyValue = function () {
			return prices.value;
		};
		
		group.multipliers = function () {
			return prices.multipliers;
		};
		
		return group;
	};
	
	exports.railroadGroup = function (index, color, properties, prices) {
		precondition(_.isNumber(index), 'Railroad property group requires an index');
		precondition(_.isString(color), 'Railroad property group requires a color');
		precondition(_.isFunction(properties), 'Railroad property group requires a function to list its properties');
		precondition(_.isNumber(prices.value) && prices.value > 0, 'Railroad property group requires a value');
		precondition(_.isNumber(prices.baseRent) && prices.baseRent > 0,
			'Railroad property group requires a base rent');
		
		var group = new PropertyGroup(index, color, properties);
		
		group.propertyValue = function () {
			return prices.value;
		};
		
		group.baseRent = function () {
			return prices.baseRent;
		};
		
		return group;
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