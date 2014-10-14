/**
 * @file
 * Directive to display the results of a method call.
 */
(function () {
  'use strict';

  angular.module('auth-inspector.directives')

    .directive('showResult', function($filter, AuthResultsManager) {
      return {
        template: '<textarea class="form-control textarea-results" rows="8" ng-model="result"></textarea><div ng-bind-html="htmlSnippet" ng-if="htmlSnippet"></div>',
        restrict: 'E',
        scope: {
          // The key used to store the result is the method name.
          'resultKey': '@method'
        },
        link: function(scope) {
          var filterJSON = $filter('json');
          scope.$watch(function() {
            return AuthResultsManager.get(scope.resultKey);
          }, function(newResult) {
            if (newResult) {
              scope.result = angular.isString(newResult.data) ? newResult.data : filterJSON(newResult.data);
              scope.htmlSnippet = angular.isDefined(newResult.htmlSnippet) ? newResult.htmlSnippet : '';
            }
            else {  // Results have just been reset.
              scope.result = undefined;
              scope.htmlSnippet = undefined;
            }
          });
        }
      };
    });

})();
