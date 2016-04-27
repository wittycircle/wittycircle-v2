'use strict';

/**
 * @ngdoc function
 * @name wittyApp.controller:SkillsModalCtrl
 * @description
 * # SkillsModalCtrl
 * Controller of the wittyApp
 */
angular.module('wittyApp').controller('SkillsModalCtrl', function ($modalInstance, $http, $scope) {

    /*** Skills ***/

    $scope.saveText     = "Save";

    $http.get('/skills').success(function(res) {
        $scope.cSkills              = res.skills;
    });

    $scope.getSkill     = function(skill) {
      var object = {
        skill_id    : skill.id,
        skill_name  : skill.name,
      };
      $http.post('/skills/add', object).success(function(res) {
        if (res.success)
          $scope.profileVm.getProfileSkill();
      });
    };

    $scope.removeSkill  = function(index) {
      $http.delete('/skills/delete/' + index.skill_id).success(function(res) {
        if (res.success)
          $scope.profileVm.getProfileSkill();
      });
    };

    $scope.saveSkill    = function() {
        $scope.saveText = "Saved";
        setTimeout(function(){
            $modalInstance.dismiss();
        }, 500);
    };

    $scope.dismiss      = function () {
      $modalInstance.dismiss();
    };
    //   function shuffle(array) {
    //     var counter = array.length, temp, index;

    //     // While there are elements in the array
    //     while (counter > 0) {
    //         // Pick a random index
    //         index = Math.floor(Math.random() * counter);

    //         // Decrease counter by 1
    //         counter--;

    //         // And swap the last element with it
    //         temp = array[counter];
    //         array[counter] = array[index];
    //         array[index] = temp;
    //     }
    //     return array;
    // }

    // function getMaxTab(tab, tabret, n, category) {
    //   if (n > 0) {
    //     tab = tab.filter(function (el) {
    //         return el.category == category
    //     });
    //     var res = Math.max.apply(Math,tab.map(function(o){return o.priority;}))
    //     var obj = tab.find(function(o){ return o.priority == res; })
    //     tabret.push(obj);
    //     var removeIndex = tab.map(function(item) { return item.id; }).indexOf(obj.id);
    //     tab.splice(removeIndex, 1);
    //     n = n - 1;
    //     getMaxTab(tab, tabret, n, category);
    //   }
    //   return tabret;
    // };

    // $scope.getMostfashionSkills = function () {
    //   var tabret1 = [];
    //   var tabret2 = [];
    //   var tabret3 = [];
    //   var tabret4 = [];
    //   var tabret5 = [];
    //   var tabret6 = [];
    //   var tabret7 = [];
    //   var tabret8 = [];

    //   $scope.skills = Skills.getSkills().then(function(response) {
    //     $scope.skills = response;
    //       var mostfashionskilltab1 = getMaxTab($scope.skills, tabret1, 5, "sales & marketing");
    //       var mostfashionskilltab2 = getMaxTab($scope.skills, tabret2, 4, "finance & management");
    //       var mostfashionskilltab3 = getMaxTab($scope.skills, tabret3, 3, "legal");
    //       var mostfashionskilltab4 = getMaxTab($scope.skills, tabret4, 5, "manufacture & engineering");
    //       var mostfashionskilltab5 = getMaxTab($scope.skills, tabret5, 3, "admin support");
    //       var mostfashionskilltab6 = getMaxTab($scope.skills, tabret6, 8, "it web & mobile");
    //       var mostfashionskilltab7 = getMaxTab($scope.skills, tabret7, 8, "design & multimedia");
    //       var mostfashionskilltab8 = getMaxTab($scope.skills, tabret8, 4, "writing and languages");

    //       $scope.mostskills = shuffle(mostfashionskilltab1.concat(mostfashionskilltab2, mostfashionskilltab3, mostfashionskilltab4, mostfashionskilltab5,
    //       mostfashionskilltab6, mostfashionskilltab7, mostfashionskilltab8));
    //       //console.log(concattab);
    //   });
    // };

    // $scope.userSkills = Skills.getUserSkills($rootScope.globals.currentUser.id).then(function(response) {
    //   $scope.userSkills = response;
    // });

    // $scope.detectchange = function () {
    //   console.log($scope.searchText.length);
    //   if ($scope.searchText == 0) {
    //     $scope.mostskills = $scope.mostskills;
    //     var ret = "ok";
    //   }
    //   if ($scope.searchText != 0) {
    //     $scope.mostskills = $scope.skills;
    //   }
    // };

});
