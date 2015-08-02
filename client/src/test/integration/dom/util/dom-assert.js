(function () {
    'use strict';

    var precondition = require('./contract').precondition;

    exports.addAssertions = function (context) {
        _.extend(context, assertionsOn(function () {
            // The rootElement will be reset between each run
            return context.rootElement;
        }));

        _.extend(context.body, assertionsOn(function () {
            return $(document.body);
        }));
    };

    function checkIsSelector(selector) {
        precondition(_.isString(selector), "Selector must be a string");
    }

    function assertionsOn(rootElement) {
        if (!_.isFunction(rootElement)) {
            // May happen during karma initialisation, so we log a descriptive error message, because karma won't
            console.log("Error: Cannot initiate assertions because the dom root element is not set!");
            throw new Error("Assertion must be done on an element!");
        }

        return {
            clickOn: function (selector, allowMany) {
                checkIsSelector(selector);

                var element = rootElement().find(selector);

                if (!allowMany && element.length !== 1) {
                    throw new Error("Can only click on a single element, but " +
                        element.length +
                        " found");
                }

                if (!element.is(":visible")) {
                    throw new Error("Cannot click on the element, because it is not visible");
                }

                element.click();
            },

            d3: d3Actions(),

            assertOneOf: function (selector) {
                checkIsSelector(selector);

                var elementCount = rootElement().find(selector).length;

                if (elementCount === 0) {
                    throw new Error("Can't find any DOM element with selector '" + selector + "'");
                }

                if (elementCount > 1) {
                    throw new Error(
                        "Found " + elementCount +
                        " elements with selector '" + selector +
                        "', expected unique");
                }
            },

            assertNothingOf: function (selector) {
                checkIsSelector(selector);

                var elementCount = rootElement().find(selector).length;

                if (elementCount !== 0) {
                    throw new Error(
                        "Found " + elementCount + " elements with selector '" + selector + "' but none should exists");
                }
            },

            assertElementCount: function (selector, expectedCount) {
                checkIsSelector(selector);

                var elementCount = rootElement().find(selector).length;

                if (elementCount !== expectedCount) {
                    throw new Error("Didn't find " + expectedCount +
                        " DOM elements with selector '" + selector + "', " + elementCount + " found instead");
                }
            },

            assertVisible: function (selector) {
                checkIsSelector(selector);

                if (!isVisible(rootElement(), selector)) {
                    throw new Error("Element " + selector + " is not visible as expected");
                }
            },

            assertHidden: function (selector) {
                checkIsSelector(selector);

                if (isVisible(rootElement(), selector)) {
                    throw new Error("Element " + selector + " is visible while it should be hidden");
                }
            },

            assertText: function (selector, textContent) {
                checkIsSelector(selector);

                var actualText = rootElement().find(selector).text();

                if (actualText !== textContent) {
                    throw new Error("Element " + selector + " should contains text [" +
                        textContent + "] but instead contains [" + actualText + "]");
                }
            },

            assertTextIsPresent: function (selector, textContent) {
                checkIsSelector(selector);

                var actualText = rootElement().find(selector).html();

                if (actualText.indexOf(textContent) === -1) {
                    throw new Error("Element " + selector + " should contains text [" +
                        textContent + "] but it was not found in [" + actualText + "]");
                }
            },

            assertCssClass: function (selector, cssClass) {
                checkIsSelector(selector);

                var element = rootElement().find(selector);

                if (!element.hasClass(cssClass)) {
                    throw new Error("Element " + selector +
                        " do not contains expected css class '" + cssClass + "'");
                }
            },

            assertAbsentCssClass: function (selector, cssClass) {
                checkIsSelector(selector);

                var element = rootElement().find(selector);

                if (element.hasClass(cssClass)) {
                    throw new Error("Element " + selector +
                        " contains unwanted css class '" + cssClass + "'");
                }
            },

            assertSelectionContainsAttributeValues: function (selector, attribute, expectedValues) {
                checkIsSelector(selector);

                var foundValues = _.map(rootElement().find(selector), function (item) {
                    return $(item).attr(attribute);
                });

                expectedValues.forEach(function (value) {
                    if (!_.contains(foundValues, value)) {
                        throw new Error("No element with selector " + selector +
                            " has attribute " + attribute + "=" + value);
                    }
                });
            },

            assertSelectionHasTextValuesInOrder: function (selector, expectedValues) {
                checkIsSelector(selector);

                var foundValues = _.map(rootElement().find(selector), function (item) {
                    return $(item).text();
                });

                if (foundValues.length !== expectedValues.length) {
                    throw new Error("Not enough elements with selector " + selector +
                        ", found " + foundValues.length + ", expected " + expectedValues.length);
                }

                _.each(expectedValues, function (value, index) {
                    if (value !== foundValues[index]) {
                        throw new Error("Element [" + index + "] with selector " + selector +
                            " was expected to have its text attribute with value " + value +
                            ", instead its value was " + foundValues[index]);
                    }
                });
            },

            assertSelectionIsDisabled: function (selector) {
                checkIsSelector(selector);

                if (!isDisabled(rootElement(), selector)) {
                    throw new Error('Found an element with selector ' + selector + ' which is not disabled');
                }
            },

            assertSelectionIsNotDisabled: function (selector) {
                checkIsSelector(selector);

                if (isDisabled(rootElement(), selector)) {
                    throw new Error('Found an element with selector ' + selector + ' which is disabled');
                }
            }
        };
    }

    function isDisabled(element, selector) {
        checkIsSelector(selector);

        return element.find(selector).is(':disabled');
    }

    function isVisible(element, selector) {
        checkIsSelector(selector);

        return element.find(selector).is(":visible");
    }

    function d3Actions() {
        return {
            clickOn: function (selector) {
                d3Trigger(selector, "click");
            },

            hoverOn: function (selector) {
                d3Trigger(selector, "mouseover");
            },

            hoverOff: function (selector) {
                d3Trigger(selector, "mouseout");
            }
        };
    }

    function d3Trigger(selector, eventName) {
        checkIsSelector(selector);

        var elements = d3.selectAll(selector)[0];
        var event = document.createEvent("MouseEvent");
        event.initMouseEvent(eventName, true, true);
        _.each(elements, function (element) {
            element.dispatchEvent(event);
        });
    }
}());