(function () {
    'use strict';

    exports.wrap = function (container, text, y, width) {
		var textElement = container.append('text')
			.attr({
				x: 0,
				y: y,
				'font-size': 10
			});
			
		var words = splitWordsInPart(text);
		var line = [];
		var lineNumber = 0;
		var lineHeight = 1.4; // ems
		
		var tspan = textElement.append('tspan');

		while (words.length > 0) {
			var word = words[0];
			line.push(word);
			tspan.text(line.join(""));

			if (tspan.node().getComputedTextLength() > width) {
				line.pop();
				tspan
					.text(line.join(""))
					.attr("x", (width - tspan.node().getComputedTextLength()) / 2)
					.attr("dy", lineNumber * lineHeight + "em");
				line = [];

				lineNumber += 1;

				tspan = textElement.append("tspan");
			} else {
				words.shift();
			}
		}
		
		if (line.length > 0) {
			tspan
				.text(line.join(""))
				.attr("x", (width - tspan.node().getComputedTextLength()) / 2)
				.attr("dy", lineNumber * lineHeight + "em");
		}
    };

    function splitWordsInPart(text) {
        var words = [];
        var word = '';
        var splitters = [' ', '-'];

        for (var i = 0; i < text.length; i++) {
            var character = text.charAt(i);
            word += character;
            if (_.contains(splitters, character)) {
                words.push(word);
                word = '';
            }
        }

        if (word !== '') {
            words.push(word);
        }
        return words;
    }
}());