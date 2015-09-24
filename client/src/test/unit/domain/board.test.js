(function() {
	"use strict";
	
	var Board = require('./board');
	
	describe('Board property compare', function () {
		describe('an estate', function () {
			it('is in front of a railroad', function () {
				var comparison = Board.properties().mediterranean.compareTo(
					Board.properties().readingRailroad);			
				expect(comparison).to.be(1);
			});
			
			it('is in front of a company', function () {
				var comparison = Board.properties().mediterranean.compareTo(
					Board.properties().electricCompany);
				expect(comparison).to.be(1);
			});
			
			it('is equal to itself', function () {
				var comparison = Board.properties().mediterranean.compareTo(
					Board.properties().mediterranean);
				expect(comparison).to.be(0);
			});
			
			it('is in front of an estate in a numerically superior group', function () {
				var comparison = Board.properties().mediterranean.compareTo(
					Board.properties().charles);
				expect(comparison).to.be(1);
			});
			
			it('is behind an estate in a numerically inferior group', function () {
				var comparison = Board.properties().charles.compareTo(
					Board.properties().mediterranean);
				expect(comparison).to.be(-1);
			});
			
			it('is in front of an estate that comes after in its group', function () {
				var comparison = Board.properties().mediterranean.compareTo(
					Board.properties().baltic);
				expect(comparison).to.be(1);
			});
			
			it('is behing an estate that comes after him in its group', function () {
				var comparison = Board.properties().baltic.compareTo(
					Board.properties().mediterranean);
				expect(comparison).to.be(-1);
			});
		});
		
		describe('a railroad', function () {
			it('is behind an estate', function () {
				var comparison = Board.properties().readingRailroad.compareTo(
					Board.properties().mediterranean);			
				expect(comparison).to.be(-1);
			});
			
			it('is in front of a company', function () {
				var comparison = Board.properties().readingRailroad.compareTo(
					Board.properties().electricCompany);			
				expect(comparison).to.be(1);
			});
			
			it('is equal to itself', function () {
				var comparison = Board.properties().readingRailroad.compareTo(
					Board.properties().readingRailroad);			
				expect(comparison).to.be(0);
			});
			
			it('if Reading railroad, is in front of the other 3 railroads', function () {
				var comparisonToPenn = Board.properties().readingRailroad.compareTo(
					Board.properties().pennsylvaniaRailroad);			
				expect(comparisonToPenn).to.be(1);
				
				var comparisonToBO = Board.properties().readingRailroad.compareTo(
					Board.properties().boRailroad);			
				expect(comparisonToBO).to.be(1);
				
				var comparisonToShort = Board.properties().readingRailroad.compareTo(
					Board.properties().shortRailroad);			
				expect(comparisonToShort).to.be(1);
			});
			
			it('if Pennsylvania railroad, is behind Reading railroad but in front of the other 2 railroads',
				function () {
				var comparisonToReading = Board.properties().pennsylvaniaRailroad.compareTo(
					Board.properties().readingRailroad);			
				expect(comparisonToReading).to.be(-1);
				
				var comparisonToBO = Board.properties().pennsylvaniaRailroad.compareTo(
					Board.properties().boRailroad);			
				expect(comparisonToBO).to.be(1);
				
				var comparisonToShort = Board.properties().pennsylvaniaRailroad.compareTo(
					Board.properties().shortRailroad);			
				expect(comparisonToShort).to.be(1);
			});
			
			it('if B.& O. railroad, is in front of Short railroad but behind the other 2 railroads', function () {
				var comparisonToReading = Board.properties().boRailroad.compareTo(
					Board.properties().readingRailroad);			
				expect(comparisonToReading).to.be(-1);
				
				var comparisonToPenn = Board.properties().boRailroad.compareTo(
					Board.properties().pennsylvaniaRailroad);			
				expect(comparisonToPenn).to.be(-1);
				
				var comparisonToShort = Board.properties().boRailroad.compareTo(
					Board.properties().shortRailroad);			
				expect(comparisonToShort).to.be(1);
			});
			
			it('if Short railroad, is behind the other 3 railroads', function () {
				var comparisonToReading = Board.properties().shortRailroad.compareTo(
					Board.properties().readingRailroad);			
				expect(comparisonToReading).to.be(-1);
				
				var comparisonToPenn = Board.properties().shortRailroad.compareTo(
					Board.properties().pennsylvaniaRailroad);			
				expect(comparisonToPenn).to.be(-1);
				
				var comparisonToBO = Board.properties().shortRailroad.compareTo(
					Board.properties().boRailroad);			
				expect(comparisonToBO).to.be(-1);
			});
		});
		
		describe('a company', function () {
			it('is behind an estate', function () {
				var comparison = Board.properties().electricCompany.compareTo(
					Board.properties().mediterranean);
				expect(comparison).to.be(-1);
			});
			
			it('is behind a railroad', function () {
				var comparison = Board.properties().electricCompany.compareTo(
					Board.properties().readingRailroad);
				expect(comparison).to.be(-1);
			});
			
			it('is equal to itself', function () {
				var comparison = Board.properties().electricCompany.compareTo(
					Board.properties().electricCompany);
				expect(comparison).to.be(0);
			});
			
			it('if electric company, is in front of the waterworks', function () {
				var comparison = Board.properties().electricCompany.compareTo(
					Board.properties().waterWorks);
				expect(comparison).to.be(1);
			});
			
			it('if waterworks, is behind the electric company', function () {
				var comparison = Board.properties().waterWorks.compareTo(
					Board.properties().electricCompany);
				expect(comparison).to.be(-1);
			});
		});
	});
}());