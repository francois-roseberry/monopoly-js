(function () {
    'use strict';
    var frenchString = require('./i18n.fr');
    var englishString = require('./i18n.en');

    var ENGLISH_INDICATOR = 'en';
    var FRENCH_INDICATOR = 'fr';

    var navigatorLanguageTag = navigator.language || navigator.userLanguage;
    setApplicationLanguage(navigatorLanguageTag.toLowerCase());

    exports.i18n = function () {
        var currentLanguage = null;

        if (navigatorIsEnglish()) {
            currentLanguage = englishString;
        }
        else if (navigatorIsFrench()) {
            currentLanguage = frenchString;
        } else {
            //Default
            currentLanguage = englishString;
        }
        return currentLanguage;
    };

    function navigatorIsFrench() {
        return window.applicationLanguage.indexOf(FRENCH_INDICATOR) > -1;
    }

    function navigatorIsEnglish() {
        return window.applicationLanguage.indexOf(ENGLISH_INDICATOR) > -1;
    }

    function setApplicationLanguage(applicationLanguage){
        window.applicationLanguage = applicationLanguage;
    }
}());