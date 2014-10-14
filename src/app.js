/**
 * @file
 * Main App
 *
 * The point of this app is mostly to declare `auth-inspector`
 * as a dependency and to declare various constants that will
 * be used by the authentication providers.
 */
(function () {

  angular.module('app', ['auth-inspector'])

    .controller('AppCtrl', function($scope, $rootScope, $location, AuthProvidersManager) {
      // Any route change should reset the error.
      $rootScope.$on('$routeChangeStart', function () {
        $scope.hideError();
      });
      $rootScope.$on('$routeChangeError', function (event, current, previous, rejection) {
        $rootScope.error = rejection;
      });
      $scope.goHome = function() {
        $location.path('/home');
        AuthProvidersManager.reset();
      };
      $scope.hideError = function() {
        $rootScope.error = null;
      };
    });

})();
