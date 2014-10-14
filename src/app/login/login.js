(function () {
  'use strict';

  angular.module('security.login', [])

    // Helper service to show/hide the login form
    // In a real application, you would use a dialog, but we're trying to keep things simple.
    .service('LoginDialog', function() {
      var visible = false;
      return {
        open: function() {
          visible = true;
        },
        close: function() {
          visible = false;
        },
        isOpen: function() {
          return visible;
        }
      };
    })

    // The loginToolbar directive is a reusable widget that can show login or logout buttons
    // and information the current authenticated user
    .directive('loginToolbar', function(security) {
      var directive = {
        templateUrl: 'auth/login-toolbar.tpl.html',
        restrict: 'E',
        scope: true,
        link: function($scope) {  // , $element, $attrs, $controller
          $scope.isAuthenticated = security.isAuthenticated;
          $scope.login = security.showLogin;
          $scope.logout = security.logout;
          $scope.$watch(function() {
            return security.currentUser;
          }, function(currentUser) {
            $scope.currentUser = currentUser;
          });
        }
      };
      return directive;
    })

    // The LoginFormController provides the behaviour behind a reusable form to allow users to authenticate.
    // This controller and its template (login/form.tpl.html) are used in a modal dialog box by the security service.
    .controller('LoginFormController', function($scope, security, LoginDialog) {
      // The model for this form
      $scope.user = {};

      // Any error message from failing to login
      $scope.authError = null;

      // Attempt to authenticate the user specified in the form's model
      $scope.login = function(email, password) {
        // Clear any previous security errors
        $scope.authError = null;

        // Try to login
        security.login(email, password).then(function(loggedIn) {
          if ( !loggedIn ) {
            // If we get here then the login failed due to bad credentials
            $scope.authError = 'Login failed. Please check your credentials and try again.';
          }
        }, function(x) {
          // If we get here then there was a problem with the login request to the server
          $scope.authError = 'There was a problem with authenticating: ' + x;
        });
      };

      $scope.cancelLogin = function() {
        security.cancelLogin();
      };

      $scope.isLoginDialogOpen = function() {
        return LoginDialog.isOpen();
      };
    });

})();
