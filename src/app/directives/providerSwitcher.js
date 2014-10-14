/**
 * @file
 * Directive displaying a dropdown to switch between registered auth providers.
 *
 * Place this directive within a Bootstrap navbar.
 */
(function () {
  'use strict';

  angular.module('auth-inspector.directives')

    .directive('providerSwitcher', function (AuthProvidersManager) {
      return {
        templateUrl: 'app/directives/providerSwitcher.tpl.html',
        restrict: 'E',
        scope: {},
        link: function(scope) {
          scope.providers = AuthProvidersManager.getAll();
          // Watch provider changes (note: we could also watch route changes)
          scope.$watch(function() {
            return AuthProvidersManager.getActiveName();
          }, function (newProvider) {
            if (newProvider) {
              scope.activeProvider = newProvider;
            }
            else {   // Maybe the provider has just been reset, or the $watch is being init'ed
              scope.activeProvider = '...Select an auth provider...';
            }
          });
        }
      };
    });

})();
