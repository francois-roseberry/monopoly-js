(function () {
    'use strict';

    var precondition = require('./contract').precondition;

    describe('testing a precondition', function () {
        it('should do nothing when the precondition is true', function () {
            precondition(true);
        });

        it('should throw an exception when the precondition is false', function () {
            expect(function () {
                precondition(false);
            }).to.throwError();
        });
    });
}());