(function () {
  'use strict';

  angular.module('auth-inspector.providers')

    .service('AuthProvidersManager', function AuthProvidersCache($injector, $q, $timeout, $window, LmUtils, AuthResultsManager, ConfigManager) {
      var providers = {},  // Metadata about registered providers
          activeProvider,  // Instance of the currently active auth provider
          activeProviderName;

      return {
        register: register,
        getAll: getAll,
        activate: activate,
        reset: reset,
        getActive: getActive,
        getActiveName: getActiveName,
        getActiveInfo: getActiveInfo,
        callMethod: callMethod
      };

      /**
       * Auth providers should register themselves with the manager
       * during their run() phase.
       *
       * @param serviceName
       *   Name of the service for the auth provider, e.g. "AuthGoogle".
       */
      function register(serviceName) {
        if (serviceName && !providers[serviceName]) {
          providers[serviceName] = {
            activatedBefore: false
          };
        }
      }

      /**
       * Return all registered auth providers.
       *
       */
      function getAll() {
        return providers;
      }

      /**
       * Activate the given auth provider.
       *
       *   - Load the provider's JavaScript dependencies (if any).
       *   - Verify that the constants required by the provider have been defined (if any).
       *
       * Do not confuse "activating" and "initializing": initializing is done during AngularJS's
       * config() phase and we have no control over it: initializing happens as soon as the .js file
       * for a given auth provider is loaded.
       *
       * Once an auth provider is active, clicking the UI triggers the methods of this provider.
       *
       * @param name
       *   Name of the service for the auth provider, e.g. "AuthGoogle".
       *
       * @return
       *   A promise that will be resolved if & when the provider's dependencies are satisfied.
       */
      function activate(name) {
        var provider,       // Instantiated service representing the provider being activated
            providerMeta,   // Metadata about the provider being activated
            providerInfo,   // Info about the provider being activated (dependencies...)
            dependenciesLoaded = $q.when('No dependencies to load'),  // Will be overridden if there are dependencies
            dependenciesInitialized = $q.when('No dependencies to init'),
            constantsDefined = $q.when('No constants to verify');     // Will be overridden if there are constants

        if (!angular.isDefined(providers[name])) {
          return $q.reject('Provider "' + name + '" does not exist.');
        }

        // Retrieve more info about the requested provider and retrieve the corresponding instance.
        provider     = $injector.get(name);
        providerMeta = providers[name];
        providerInfo = provider.getInfo();

        // Do the heavy-lifting only if the provider has never been activated.
        if (!providerMeta.activatedBefore) {

          // Process dependencies (if any).
          if (providerInfo.dependencies) {
            loadDependencies(providerInfo.dependencies);
            // Promise resolved when dependencies are loaded.
            dependenciesLoaded = testDependenciesLoaded(providerInfo.dependencies);
          }
          // Process constants (if any).
          if (providerInfo.constants) {
            var missingConstants = [];
            angular.forEach(providerInfo.constants, function(constant) {
              try {
                ConfigManager.req(constant);
              }
              catch (e) {  // Custom error: {message: "Error message", configKey: "Missing config key"}
                missingConstants.push(e.configKey);
              }
            });
            if (missingConstants.length) {
              constantsDefined = $q.reject('Missing constants: ' + missingConstants.join(', '));
            }
          }
          // Process "loaded callbacks" (if any).
          // Some JS libraries (like Google's) invoke a callback once they have finished initializing.
          // Create a promise that will be resolved when this callback is called. Hackish...
          if (providerInfo.SDKLoadedCallback) {
            var depsInitDeferred = $q.defer();
            dependenciesInitialized = depsInitDeferred.promise;
            $window[providerInfo.SDKLoadedCallback] = function() {
              depsInitDeferred.resolve('The dependency of ' + name + ' has finished loading.');
              delete $window[providerInfo.SDKLoadedCallback];
            };
          }
        }

        // Create a new promise that will be resolved with the value of the provider instance
        // when all requirements are satisfied (makes it more convenient to use this function
        // in a route `resolve`).
        var deferred = $q.defer();
        $q.all([dependenciesLoaded, dependenciesInitialized, constantsDefined])
          .then(function() {  // This function receives the resolve values of the aggregated promises
            activeProvider = provider;
            activeProviderName = name;
            providers[name].activatedBefore = true;
            // Reset any previously recorded results.
            AuthResultsManager.reset();
            // Trigger initialization tasks defined by the provider.
            activeProvider.init();
            deferred.resolve(provider);
          }, function(error) {
            deferred.reject(error);
          });

        return deferred.promise;
      }

      function reset() {
        $timeout(function() {
          activeProvider = null;
          activeProviderName = null;
          AuthResultsManager.reset();
        });
      }

      /**
       * Return the instance of the currently active auth provider.
       *
       */
      function getActive() {
        return activeProvider;
      }

      /**
       * Return the name of the currently active auth provider.
       *
       */
      function getActiveName() {
        return activeProviderName;
      }

      /**
       * Proxy function to retrieve the info declared by the currently active auth provider.
       *
       */
      function getActiveInfo() {
        if (activeProvider) {
          return activeProvider.getInfo();
        }
      }

      /**
       * Call a method of the currently active auth provider.
       *
       * @param  method  Method to call
       */
      function callMethod(method) {
        if (activeProvider) {
          if (activeProvider.hasOwnProperty(method)) {
            return activeProvider[method].apply(null);
          }
          else {
            return 'METHOD_UNDEFINED';
          }
        }
      }

      /**
       * Load a list of dependencies by embedding <script> tags in the DOM.
       *
       */
      function loadDependencies(scripts) {
        angular.forEach(scripts, function(script) {
          LmUtils.addScript(script.id, script.src);
        });
      }

      /**
       * Test that dependencies (external scripts) are loaded
       * by testing that the global variable they're supposed to create exists.
       *
       * @return
       *   A promise that will be resolved when all dependencies are loaded.
       */
      function testDependenciesLoaded(scripts) {
        var depsLoaded = [];
        angular.forEach(scripts, function(script) {
          depsLoaded.push(LmUtils.globalVariableExists(script.globalVar));
        });
        return $q.all(depsLoaded);
      }

    });

})();
