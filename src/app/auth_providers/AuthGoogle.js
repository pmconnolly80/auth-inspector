/*global _*/
/**
 * Google authentication provider.
 *
 * Uses Google JavaScript client library.
 * @see https://developers.google.com/api-client-library/javascript/
 */
(function () {
  'use strict';

  angular.module('auth-inspector.providers')

    // Google Authorization Scopes
    // @see https://developers.google.com/+/api/oauth#login-scopes
    .constant('GAPI_CLIENT_SCOPE_BASIC_PROFILE', 'profile')
    .constant('GAPI_CLIENT_SCOPE_GPLUS_PROFILE', 'https://www.googleapis.com/auth/plus.login')
    .constant('GAPI_CLIENT_SCOPE_GMAIL_READONLY', 'https://www.googleapis.com/auth/gmail.readonly')

    .run(function(AuthProvidersManager) {
      AuthProvidersManager.register('AuthGoogle');
    })

    .service('AuthGoogle', function($window, AuthResultsManager, ConfigManager, GAPI_CLIENT_SCOPE_BASIC_PROFILE, GAPI_CLIENT_SCOPE_GPLUS_PROFILE, GAPI_CLIENT_SCOPE_GMAIL_READONLY) {

      var gapi,  // Google JavaScript SDK
          GAPI_CLIENT_ID = ConfigManager.get('GAPI_CLIENT_ID'),
          SDKLoadedCallback = 'handleClientLoad';

      var info = {
        name: 'Google',
        dependencies: [
          {id: 'google-jssdk', src: 'https://apis.google.com/js/client.js?onload=' + SDKLoadedCallback, globalVar: 'gapi'}
        ],
        // Callback that will be invoked once the SDK has finished loading.
        SDKLoadedCallback: SDKLoadedCallback,
        constants: ['GAPI_CLIENT_ID'],
        intro: {
          whenToUse: ['To let your users authenticate with their Gmail account.',
            'To let your users access and modify their private data in a Google app (e.g. their Google docs, their Google contacts...).'],
          requirements: ['Create a <strong>project</strong> in <a href="https://console.developers.google.com">Google Developers Console</a>, THEN...',
            '... if you don\'t need to access private user data, create an <strong>API Key</strong>.',
            '... if you DO need to access private user data, create an <strong>OAuth 2.0 client ID</strong>.'],
          inYourCode: ['Include the <a href="https://developers.google.com/api-client-library/javascript/">Google JavaScript client library</a> that will help you authenticate your users with their Google account and make requests to various Google APIs.',
            'If you\'re installing Auth Inspector locally, copy the OAuth Client ID of your project in <code>src/app/config.js</code> (<code>GAPI_CLIENT_ID</code> constant).',
            '<strong>Scopes.</strong> Google APIs require that you use a <code>scope</code> parameter during your access-token request to define the level of access to a particular API that your application needs. For example, the following scope lets your application access the Google+ profile of the currently logged-in user: <code>https://www.googleapis.com/auth/plus.me</code>. This one lets your application read all resources and their metadata in the Gmail account of the currently logged-in user but forbids all write operations: <code>https://www.googleapis.com/auth/gmail.readonly</code>. And so on.<br/>Google recommends that you <strong>request scopes incrementally</strong>, at the time access is required, rather than up front. For example, an app that wants to support purchases should not request Google Wallet access until the user presses the "Buy" button.',
            'Lastly, if you need to use a specific Google API (e.g. <a href="https://developers.google.com/+/api/">Google+</a>, <a href="https://developers.google.com/gmail/api/">Gmail</a>...), you should load the client library interface to that API.<br/>Example for the Google+ API: <code>gapi.client.load(\'plus\', \'v1\')</code>',]
        },
        remarks: {
          init: ['[Optional] Sets up the API Key if the data you\'ll access is not private user data:<br/><code>gapi.client.setApiKey(apiKey);</code><br/>Otherwise you\'ll just pass your Client ID when calling <code>gapi.auth.authorize()</code>.'],
          getCurrentUser: ['Uses <code>gapi.auth.authorize()</code> with <code>immediate: true</code> and <code>scope: ' + GAPI_CLIENT_SCOPE_BASIC_PROFILE + '</code>.'],
          loginOAuth: ['Uses <code>gapi.auth.authorize()</code> with <code>immediate: false</code> and <code>scope: ' + GAPI_CLIENT_SCOPE_BASIC_PROFILE + '</code>.',
            'For information about available login scopes, see <a href="https://developers.google.com/+/api/oauth#login-scopes">Login scopes</a>. To see the available scopes for all Google APIs, visit the <a href="https://developers.google.com/apis-explorer/">APIs Explorer</a>.'],
          logout: ['Google controls the expiration of the access token that is obtained when authenticating the user with the JavaScript client library.',
            'Additionally, users may revoke permissions they have previously granted to third-party apps like yours by visiting their <a href="https://www.google.com/settings/security">Google Account Security</a> page.'],
          GooglePlusProfile: ['Attempts to authorize the current user with the <code>' + GAPI_CLIENT_SCOPE_GPLUS_PROFILE + '</code> scope (your browser might trigger a popup or a redirect). IN YOUR APP: you can skip this step if your user is already authenticated and authorized for that scope.',
            'If authorization is successful, loads the JS client library interface to the <strong>Google+ API</strong> (<code>gapi.client.load(\'plus\', \'v1\')</code>) and requests the Google+ profile of the current user.'],
          GmailMessageList: ['Attempts to authorize the current user with the <code>' + GAPI_CLIENT_SCOPE_GMAIL_READONLY + '</code> scope (your browser might trigger a popup or a redirect). IN YOUR APP: you can skip this step if your user is already authenticated and authorized for that scope.',
            'If authorization is successful, loads the JS client library interface to the <strong>Gmail API</strong> (<code>gapi.client.load(\'gmail\', \'v1\')</code>) and requests 10 messages in the current user\'s mailbox.']
        }
      };

      return {

        getInfo: function() {
          return info;
        },

        init: function() {
          gapi = $window.gapi;
        },

        getCurrentUser: function() {
          // Authorize using "immediate mode", which means that the token is refreshed
          // behind the scenes, and no UI is shown to the user.
          // Alt method: gapi.auth.checkSessionState() but it requires to pass the client_id and the session_state.
          gapi.auth.authorize({client_id: GAPI_CLIENT_ID, scope: GAPI_CLIENT_SCOPE_BASIC_PROFILE, immediate: true}, handleAuthResult);
          // Authentication callback (called whether auth succeeded or failed).
          function handleAuthResult(authResult) {
            if (authResult && !authResult.error)
              AuthResultsManager.set('getCurrentUser', authResult);
            else
              AuthResultsManager.set('getCurrentUser', authResult, 'error');
          }
        },

        loginOAuth: function() {
          gapi.auth.authorize({client_id: GAPI_CLIENT_ID, scope: GAPI_CLIENT_SCOPE_BASIC_PROFILE, immediate: false}, handleAuthResult);
          // Authentication callback (called whether auth succeeded or failed).
          function handleAuthResult(authResult) {
            if (authResult && !authResult.error)
              AuthResultsManager.set('loginOAuth', authResult);
            else
              AuthResultsManager.set('loginOAuth', authResult, 'error');
          }
        },

        logout: function() {
          gapi.auth.setToken('toto');
          AuthResultsManager.set('logout', "The Google JavaScript client library doesn't provide a method for logging out users.\n\nGoogle doesn't recommend it as it would log users out of all the Google services they might currently be using (e.g. Gmail...).\n\nYou could, however, update a flag internal to your application if you need to react to the user logging out (in order to update the UI, for instance).");
        },

        GooglePlusProfile: function() {
          gapi.auth.authorize({client_id: GAPI_CLIENT_ID, scope: GAPI_CLIENT_SCOPE_GPLUS_PROFILE, immediate: false}, handleAuthResult);
          // Authentication callback (called whether auth succeeded or failed).
          function handleAuthResult(authResult) {
            if (authResult && !authResult.error) {
              // Loads the client library interface to the Google+ API.
              AuthResultsManager.set('GooglePlusProfile', 'Loading Google+ API...');
              gapi.client.load('plus', 'v1').then(function() {
                getUserProfile('me').then(function(resp) {
                  var profile = resp.result,
                      htmlSnippet = '<h4>' + profile.displayName + '</h4><img src=" ' + profile.image.url + '" />';
                  AuthResultsManager.set('GooglePlusProfile', profile, 'success', htmlSnippet);
                }, getErrorCallback('GooglePlusProfile'));
              }, getErrorCallback('GooglePlusProfile'));
            }
            else {
              getErrorCallback('GooglePlusProfile')(authResult);
            }
          }
        },

        GmailMessageList: function() {
          gapi.auth.authorize({client_id: GAPI_CLIENT_ID, scope: GAPI_CLIENT_SCOPE_GMAIL_READONLY, immediate: false}, handleAuthResult);

          // Authentication callback (called whether auth succeeded or failed).
          function handleAuthResult(authResult) {
            if (authResult && !authResult.error) {
              // Loads the client library interface to the Gmail API.
              AuthResultsManager.set('GmailMessageList', 'Loading Gmail API...');
              gapi.client.load('gmail', 'v1').then(function() {
                getMessageList('me', 10).then(function(resp) {
                  var batch = gapi.client.newBatch(),  // Batch requests for individual messages
                      messageIds = _.pluck(resp.result.messages, 'id');
                  _.each(messageIds, function(messageId) {
                    batch.add(getMessage('me', messageId));
                  });
                  // Process messages when they've all been received.
                  batch.then(function(respMsgs) {
                    var messages = [];  // Processed messages
                    var headz = _.map(respMsgs.result, function(respMsg) { return respMsg.result.payload.headers; });
                    var subject, from;
                    // Parse the email headers of each message.
                    _.each(headz, function(headers) {
                      subject = _.find(headers, function(header) { return (header.name == 'Subject'); }).value;
                      from = _.find(headers, function(header) { return (header.name == 'From'); }).value;
                      messages.push({subject: subject, from: from});
                    });
                    var htmlSnippet = formatHtmlList(messages, 'subject');
                    AuthResultsManager.set('GmailMessageList', respMsgs.result, 'success', htmlSnippet);
                  }, getErrorCallback('GmailMessageList'));
                }, getErrorCallback('GmailMessageList'));
              }, getErrorCallback('GmailMessageList'));
            }
            else {
              getErrorCallback('GmailMessageList')(authResult);
            }
          }

        }

      };

      /**
       * Return an error callback that can be called directly or used in promises.
       */
      function getErrorCallback(resultKey) {
        return function(error) {
          AuthResultsManager.set(resultKey, error, 'error');
        };
      }

      // Get a user's profile using Google+ API.
      function getUserProfile(userId) {
        return gapi.client.plus.people.get({
          'userId': userId
        });
      }

      // Get a user's messages using Gmail API.
      function getMessageList(userId, maxResults) {
        return gapi.client.gmail.users.messages.list({
          'userId': userId,
          'maxResults': maxResults
        });
      }

      // Get the contents of a specific message using Gmail API.
      function getMessage(userId, messageId) {
        return gapi.client.gmail.users.messages.get({
          'userId': userId,
          'id': messageId
        });
      }

      /**
       * Helper function to format an HTML list by iterating over an array
       * and using a specific property of each array member for the list item.
       */
      function formatHtmlList(arr, key) {
        var html = '<ul>';
        _.each(arr, function(item) {
          if (angular.isDefined(item[key])) {
            html += '<li>' + item[key] + '</li>';
          }
        });
        html += '</ul>';
        return html;
      }

    });

})();
