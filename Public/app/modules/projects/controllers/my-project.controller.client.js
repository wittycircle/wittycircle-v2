(function () {

    'use strict';


    angular
    .module('wittyProjectModule')
    .controller('MyProjectCtrl', MyProjectCtrl);

    MyProjectCtrl.$inject = ['$rootScope', 'Beauty_encode', '$state', '$location', '$http'];
    function MyProjectCtrl ($rootScope, Beauty_encode, $state, $location, $http) {

        var currentUser = $rootScope.globals.currentUser || null;

        if (currentUser) {

        var vm = this;

        // vars
        vm.backPic = $rootScope.globals.currentUser.profile_cover;

        // functions linked to html
        vm.encodeUrl = encodeUrl;
        vm.goToStart = goToStart;

        function encodeUrl (url) {
            url = Beauty_encode.encodeUrl(url);
            return url;
        }

        function goToStart() {
            $state.go('main', {tagStart: true});
        };

        function getMyProject() {
            $http.get('/projects/user/' + currentUser.id).success(function(res) {
                vm.myprojects = res;
            });

            $http.get('/follow/projects/'+ currentUser.username).success(function(res) {
                vm.projectFollowed = res;
            });

            $http.get('/history/project/'+ currentUser.id).success(function(res) {
                vm.project_history = res;
            });
        };
        getMyProject();

        } else {
            if($location.path() === "/my-projects") {
                $location.path('/login').replace();
            }
        }


    }

})();
