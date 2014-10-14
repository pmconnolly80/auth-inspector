/**
 * @file
 * Misc utility functions.
 */
(function () {
  'use strict';

  angular.module('lm.utils', [])

    .service('LmUtils', function($window, $document, $q, $interval) {

      return {
        addScript: addScript,
        globalVariableExists: globalVariableExists
      };

      /**
       * Add a <script> tag to the current page
       * if it doesn't already exist.
       *
       * @param id
       *   HTML ID of the <script> tag.
       * @param src
       *   "src" attribute of the <script> tag.
       */
      function addScript(id, src) {
        var d = $document[0],
            s = 'script',
            js, fjs = d.getElementsByTagName(s)[0];
        if (!d.getElementById(id)) {
          js = d.createElement(s); js.id = id;
          js.src = src;
          fjs.parentNode.insertBefore(js, fjs);
        }
      }

      /**
       * Return a promise that will be resolved if the given variable
       * exists as $window.varName after `seconds` seconds have elapsed.
       *
       * The resolved promise receives the value of the global variable.
       *
       * Useful to test whether a library has loaded.
       */
      function globalVariableExists(varName, seconds) {
        seconds = seconds || 10;
        var checker,
            count = 0,
            interval = 200,  // milliseconds - how often to check
            numAttempts = (seconds*1000)/interval,
            deferred = $q.defer();
        checker = $interval(function() {
          if (count >= numAttempts) {
            deferred.reject('Could not find global variable ' + varName);
            $interval.cancel(checker);
          }
          if (angular.isDefined($window[varName])) {
            deferred.resolve($window[varName]);
            $interval.cancel(checker);
          }
          count++;
        }, interval);
        return deferred.promise;
      }

    });

})();
