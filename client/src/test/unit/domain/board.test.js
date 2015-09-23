(function() {
	"use strict";
	
	var Board = require('./board');
	var Company = require('./company');
	var Railroad = require('./railroad');
	
	describe('Board property compare', function () {
		describe('an estate', function () {
			it('is in front of a railroad', function () {
				var comparison = Board.squares()[1].compareTo(Railroad.reading());			
				expect(comparison).to.be(1);
			});
			
			it('is in front of a company', function () {
				var comparison = Board.squares()[1].compareTo(Company.electric());
				expect(comparison).to.be(1);
			});
			
			it('is equal to itself', function () {
				var comparison = Board.squares()[1].compareTo(Board.squares()[1]);
				expect(comparison).to.be(0);
			});
			
			it('is in front of an estate in a numerically superior group', function () {
				var comparison = Board.squares()[1].compareTo(Board.squares()[11]);
				expect(comparison).to.be(1);
			});
			
			it('is behind an estate in a numerically inferior group', function () {
				var comparison = Board.squares()[11].compareTo(Board.squares()[1]);
				expect(comparison).to.be(-1);
			});
			
			it('is in front of an estate that comes after in its group', function () {
				var comparison = Board.squares()[1].compareTo(Board.squares()[3]);
				expect(comparison).to.be(1);
			});
			
			it('is behing an estate that comes after him in its group', function () {
				var comparison = Board.squares()[3].compareTo(Board.squares()[1]);
				expect(comparison).to.be(-1);
			});
		});
		
		describe('a railroad', function () {
			it('is behind an estate', function () {
				var comparison = Railroad.reading().compareTo(Board.squares()[1]);			
				expect(comparison).to.be(-1);
			});
			
			it('is in front of a company', function () {
				var comparison = Railroad.reading().compareTo(Company.electric());			
				expect(comparison).to.be(1);
			});
			
			it('is equal to itself', function () {
				var comparison = Railroad.reading().compareTo(Railroad.reading());			
				expect(comparison).to.be(0);
			});
			
			it('if Reading railroad, is in front of the other 3 railroads', function () {
				var comparisonToPenn = Railroad.reading().compareTo(Railroad.pennsylvania());			
				expect(comparisonToPenn).to.be(1);
				
				var comparisonToBO = Railroad.reading().compareTo(Railroad.bo());			
				expect(comparisonToBO).to.be(1);
				
				var comparisonToShort = Railroad.reading().compareTo(Railroad.short());			
				expect(comparisonToShort).to.be(1);
			});
			
			it('if Pennsylvania railroad, is behind Reading railroad but in front of the other 2 railroads',
				function () {
				var comparisonToReading = Railroad.pennsylvania().compareTo(Railroad.reading());			
				expect(comparisonToReading).to.be(-1);
				
				var comparisonToBO = Railroad.pennsylvania().compareTo(Railroad.bo());			
				expect(comparisonToBO).to.be(1);
				
				var comparisonToShort = Railroad.pennsylvania().compareTo(Railroad.short());			
				expect(comparisonToShort).to.be(1);
			});
			
			it('if B.& O. railroad, is in front of Short railroad but behind the other 2 railroads', function () {
				var comparisonToReading = Railroad.bo().compareTo(Railroad.reading());			
				expect(comparisonToReading).to.be(-1);
				
				var comparisonToPenn = Railroad.bo().compareTo(Railroad.pennsylvania());			
				expect(comparisonToPenn).to.be(-1);
				
				var comparisonToShort = Railroad.bo().compareTo(Railroad.short());			
				expect(comparisonToShort).to.be(1);
			});
			
			it('if Short railroad, is behind the other 3 railroads', function () {
				var comparisonToReading = Railroad.short().compareTo(Railroad.reading());			
				expect(comparisonToReading).to.be(-1);
				
				var comparisonToPenn = Railroad.short().compareTo(Railroad.pennsylvania());			
				expect(comparisonToPenn).to.be(-1);
				
				var comparisonToBO = Railroad.short().compareTo(Railroad.bo());			
				expect(comparisonToBO).to.be(-1);
			});
		});
		
		describe('a company', function () {
			it('is behind an estate', function () {
				var comparison = Company.electric().compareTo(Board.squares()[1]);
				expect(comparison).to.be(-1);
			});
			
			it('is behind a railroad', function () {
				var comparison = Company.electric().compareTo(Railroad.reading());
				expect(comparison).to.be(-1);
			});
			
			it('is equal to itself', function () {
				var comparison = Company.electric().compareTo(Company.electric());
				expect(comparison).to.be(0);
			});
			
			it('if electric company, is in front of the waterworks', function () {
				var comparison = Company.electric().compareTo(Company.water());
				expect(comparison).to.be(1);
			});
			
			it('if waterworks, is behind the electric company', function () {
				var comparison = Company.water().compareTo(Company.electric());
				expect(comparison).to.be(-1);
			});
		});
	});
}());