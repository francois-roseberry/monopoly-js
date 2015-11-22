(function() {
	"use strict";

	exports.taskStopCorrectly = function (task, observableList) {
		exports.taskStopCorrectlyOnEvent(task, observableList, function () {
			task.stop();
		});
	};
	
	exports.taskStopCorrectlyOnEvent = function (task, observableList, stopEvent) {
		var observableCompleted = false;
		var completedNotification = false;

		Rx.Observable.merge(observableList)
			.subscribeOnCompleted(function () {
				observableCompleted = true;
			});

		task.completed().subscribe(function () {
			completedNotification = true;
		});

		stopEvent();

		if (!completedNotification) {
			throw new Error('No completed event was sent when the task was stopped');
		}

		if (!observableCompleted) {
			throw new Error('Some observable did not complete when the task stopped');
		}
	};
}());