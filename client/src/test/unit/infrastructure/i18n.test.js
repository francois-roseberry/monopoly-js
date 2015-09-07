(function () {
    'use strict';

    describe('The i18n module', function () {
        var englishLanguage;
        var frenchLanguage;

        beforeEach(function(){
            englishLanguage = englishStrings();
            frenchLanguage = frenchStrings();
        });

        it('has the same amount of strings in both languages', function() {
            var frenchStringCount = _.keys(frenchLanguage).length;
            var englishStringCount = _.keys(englishLanguage).length;

            expect(frenchStringCount).to.be(englishStringCount);
        });

        it('has the same keys across all languages', function() {
            var frenchStringsKeys = _.keys(frenchLanguage);
            var englishStringsKeys = _.keys(englishLanguage);

            expect(_.difference(frenchStringsKeys,englishStringsKeys).length).to.be(0);
            expect(_.difference(englishStringsKeys,frenchStringsKeys).length).to.be(0);
        });

        function englishStrings(){
            forceEnglishLanguage();
            return require('./i18n').i18n();
        }

        function frenchStrings(){
            forceFrenchLanguage();
            return require('./i18n').i18n();
        }

        function forceEnglishLanguage(){
            window.applicationLanguage = 'en';
        }

        function forceFrenchLanguage(){
            window.applicationLanguage = 'fr';
        }
    });
}());