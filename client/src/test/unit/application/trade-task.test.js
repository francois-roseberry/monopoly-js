(function() {
	"use strict";
	
	var TradeTask = require('./trade-task');
	var Board = require('./board');
	
	var testData = require('./test-data');
	
	describe('A TradeTask', function () {
		var task;
		var selectedProperties;
		
		beforeEach(function () {
			task = TradeTask.start(testData.players()[0], testData.players()[1]);
			
			task.selectedProperties().subscribe(function (properties) {
				selectedProperties = properties;
			});
		});
		
		it('has no selected properties at start', function () {
			expect(selectedProperties).to.eql([]);
		});
		
		it('can toggle selection state of a property', function () {
			task.togglePropertySelection(Board.properties().readingRailroad.id());
			
			expect(selectedProperties).to.eql([Board.properties().readingRailroad.id()]);
			
			task.togglePropertySelection(Board.properties().readingRailroad.id());
			
			expect(selectedProperties).to.eql([]);
		});
	});
}());