/**
 * @file
 * Entry point for auth-inspector app.
 * Loads all the required dependencies and sets up the routes.
 */
(function () {
  'use strict';

  angular.module('auth-inspector',
    ['ngRoute',
     'ngSanitize',

     'auth-inspector.controllers',
     'auth-inspector.directives',
     'auth-inspector.providers',

     'lm.utils',
     'config-manager'])

    .config(function($routeProvider) {
      $routeProvider
        .when('/home', {
          templateUrl: 'app/partials/home.tpl.html'
        })
        .when('/p/:provider', {
          templateUrl: 'app/partials/provider.tpl.html',
          controller: 'AuthProviderCtrl',
          resolve: {
            authProvider: function($route, AuthProvidersManager) {
              return AuthProvidersManager.activate($route.current.params.provider);
            }
          }
        })
        .otherwise({redirectTo: '/home'});
    });

})();
