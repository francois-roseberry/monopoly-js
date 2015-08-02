(function() {
	"use strict";
	
	exports.precondition = function (check, message) {
        if (check) {
            return;
        }
        throw new Error("Precondition: " + message);
    };
}());