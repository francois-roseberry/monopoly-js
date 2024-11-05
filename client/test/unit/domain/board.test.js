(function() {
	"use strict";
	
	var Board = require('./board');
	
	describe('Board property compare', function () {
		var board;
		
		beforeEach(function () {
			board = Board.standard();
		});
		
		describe('an estate', function () {
			it('is in front of a railroad', function () {
				var comparison = board.properties().mediterranean.compareTo(
					board.properties().readingRailroad);			
				expect(comparison).to.be(1);
			});
			
			it('is in front of a company', function () {
				var comparison = board.properties().mediterranean.compareTo(
					board.properties().electricCompany);
				expect(comparison).to.be(1);
			});
			
			it('is equal to itself', function () {
				var comparison = board.properties().mediterranean.compareTo(
					board.properties().mediterranean);
				expect(comparison).to.be(0);
			});
			
			it('is in front of an estate in a numerically superior group', function () {
				var comparison = board.properties().mediterranean.compareTo(
					board.properties().charles);
				expect(comparison).to.be(1);
			});
			
			it('is behind an estate in a numerically inferior group', function () {
				var comparison = board.properties().charles.compareTo(
					board.properties().mediterranean);
				expect(comparison).to.be(-1);
			});
			
			it('is in front of an estate that comes after in its group', function () {
				var comparison = board.properties().mediterranean.compareTo(
					board.properties().baltic);
				expect(comparison).to.be(1);
			});
			
			it('is behing an estate that comes after him in its group', function () {
				var comparison = board.properties().baltic.compareTo(
					board.properties().mediterranean);
				expect(comparison).to.be(-1);
			});
		});
		
		describe('a railroad', function () {
			it('is behind an estate', function () {
				var comparison = board.properties().readingRailroad.compareTo(
					board.properties().mediterranean);			
				expect(comparison).to.be(-1);
			});
			
			it('is in front of a company', function () {
				var comparison = board.properties().readingRailroad.compareTo(
					board.properties().electricCompany);			
				expect(comparison).to.be(1);
			});
			
			it('is equal to itself', function () {
				var comparison = board.properties().readingRailroad.compareTo(
					board.properties().readingRailroad);			
				expect(comparison).to.be(0);
			});
			
			it('if Reading railroad, is in front of the other 3 railroads', function () {
				var comparisonToPenn = board.properties().readingRailroad.compareTo(
					board.properties().pennsylvaniaRailroad);			
				expect(comparisonToPenn).to.be(1);
				
				var comparisonToBO = board.properties().readingRailroad.compareTo(
					board.properties().boRailroad);			
				expect(comparisonToBO).to.be(1);
				
				var comparisonToShort = board.properties().readingRailroad.compareTo(
					board.properties().shortRailroad);			
				expect(comparisonToShort).to.be(1);
			});
			
			it('if Pennsylvania railroad, is behind Reading railroad but in front of the other 2 railroads',
				function () {
				var comparisonToReading = board.properties().pennsylvaniaRailroad.compareTo(
					board.properties().readingRailroad);			
				expect(comparisonToReading).to.be(-1);
				
				var comparisonToBO = board.properties().pennsylvaniaRailroad.compareTo(
					board.properties().boRailroad);			
				expect(comparisonToBO).to.be(1);
				
				var comparisonToShort = board.properties().pennsylvaniaRailroad.compareTo(
					board.properties().shortRailroad);			
				expect(comparisonToShort).to.be(1);
			});
			
			it('if B.& O. railroad, is in front of Short railroad but behind the other 2 railroads', function () {
				var comparisonToReading = board.properties().boRailroad.compareTo(
					board.properties().readingRailroad);			
				expect(comparisonToReading).to.be(-1);
				
				var comparisonToPenn = board.properties().boRailroad.compareTo(
					board.properties().pennsylvaniaRailroad);			
				expect(comparisonToPenn).to.be(-1);
				
				var comparisonToShort = board.properties().boRailroad.compareTo(
					board.properties().shortRailroad);			
				expect(comparisonToShort).to.be(1);
			});
			
			it('if Short railroad, is behind the other 3 railroads', function () {
				var comparisonToReading = board.properties().shortRailroad.compareTo(
					board.properties().readingRailroad);			
				expect(comparisonToReading).to.be(-1);
				
				var comparisonToPenn = board.properties().shortRailroad.compareTo(
					board.properties().pennsylvaniaRailroad);			
				expect(comparisonToPenn).to.be(-1);
				
				var comparisonToBO = board.properties().shortRailroad.compareTo(
					board.properties().boRailroad);			
				expect(comparisonToBO).to.be(-1);
			});
		});
		
		describe('a company', function () {
			it('is behind an estate', function () {
				var comparison = board.properties().electricCompany.compareTo(
					board.properties().mediterranean);
				expect(comparison).to.be(-1);
			});
			
			it('is behind a railroad', function () {
				var comparison = board.properties().electricCompany.compareTo(
					board.properties().readingRailroad);
				expect(comparison).to.be(-1);
			});
			
			it('is equal to itself', function () {
				var comparison = board.properties().electricCompany.compareTo(
					board.properties().electricCompany);
				expect(comparison).to.be(0);
			});
			
			it('if electric company, is in front of the waterworks', function () {
				var comparison = board.properties().electricCompany.compareTo(
					board.properties().waterWorks);
				expect(comparison).to.be(1);
			});
			
			it('if waterworks, is behind the electric company', function () {
				var comparison = board.properties().waterWorks.compareTo(
					board.properties().electricCompany);
				expect(comparison).to.be(-1);
			});
		});
	});
}());