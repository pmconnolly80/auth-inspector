/**
 * @file
 * Directive to trigger calling a method of the currently active auth provider
 * and to publish the result under the right result key.
 *
 * Use it on a button:
 *
 *   <button call-method="getCurrentUser"></button>
 */
(function () {
  'use strict';

  angular.module('auth-inspector.directives')

    .directive('callMethod', function (AuthProvidersManager, AuthResultsManager) {
      return {
        restrict: 'A',
        link: function(scope, iElement, iAttrs) {
          var method    = iAttrs.callMethod,
              resultKey = iAttrs.resultKey || method,
              btnText   = method + '()';

          // Style the button
          iElement.text(btnText).addClass('btn btn-primary');

          // Call the method when button is clicked.
          iElement.on('click', function(e) {
            AuthResultsManager.set(resultKey, 'PROCESSING...', '');
            var ret = AuthProvidersManager.callMethod(method);
            if (ret === 'METHOD_UNDEFINED') {
              AuthResultsManager.set(resultKey, 'ERROR: ' + method + '() undefined for ' + AuthProvidersManager.getActiveName(), 'error');
            }
            e.preventDefault();
          });
        }
      };
    });

})();
