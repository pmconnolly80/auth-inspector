/**
 * @file
 * Config variables for auth-inspector.
 */
(function () {
  'use strict';

  angular.module('auth-inspector')

    //
    // Google ("ng-workshop" project)
    //

    // Copy YOUR OAuth 2.0 client ID here (create it in your Google Developers Console).
    .constant('GAPI_CLIENT_ID', '178943113374-d5f5mska0vvb956jb1e8sstf8dgqbqrh.apps.googleusercontent.com')

    //
    // Facebook ("ng-wo­r­k­s­h­o­p­.com" app)
    //

    // Copy YOUR Facebook app ID here (create it in your Facebook apps dashboard).
    .constant('FB_APP_ID', '1478618349057538')

    //
    // Firebase
    //

    // Copy the URL of YOUR Firebase here
    .constant('FBURL', 'https://ngwrkshop.firebaseio.com');


})();
