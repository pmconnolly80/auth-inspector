/**
 * @file
 * Service used by auth providers methods like login(), logout()...
 * to publish their results in a consistent way.
 *
 * The UI will then use that service to display the results in the page.
 */
(function () {
  'use strict';

  angular.module('auth-inspector.providers')

    .service('AuthResultsManager', function($timeout) {
      var data = {};

      return {
        get: get,
        set: set,
        reset: reset
      };

      function get(key) {
        return angular.isDefined(data[key]) ? data[key] : undefined;
      }

      /**
       * Store a result in the results cache under the given `key`.
       *
       * @param status
       *   The type of outcome: 'success' (default), 'error', or '' (empty string == neutral)
       * @param htmlSnippet
       *   HTML snippet to display next to a result.
       */
      function set(key, value, status, htmlSnippet) {
        status = typeof status === 'undefined' ? 'success' : status;
        // $timeout will invoke fn within the $apply block.
        $timeout(function() {
          data[key] = {
            data: value,
            status: status,
            htmlSnippet: htmlSnippet
          };
        });
      }

      function reset() {
        $timeout(function() {
          data = {};
        });
      }

    });

})();
