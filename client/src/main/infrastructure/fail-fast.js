(function () {
    'use strict';

    exports.crashOnUnhandledException = function () {
        // Fail-fast if an unhandled exception occur
        window.onerror = function (message, file, line, column, error) {
            var stackTrace = error && error.stack;
            showError(message, stackTrace);
        };
    };

    exports.crashOnResourceLoadingError = function () {
        var useCapturingEvent = true;

        // Fail-fast if an external resource fail to load
        document.addEventListener('error', function (event) {
            var failedUrl = event.srcElement.src;
            var context = event.srcElement.parentNode.outerHTML;

            showError("Failed to load resource at url: " + failedUrl, context);
        }, useCapturingEvent);
    };

    function showError(message, stackTrace) {
        if (window.isDisplayingError) {
            return;
        }

        // Created with strings so that error in templating won't prevent the error message to show
        $(document.body).html(
            '<h1 style="color: red; padding: 20px 40px; margin 0">The application crashed</h1>' +
            '<p style="padding:5px 40px;"><strong>' + message + '</strong></p>');

        if (stackTrace) {
            var stackContainer = $('<pre style="padding:20px 20px; margin: 0 40px"></pre>');
            $(document.body).append(stackContainer);
            stackContainer.text(stackTrace);

        }

        $(document.body).append(
            '<p style="padding:20px 40px;">' +
            '   <a href="javascript:location.reload();">Refresh the page to continue</a>' +
            '</p>');

        window.isDisplayingError = true;
    }
}());