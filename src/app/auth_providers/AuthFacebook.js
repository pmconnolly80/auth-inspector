/*global _*/
/**
 * Facebook authentication provider.
 *
 * Uses Facebook JavaScript SDK.
 * @see https://developers.facebook.com/docs/javascript
 */
(function () {
  'use strict';

  angular.module('auth-inspector.providers')

    // Facebook Authorization Scopes
    // @see https://developers.facebook.com/docs/facebook-login/permissions
    .constant('FB_SCOPE_PUBLIC_PROFILE', 'public_profile')
    .constant('FB_SCOPE_PUBLISH_ACTIONS', 'publish_actions')

    .constant('FB_STATUS_MESSAGE', 'Having fun with AngularJS Auth Inspector!')

    .run(function(AuthProvidersManager) {
      AuthProvidersManager.register('AuthFacebook');
    })

    .service('AuthFacebook', function($window, $q, AuthResultsManager, ConfigManager,
      FB_SCOPE_PUBLIC_PROFILE, FB_SCOPE_PUBLISH_ACTIONS, FB_STATUS_MESSAGE) {

      var FB,  // Facebook JavaScript SDK
          FB_APP_ID = ConfigManager.get('FB_APP_ID'),
          userScopes = [];  // List of scopes granted to our app by the current user

      var info = {
        name: 'Facebook',
        dependencies: [
          {id: 'facebook-jssdk', src: '//connect.facebook.net/en_US/sdk.js', globalVar: 'FB'}
        ],
        // Indicates that the JS dependency will invoke a callback once it's ready.
        SDKLoadedCallback: 'fbAsyncInit',
        constants: ['FB_APP_ID'],
        intro: {
          whenToUse: ['To let your users authenticate with their Facebook account.',
            'To let your users access and modify their private data on Facebook.'],
          requirements: ['Create an <strong>app</strong> on <a href="https://developers.facebook.com/apps/">Facebook App Dashboard</a> and make note of its <strong>App ID</strong>.',
            'The Facebook JavaScript SDK uses a <code>scope</code> parameter with the <code>FB.login</code> function call to define the level of access that your application needs. For example, the <code>email</code> scope provides access to the person\'s primary email address on Facebook. The default scope is <code>' + FB_SCOPE_PUBLIC_PROFILE + '</code>. Make sure that you log in your users with the proper scope for what you\'re trying to accomplish. See <a href="https://developers.facebook.com/docs/facebook-login/permissions">Facebook documentation on Permissions</a>.'],
          inYourCode: ['Include the <a href="https://developers.facebook.com/docs/javascript">Facebook JavaScript SDK</a> to authenticate your users with their Facebook account.']
        },
        remarks: {
          init: ['Initializes Facebook JavaScript SDK:<br/><code>FB.init(...);</code>'],
          monitorState: ['Uses <code>FB.Event.subscribe("auth.statusChange", callback);</code>.'],
          getCurrentUser: ['Uses <code>FB.getLoginStatus()</code>.'],
          loginOAuth: ['Uses <code>FB.login()</code> with "' + FB_SCOPE_PUBLIC_PROFILE + '" as the <code>scope</code> parameter.'],
          logout: ['Uses <code>FB.logout()</code>.',
            '<span class="alert-danger">WARNING: This method will also log the current user out of Facebook.</span>',
            'Additionally, users may revoke previously granted permissions (to your app and others) by visiting the <a href="https://www.facebook.com/settings?tab=applications">"Apps" section</a> in their Facebook settings.'],
          FBUserProfile: ['Gets the basic Facebook profile of the currently logged in user.',
            'Uses <code>FB.api("/me")</code>.'],
          FBPostStatus: ['Brutally tries to post a status message to the current user\'s feed without checking whether the current user has granted the <code>' + FB_SCOPE_PUBLISH_ACTIONS + '</code> permission to our app. The message reads: "' + FB_STATUS_MESSAGE + '".',
            'Click the <code>FBRequestPerm()</code> button below to request the <code>' + FB_SCOPE_PUBLISH_ACTIONS + '</code> permission from the current user.'],
          FBRequestPerm: ['Request the <code>' + FB_SCOPE_PUBLISH_ACTIONS + '</code> permission from the current user, but only if that permission hasn\'t been granted already.',
            'If you\'re running Auth Inspector locally, include your Facebook App ID in config.js.'],
        }
      };

      return {

        getInfo: function() {
          return info;
        },

        init: function() {
          FB = $window.FB;
          FB.init({
            appId      : FB_APP_ID,
            cookie     : true,   // enable cookies to allow the server to access the session
            xfbml      : false,  // do not parse social plugins on this page
            version    : 'v2.1'
          });
        },

        getCurrentUser: function() {
          FB.getLoginStatus(function(response) {
            handleResponse(response, 'getCurrentUser');
            getUserPermissions();
          });
        },

        startMonitoring: function() {
          FB.Event.subscribe('auth.authResponseChange', statusChangeCallback);
          FB.Event.subscribe('auth.statusChange', statusChangeCallback);
        },

        stopMonitoring: function() {
          FB.Event.unsubscribe('auth.authResponseChange', statusChangeCallback);
          FB.Event.unsubscribe('auth.statusChange', statusChangeCallback);
        },

        loginOAuth: function() {
          FB.login(function(response) {
            handleResponse(response, 'loginOAuth');
            getUserPermissions();
          }, {
            scope: FB_SCOPE_PUBLIC_PROFILE,
            return_scopes: true
          });
        },

        logout: function() {
          FB.logout(function(response) {
            handleResponse(response, 'logout');
          });
        },

        FBUserProfile: function() {
          FB.api('/me', function(response) {
            if (!response || response.error) {
              AuthResultsManager.set('FBUserProfile', response, 'error');
            }
            else {
              var htmlSnippet = '<h2>Your name is: ' + response.name + '</h2>';
              AuthResultsManager.set('FBUserProfile', response, 'success', htmlSnippet);
            }
          });
        },

        /**
         * "Brutally" tries to post to the current user's feed without checking for permissions.
         */
        FBPostStatus: function() {
          FB.api('/me/feed', 'post', { message: FB_STATUS_MESSAGE }, function(response) {
            handleResponse(response, 'FBPostStatus');
          });
        },

        /**
         * Request a permission from the current user only
         * if it hasn't been already granted.
         */
        FBRequestPerm: function() {
          if (userScopes.indexOf(FB_SCOPE_PUBLISH_ACTIONS) === -1) {
            FB.login(function(response) {
              handleResponse(response, 'FBRequestPerm');
              getUserPermissions();
            }, {
              scope: FB_SCOPE_PUBLISH_ACTIONS,
              return_scopes: true
            });
          }
          else {
            AuthResultsManager.set('FBRequestPerm', 'Permission has already been granted.');
          }
        },

      };

      /**
       * Helper function to process a response from the Facebook API.
       *
       * The Facebook API always sends only one response object, but the object contents
       * change depending on whether the request was successful or not.
       */
      function handleResponse(response, resultKey) {
        if (!response || response.error) {
          AuthResultsManager.set(resultKey, response, 'error');
        }
        else {
          AuthResultsManager.set(resultKey, response);
        }
      }

      /**
       * Helper function that retrieves the current user's permissions.
       *
       * Since this function is asynchronous, it should be called upfront (when user auth changes),
       * NOT at the time permissions are required.
       */
      function getUserPermissions() {
        FB.api('/me/permissions', function(response) {
          if (!response || response.error) {
            console.error(response);
          }
          else {
            userScopes = [];
            var data = response.data;
            // Store permissions in a private variable that other methods can access.
            _.each(data, function(permObj) {
              if (permObj.status == 'granted') { userScopes.push(permObj.permission); }
            });
          }
        });
      }

      /**
       * Callback for when the current user's authentication status changes.
       */
      function statusChangeCallback(response) {
        // alert('FACEBOOK: User authentication status just changed!');
        AuthResultsManager.set('monitorState', response);
      }

    });

})();
