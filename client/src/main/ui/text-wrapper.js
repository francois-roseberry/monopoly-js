(function () {
    'use strict';

    exports.wrap = function (container, text, y, width) {
		var textElement = container.append('text')
			.attr({
				x: 0,
				y: y,
				'font-size': 9
			});
			
		var words = text.split(' ');
		var line = [];
		var lineNumber = 0;
		var lineHeight = 1.4; // ems
		var margin = 4;
		
		var tspan = textElement.append('tspan');

		while (words.length > 0) {
			var word = words[0];
			line.push(word);
			tspan.text(line.join(" "));

			if (tspan.node().getComputedTextLength() > (width - 2 * margin)) {
				line.pop();
				tspan
					.text(line.join(" "))
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
				.text(line.join(" "))
				.attr("x", (width - tspan.node().getComputedTextLength()) / 2)
				.attr("dy", lineNumber * lineHeight + "em");
		}
    };
}());