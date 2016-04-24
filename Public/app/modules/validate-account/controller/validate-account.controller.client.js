(function () {

  'use strict';


  angular
    .module('wittyValidateAccountModule')
    .controller('ValidateAccountCtrl', ValidateAccountCtrl);

    ValidateAccountCtrl.$inject = ['$rootScope', 'Beauty_encode', '$state', 'valid', '$http', '$stateParams'];
    function ValidateAccountCtrl ($rootScope, Beauty_encode, $state, valid, $http, $stateParams) {

      var vm = this;

      console.log(valid);

      sendValidation();

      function sendValidation () {
          var data = {};
          data.email = valid.data.user_email;
          $http.post('/user/valid/' + $stateParams.token, data).then(function (response) {
              console.log(response);
          });
      }

    }

})();
