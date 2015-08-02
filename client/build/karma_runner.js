(function () {
    "use strict";

    var childProcess = require("child_process");
    var readline = require('readline');

    exports.runTests = function (grunt, testCompleteCallback) {
        var karmaProcess = childProcess.spawn(
            "sh", [
				"-c",
				"node_modules/karma/bin/karma run build/karma.conf.js"
            ]);

        monitorOutputForTestFailures(karmaProcess, grunt, testCompleteCallback);
    };

    function monitorOutputForTestFailures(karmaProcess, grunt, testCompleteCallback) {
        var success = true;
        var resultCount = 0;

        onEachBrowserResult(karmaProcess, grunt, function (result) {
            resultCount += 1;

            if (result.type !== 'success') {
                success = false;
            }

            if (result.testRan === 0) {
                success = false;
            }
        });

        karmaProcess.on('exit', function (exitCode) {
            if (exitCode !== 0) {
                success = false;
            }

            if (resultCount === 0) {
                success = false;
            }

            outputAdditionalInfo(resultCount, grunt);
            completeTaskWithResults(success, testCompleteCallback);
        });
    }

    function outputAdditionalInfo(resultCount, grunt) {
        if (resultCount === 0) {
            grunt.log.writeln('');
            grunt.log.error('No tests were executed'.red);
        }
    }

    function completeTaskWithResults(success, testCompleteCallback) {
        if (success) {
            testCompleteCallback();
        } else {
            testCompleteCallback(false);
        }
    }

    function onEachBrowserResult(testProcess, grunt, resultCallback) {
        var karmaReader = readline.createInterface({
            input: testProcess.stdout,
            output: testProcess.stdin
        });

        karmaReader.on('line', function (line) {
            grunt.log.writeln(line);

            var browserResult = tryParseBrowserResults(line);

            if (browserResult) {
                resultCallback(browserResult);
            }
        });
    }

    function tryParseBrowserResults(line) {
        var successResult = tryParseSuccessLine(line);
        if (successResult) {
            return successResult;
        }

        var failureResult = tryParseFailureLine(line);
        if (failureResult) {
            return failureResult;
        }

        var errorResult = tryParseErrorLine(line);
        if (errorResult) {
            return errorResult;
        }

        return null;
    }

    function tryParseSuccessLine(line) {
        var successResult = /Executed ([0-9]+) of ([0-9]+).*SUCCESS/.exec(line);

        if (successResult) {
            return {
                type: 'success',
                testRan: parseInt(successResult[1], 10),
                testTotal: parseInt(successResult[2], 10),
                testFailed: 0
            };
        }

        return null;
    }

    function tryParseFailureLine(line) {
        var failureResult = /Executed ([0-9]+) of ([0-9]+).*([0-9]+) FAILED/.exec(line);

        if (failureResult) {
            return {
                type: 'failure',
                testRan: parseInt(failureResult[1], 10),
                testTotal: parseInt(failureResult[2], 10),
                testFailed: parseInt(failureResult[3], 10)
            };
        }

        return null;
    }

    function tryParseErrorLine(line) {
        var errorResult = /Executed.*ERROR/.exec(line);

        if (errorResult) {
            return {
                type: 'error',
                testRan: 0,
                testTotal: 0,
                testFailed: 0
            };
        }

        return null;
    }
}());
