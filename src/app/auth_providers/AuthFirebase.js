/**
 * Firebase authentication provider.
 * Uses Firebase JavaScript SDK.
 */
(function () {
  'use strict';

  angular.module('auth-inspector.providers')

    .constant('FIREBASE_PARENT_KEY', 'ng_auth_inspector')

    .constant('FIREBASE_USER_NAME', 'regular user')
    .constant('FIREBASE_USER_EMAIL', 'user@example.com')
    .constant('FIREBASE_USER_PWD', '123')

    .constant('FIREBASE_ADMIN_NAME', 'administrator')
    .constant('FIREBASE_ADMIN_EMAIL', 'admin@example.com')
    .constant('FIREBASE_ADMIN_PWD', 'secret')

    .run(function(AuthProvidersManager) {
      AuthProvidersManager.register('AuthFirebase');
    })

    .service('AuthFirebase', function($window, AuthResultsManager, ConfigManager,
      FIREBASE_PARENT_KEY, FIREBASE_USER_EMAIL, FIREBASE_USER_PWD, FIREBASE_ADMIN_EMAIL, FIREBASE_ADMIN_PWD) {

      var Firebase,
          FBURL = ConfigManager.get('FBURL'),
          ref,  // Reference to a specific Firebase instance (based on FBURL)
          dataRef;

      var info = {
        name: 'Firebase',
        dependencies: [
          {id: 'firebase-jssdk', src: 'https://cdn.firebase.com/js/client/1.1.1/firebase.js', globalVar: 'Firebase'}
        ],
        constants: ['FBURL'],
        intro: {
          whenToUse: ['To let your users authenticate with one of their existing social accounts. Firebase offers a unified API that integrates with many authentication providers: Email & Password, Google, Facebook, Twitter... <a href="https://www.firebase.com/docs/web/guide/user-auth.html#section-providers">View complete list</a>.',
            'To have fine-grained control over which users can access which data in your Firebase using <a href="https://www.firebase.com/docs/security/">security rules</a>.'],
          requirements: ['Create <strong>an account</strong> at <a href="https://www.firebase.com/">https://www.firebase.com/</a>.',
            'Create <strong> an app</strong> in your Firebase dashboard.',
            'In the <strong>Login & Auth</strong> section of the Firebase app you\'ve just created, enable the authentication provider that you wish to use (for example: "Email & Password", "Google"...). Note that some providers like Google or Facebook additionally require that you set up an app directly with them.'],
          inYourCode: ['Include the <a href="https://www.firebase.com/docs/web/guide/setup.html">Firebase JavaScript client library</a>.']
        },
        remarks: {
          init: ['Creates a reference to your Firebase:<br/><code>var ref = new Firebase("https://&lt;your-firebase&gt;.firebaseio.com");</code>'],
          monitorState: ['Uses <a href="https://www.firebase.com/docs/web/api/firebase/onAuth.html">ref.onAuth()</a>.'],
          loginEmailPwd: ['Login with "'+FIREBASE_USER_EMAIL+'" // "'+FIREBASE_USER_PWD+'" (correct email + correct password).'],
          loginWrongEmail: ['Login with an incorrect email and a correct password.'],
          loginWrongPwd: ['Login with a correct email and an incorrect password.'],
          logout: ['Session length can be configured in your app\'s dashboard on Firebase.com. The length of time you select will affect all methods of authentication offered by Firebase ("Email & Password", "Google", "Facebook"...).'],
          FirebaseQuery1: ['Queries the <code>series</code> branch in the current Firebase, which is <strong>publicly accessible</strong>. It doesn\'t matter whether the current user is authenticated or not, the value of this branch will always be returned.'],
          FirebaseQuery2: ['Queries the <code>tv_ratings</code> branch in the current Firebase, which is accessible to <strong>authenticated users only</strong>. You\'ll need to click the "loginEmailPwd" button before executing this method or an error will be returned.'],
          FirebaseQuery3: ['Queries the <code>credit_cards</code> branch in the current Firebase, which is accessible to <strong>administrators only</strong>. You need to click "loginEmailPwd" button to authenticate the current user before executing this method or an error will be returned. Note that Firebase doesn\'t have a concept of user roles such as admin and that it is left to the app developer to implement such a concept. In our case, we simply consider that a user whose email address contains "admin" is an administrator.']
        }
      };

      return {

        getInfo: function() {
          return info;
        },

        init: function() {
          Firebase = $window.Firebase;
          ref = new Firebase(FBURL);
          dataRef = ref.child(FIREBASE_PARENT_KEY);  // All of our data is stored under a unique key.
        },

        // Listen for changes in user authentication state.
        startMonitoring: function() {
          AuthResultsManager.set('monitorState', 'Started monitoring...');
          ref.onAuth(onAuthChange);
        },

        // Stop listening for changes in user authentication state.
        stopMonitoring: function() {
          AuthResultsManager.set('monitorState', 'Stopped monitoring...', '');
          ref.offAuth(onAuthChange);
        },

        getCurrentUser: function() {
          // Synchronously check authentication state.
          // If `authData` is null, then the user is not logged in.
          var authData = ref.getAuth();
          AuthResultsManager.set('getCurrentUser', authData);
          return authData;
        },

        loginEmailPwd: function() {
          setupFirebaseData();
          ref.authWithPassword({
            email: FIREBASE_USER_EMAIL,
            password: FIREBASE_USER_PWD
          }, function(error, authData) {
            if (error === null) {  // User authenticated with Firebase.
              AuthResultsManager.set('loginEmailPwd', authData);
            }
            else {
              getErrorCallback('loginEmailPwd')(error);
            }
          });
        },

        loginWrongEmail: function() {
          ref.authWithPassword({
            email: 'wrong_email@wrong.com',
            password: FIREBASE_USER_PWD
          }, function(error, authData) {
            if (error === null) {  // User authenticated with Firebase.
              AuthResultsManager.set('loginWrongEmail', authData);
            }
            else {
              getErrorCallback('loginWrongEmail')(error);
            }
          });
        },

        loginWrongPwd: function() {
          ref.authWithPassword({
            email: FIREBASE_USER_EMAIL,
            password: 'wrong_password'
          }, function(error, authData) {
            if (error === null) {  // User authenticated with Firebase.
              AuthResultsManager.set('loginWrongPwd', authData);
            }
            else {
              getErrorCallback('loginWrongPwd')(error);
            }
          });
        },

        loginEmailPwdAdmin: function() {
          ref.authWithPassword({
            email: FIREBASE_ADMIN_EMAIL,
            password: FIREBASE_ADMIN_PWD
          }, function(error, authData) {
            if (error === null) {  // User authenticated with Firebase.
              AuthResultsManager.set('loginEmailPwdAdmin', authData);
            }
            else {
              getErrorCallback('loginEmailPwdAdmin')(error);
            }
          });
        },

        logout: function() {
          // Invalidates the user's token and logs them out.
          ref.unauth();
          AuthResultsManager.set('logout', 'User logged out');
        },

        FirebaseQuery1: function() {
          dataRef.child('series').on('value', function (snapshot) {
            AuthResultsManager.set('FirebaseQuery1', snapshot.val());
          }, function (errorObject) {
            getErrorCallback('FirebaseQuery1')(errorObject);
          });
        },

        FirebaseQuery2: function() {
          dataRef.child('tv_ratings').on('value', function (snapshot) {
            AuthResultsManager.set('FirebaseQuery2', snapshot.val());
          }, function (errorObject) {
            getErrorCallback('FirebaseQuery2')(errorObject);
          });
        },

        FirebaseQuery3: function() {
          dataRef.child('credit_cards').on('value', function (snapshot) {
            AuthResultsManager.set('FirebaseQuery3', snapshot.val());
          }, function (errorObject) {
            getErrorCallback('FirebaseQuery3')(errorObject);
          });
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

      /**
       * Callback for when the authentication state changes.
       * `authData` will be null if the user is not authenticated.
       */
      function onAuthChange(authData) {
        // alert('FIREBASE: User authentication status just changed!');
        AuthResultsManager.set('monitorState', authData);
      }

      /**
       * Set up the current Firebase by adding some data and security rules.
       *
       * This function has already been called on the hosted version of AngularJS Auth Inspector
       * but you can call it manually on your local installation.
       */
      function setupFirebase() {
        setupFirebaseUsers();
        setupFirebaseData();
        setupFirebaseSecurityRules();
      }

      function setupFirebaseUsers() {
        ref.createUser({email: FIREBASE_USER_EMAIL, password: FIREBASE_USER_PWD}, function(error) {
          if (error) { console.error(error); }
        });
        ref.createUser({email: FIREBASE_ADMIN_EMAIL, password: FIREBASE_ADMIN_PWD}, function(error) {
          if (error) { console.error(error); }
        });
      }

      function setupFirebaseData() {
        var seriesRef = dataRef.child('series'),
            ratingsRef = dataRef.child('tv_ratings'),
            creditCardsRef = dataRef.child('credit_cards'),
            usersRef = dataRef.child('users');
        seriesRef.set({
          'the_good_wife': {
            title: "The Good Wife",
            starring: ["Julianna Margulies", "Chris Noth"]
          },
          'homeland': {
            title: "Homeland",
            starring: [" Claire Danes", "Mandy Patinkin"]
          }
        });
        ratingsRef.set({
          'the_good_wife': {
            rating: 13.12
          },
          'homeland': {
            rating: 1.95
          }
        });
        creditCardsRef.push({
          user: "bill",
          ccnumber: "4444555566667777"
        });
        creditCardsRef.push({
          user: "joe",
          ccnumber: "4444555566667777"
        });
        // HACKISH: we need a key to store the user's admin status
        // but we can't use the email address (because of the "@")
        // That's why we use auth.uid but it's hardcoded here...
        usersRef.child('simplelogin:3').set({is_admin: false});
        usersRef.child('simplelogin:4').set({is_admin: true});
      }

      /**
       * Firebase doesn't let you update security rules programmatically.
       * This function is just here for reference and does nothing.
       */
      function setupFirebaseSecurityRules() {
        return {
          "rules": {
            "foo": {
              // /foo/ is readable by the world
              ".read": true,

              // /foo/ is writable by the world
              ".write": true,

              // data written to /foo/ must be a string less than 100 characters
              ".validate": "newData.isString() && newData.val().length < 100"
            }
          }
        };
      }

      /**
       * Clean up the current Firebase by deleting our data and security rules.
       *
       * This function has already been called on the hosted version of AngularJS Auth Inspector
       * but you can call it manually on your local installation.
       */
      function cleanupFirebase() {
        // Delete data
        ref.child(FIREBASE_PARENT_KEY).set(null);
        // Delete users
        ref.removeUser({email: FIREBASE_USER_EMAIL, password: FIREBASE_USER_PWD}, function(error) {
          if (error) console.error(error);
        });
        ref.removeUser({email: FIREBASE_USER_EMAIL, password: FIREBASE_USER_PWD}, function(error) {
          if (error) console.error(error);
        });
      }

    });

})();
