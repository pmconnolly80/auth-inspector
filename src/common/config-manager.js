/**
 * @file
 * Service to manage configuration variables for an AngularJS app.
 *
 *   - Look for config variables in constants.
 *   - Returns a default value or throws an error when the constant is not defined.
 *   - Etc.
 */
(function () {
  'use strict';

  angular.module('config-manager', [])

    .service('ConfigManager', function($injector) {
      var cache = {};  // store previously accessed config variables

      return {
        get: get,
        req: req
      };

      /**
       * Return a constant's value, or `defaut` if it's not defined.
       *
       * @param key
       *   Constant name.
       * @param defaut
       *   Constant default value. DO NOT USE "default" (with an "L") as it is a reserved JavaScript word.
       */
      function get(key, defaut) {
        if (!angular.isDefined(cache[key])) {
          var value = $injector.has(key) ? $injector.get(key) : defaut;
          cache[key] = value;
        }
        return cache[key];
      }

      /**
       * Require that a constant is defined
       * by throwing an error if it's not.
       *
       * @return
       *   The constant's value.
       */
      function req(key) {
        if (!angular.isDefined(cache[key])) {
          if (!$injector.has(key)) {
            throw {message: 'Config key "' + key + '" not defined', configKey: key};
          }
          var value = $injector.get(key);
          cache[key] = value;
        }
        return cache[key];
      }

    });

})();
