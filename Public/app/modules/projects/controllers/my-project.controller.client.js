(function () {

    'use strict';


    angular
    .module('wittyProjectModule')
    .controller('MyProjectCtrl', MyProjectCtrl);

    MyProjectCtrl.$inject = ['$rootScope', 'Beauty_encode', '$state', 'myProject_Resolve', 'myProjectFollowed_Resolve', 'myProjectHistory_Resolve'];
    function MyProjectCtrl ($rootScope, Beauty_encode, $state, myProject_Resolve, myProjectFollowed_Resolve, myProjectHistory_Resolve) {

        var vm = this;

        // vars
        vm.backPic = $rootScope.globals.currentUser.profile_cover;

        // functions linked to html
        vm.encodeUrl = encodeUrl;
        vm.goToStart = goToStart;

        getMyProject();
        getProjectFollowed();
        getProjectHistory();

        function encodeUrl (url) {
            url = Beauty_encode.encodeUrl(url);
            return url;
        }

        function goToStart () {
            $state.go('main', {tagStart: true});
        };

        function getMyProject () {
            if (myProject_Resolve.status === 200) {
                vm.myprojects = myProject_Resolve.data;
            } else {
                vm.myprojects = false;
            }
        }

        // TODO:20 getProjectFollowed not returning user from back
        function getProjectFollowed () {
            if (myProjectFollowed_Resolve.status === 200) {
                if (myProjectFollowed_Resolve.data.data && myProjectFollowed_Resolve.data.data.length === 0) {
                    vm.projectFollowed = false;
                } else {
                    vm.projectFollowed = myProjectFollowed_Resolve.data;
                }
            } else {
                vm.projectFollowed = false;
            }
        }

        function getProjectHistory () {
            if (myProjectHistory_Resolve.status === 200) {
                vm.project_history = myProjectHistory_Resolve.data;
            } else {
                vm.project_history = false;
            }
        }



    }

})();
