(function () {
  'use strict';

  angular.module('auth-inspector.controllers')

    /**
     * Control the dashboard to call the different methods of the current auth provider
     * and inspect the results.
     *
     * @param authProvider
     *   Instance of the current auth provider, injected via a route `resolve`.
     */
    .controller('AuthProviderCtrl', function($scope, AuthProvidersManager, AuthResultsManager, authProvider) {

      // Get provider info.
      var providerInfo = authProvider.getInfo();
      $scope.providerInfo = providerInfo;

      /**
       * Return a CSS class to style the row for the method that was just called
       * depending on the result.
       */
      $scope.getClassForResult = function(resultKey) {
        var css = {success: 'alert-success', error: 'alert-danger'}, // Map of result statuses ==> CSS classes.
            result = AuthResultsManager.get(resultKey),
            cssClass = result && css[result.status] ? css[result.status] : '';
        return cssClass;
      };

      // Automatically call some methods in the auth provider
      // (everything should be ready at this point)
      AuthResultsManager.set('monitorState', AuthProvidersManager.callMethod('startMonitoring'));
      AuthProvidersManager.callMethod('getCurrentUser');
    });

})();
