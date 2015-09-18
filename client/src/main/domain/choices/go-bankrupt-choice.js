(function() {
	"use strict";
	
	var i18n = require('./i18n').i18n();
	
	exports.newChoice = function() {
		return new GoBankruptChoice();
	};
	
	function GoBankruptChoice() {
		this.id = 'go-bankrupt';
		this.name = i18n.CHOICE_GO_BANKRUPT;
	}
	
	GoBankruptChoice.prototype.equals = function (other) {
		return (other instanceof GoBankruptChoice);
	};
	
	GoBankruptChoice.prototype.match = function (visitor) {
		return visitor[this.id]();
	};
}());