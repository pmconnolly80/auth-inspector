/**
 * @file
 * Directives to include or exclude a DOM fragment
 * based on the currently active auth provider (use the provider's name, not the provider's service name).
 *
 * Use them on any HTML element:
 *
 *   <tr include="Google">
 *     ...
 *   </tr>
 */
(function () {
  'use strict';

  angular.module('auth-inspector.directives')

    .directive('include', function (AuthProvidersManager) {
      return {
        restrict: 'A',
        link: function(scope, iElement, iAttrs) {
          var includeStr     = iAttrs.include,
              includeList    = includeStr.split(','),
              activeProvider = AuthProvidersManager.getActiveName();
          // The element is removed if the active auth provider
          // doesn't match one of the items in the include list.
          if (includeList.indexOf(activeProvider) === -1) {
            iElement.remove();
          }
        }
      };
    })

    .directive('exclude', function (AuthProvidersManager) {
      return {
        restrict: 'A',
        link: function(scope, iElement, iAttrs) {
          var excludeStr     = iAttrs.exclude,
              excludeList    = excludeStr.split(','),
              activeProvider = AuthProvidersManager.getActiveName();
          // The element is removed if the active auth provider
          // matches one of the items in the exclude list.
          if (excludeList.indexOf(activeProvider) != -1) {
            iElement.remove();
          }
        }
      };
    });

})();
