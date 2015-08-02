(function() {
	"use strict";
	
	var childProcess = require('child_process');
	var readline = require('readline');
	
	exports.launchServiceProcess = function (configuration, done) {
		var serviceProcess = launchProcess(configuration);
		
		serviceProcess.on('error', function (error) {
			console.log(error);
		});
		
		registerCleanupOnExit(configuration.name, serviceProcess);
        ensureServiceReadyToOperate(serviceProcess, configuration, done);
	};
	
	function launchProcess(configuration) {
		return childProcess.spawn(
            configuration.executable,
            configuration.arguments,
            {
                env: configuration.env
            });
	}
	
	function registerCleanupOnExit(serviceName, serviceProcess) {
        process.on("exit", function () {
            console.log("Stopping background service: " + serviceName);
            serviceProcess.kill();
        });
    }
	
	function ensureServiceReadyToOperate(serviceProcess, configuration, serviceReadyCallback) {
        var serviceReady = false;
        var serviceName = configuration.name;

        serviceProcess.on('exit', function (code) {
            if (serviceReady) {
                console.log("Process " + serviceName + " exited");
            } else {
                serviceReady = true;
                serviceReadyCallback(new Error("Process " + serviceName + " exited with code " + code));
            }
        });

        onEachLogMessage(serviceProcess, function (logMessage) {
            if (shouldLogMessages(logMessage)) {
                console.log(logMessage);
            }

            if (!serviceReady && announcingServiceReady(logMessage, configuration)) {
                serviceReady = true;
                serviceReadyCallback();
            }
        });

        ensureFailOnTimeout(serviceProcess, checkStarted, serviceReadyCallback);

        function checkStarted() {
            return serviceReady;
        }

        function shouldLogMessages(logMessage) {
            if (!serviceReady) {
                return true;
            }

            if (configuration.alwaysLog) {
                return true;
            }

            if (logMessage.match(/(ERROR)|(WARN)/)) {
                return true;
            }

            return false;
        }
    }

    function ensureFailOnTimeout(serviceProcess, checkStarted, serviceReadyCallback) {
        var maxStartupTimeMs = 60 * 1000;

        setTimeout(function () {
            if (!checkStarted()) {
                serviceProcess.kill();

                console.log("Service timed out during startup");
                serviceReadyCallback(false);
            }
        }, maxStartupTimeMs);
    }

    function onEachLogMessage(serviceProcess, lineCallback) {
        var lineReader = readline.createInterface({
            input: serviceProcess.stdout,
            output: serviceProcess.stdin
        });

        lineReader.on('line', lineCallback);
    }
	
	function announcingServiceReady(logMessage, configuration) {
        return configuration.readyPattern.test(logMessage);
    }
}());
