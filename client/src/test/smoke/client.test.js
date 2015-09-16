(function() {
	"use strict";
	
	var expect = require('expect.js');
	var webdriver = require('selenium-webdriver');
	
	describe('The game', function () {
		it('can launch without crashing', function () {
			var driver = new webdriver.Builder()
				.usingServer('http://localhost:8185')
				.withCapabilities(webdriver.Capabilities.phantomjs())
				.build();
			
			driver.get('http://localhost:3000');
			
			var container = driver.findElement(webdriver.By.className('game-container'));
			expect(container).to.not.eql('undefined');
			
			driver.quit();
		});
	});
}());
