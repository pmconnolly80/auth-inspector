/**
 * @file
 * Directive which displays additional remarks for the given method
 * and for the currently active auth provider.
 *
 * Use it on an HTML list:
 *
 *   <ul providers-remarks="getCurrentUser">
 *     ...
 *   </ul>
 */
(function () {
  'use strict';

  angular.module('auth-inspector.directives')

    .directive('providersRemarks', function (AuthProvidersManager) {
      return {
        restrict: 'A',
        link: function(scope, iElement, iAttrs) {
          var method = iAttrs.providersRemarks,
              providerInfo = AuthProvidersManager.getActiveInfo(),
              liElt;
          if (angular.isDefined(providerInfo.remarks[method]) && angular.isArray(providerInfo.remarks[method])) {
            var prefix;
            angular.forEach(providerInfo.remarks[method], function(remark) {
              liElt = angular.element('<li>').html(remark);
              iElement.append(liElt);
            });
          }
        }
      };
    });

})();
