'use strict';

/**
 * @ngdoc function
 * @name wittyApp.controller:AddQuestionProjectCtrl
 * @description
 * # AddQuestionProjectCtrl
 * Controller of the wittyApp
 */
angular.module('wittyApp').controller('AddNeedsProjectCtrl', function (Picture, $stateParams, Categories, Public_id, Feedbacks, $q, $scope, $rootScope, $state, $http, Upload, Data_project, Users, $modalInstance) {

  /*****-- DATA --*****/
  $http.get('/skills').success(function(res) {
    $scope.skills = res.skills;
  });

  $scope.helps = ['Teammate', 'Mentor', 'Tips', 'Any help'];
  $scope.cProject = 'All Projects';
  $scope.cHelp = 'Any help';
  $scope.limit = 6;
  $scope.openings_description = "";

  $http.get('/projects').success(function (response) {
    $scope.cards = response;
  });
  Categories.getCategories(function (response) {
    $scope.categories = response;
    if ($stateParams.tagParams) {
      $scope.searchCtg = $stateParams.tagParams;
      $scope.ctgName = $stateParams.tagParams;
    }
    else
      $scope.ctgName = "Arts";
  });

  $scope.$on("$destroy", function(){
    $scope.skills = 0;
  });

  

  /*****-- FUNCTION --*****/

  $scope.displayProjects = function(data) {
    if (data > 6) {
      $scope.allowExpand = true;
    } else {
      $scope.allowExpand = false;
      $scope.limit = 6;
    }
  }
  /*** get project name ***/

  $scope.getProject = function (pName) {
    $scope.cProject = pName;
  };

  /*** get category name ***/
  $scope.getCategory = function (cName) {
    $scope.ctgName = cName;
    $scope.searchCtg = cName;
    console.log("OK");
  };

  /*** get help name ***/
  $scope.getHelp = function(hName) {
    if (hName === "Any help" || hName === "Teammate" || hName === "Mentor" || hName === "Tips") {
      document.getElementById('dstext').style.display = "inline-block";
      /*setTimeout(function() {
        document.getElementById('dsdrop1').style.display = "inline-block";
      }, 400);*/
    } else {
      document.getElementById('dstext').style.display = "none";
      document.getElementById('dsdrop1').style.display = "none";
    }
    $scope.cHelp = hName;
  };

  /*** expand project list ***/
  $scope.expand = function(limit) {
    if ($scope.allowExpand) {
      $scope.limit += 6;
    }
  }

  $scope.skillList = [];
  $scope.count = -1;
  /*** add skill to search ***/
  $scope.searchSkill = function(name) {
    $scope.skillName = [];
    if (document.getElementById('labelNoText')) {
      document.getElementById('labelNoText').id = "labelText";
      document.getElementById('labelNoText2').id = "labelText2";
      document.getElementById('labelText').style.display = "block";
      document.getElementById('labelText2').style.color = "#ddd";
    }
    document.getElementById('dsabox1').style.display = "none";
    document.getElementById('dsabox2').style.display = "none";

    if ($scope.skillList.length < 5) {
      if ($scope.skillList.length == 0) {
        $scope.skillList.push({sName: name});
        document.getElementById('input-dsa').style.display = "none";

      }
      else {
        for(var i = 0; i < $scope.skillList.length; i++) {
          if ($scope.skillList[i].sName === name)
            break;
        }
        if (i == $scope.skillList.length) {
          $scope.skillList.push({sName: name});
          document.getElementById('input-dsa').style.display = "none";
        }
      }
    }
    if ($scope.skillList.length === 5)
      $scope.fullList = true;
  }

  /*** remove skill added ***/
  $scope.removeSkill = function(name) {

    var x = document.getElementsByClassName('discover-skill-list');
    var index;

    for (var i = 0; i < $scope.skillList.length; i++) {
      if ($scope.skillList[i].sName === name) {
        x[i].className = "discover-skill-list animated fadeOut";
        index = i;
        break ;
      }
    }
    if (index >= 0)
      $scope.skillList.splice(index, 1);
    if ($scope.skillList.length < 5)
      $scope.fullList = false;
  }

  $scope.dismiss = function() {
    $rootScope.need = null;
    $modalInstance.dismiss();
  };

  function transformSkill() {
    var str = "";
    var tags = [];
    var a = 0;
    var ret = [];

    Object.keys($scope.skillList).forEach(function (key) {
      if (a == 1) {
        tags.push($scope.skillList[key].sName);
      }
      if (a == 0) {
        str = $scope.skillList[key].sName;
        a = 1;
      }
    });
    ret[0] = str;
    if (tags.length == 0) {
      ret[1] = false;
    } else {
      ret[1] = tags;
    }
    return ret;
  }

  function getSkillList(skill, tags) {
    var tabret = [];

    if (skill) {
      var a = {sName: skill};
      tabret.push(a);
    }
    if (tags && tags != 0) {
      for (var i = 0; i < tags.length; i++) {
        var b = {sName: tags[i]};
        tabret.push(b);
      }
    }
    return tabret;
  };

  function getDataforUpdate() {
    if ($rootScope.need) {
      $scope.cHelp = $rootScope.need.status;
      if ($rootScope.need.description) {
        $scope.openings_description = $rootScope.need.description;
      }
      $scope.skillList = getSkillList($rootScope.need.skill, $rootScope.need.taggs)
    }
  }; getDataforUpdate();

  $scope.needs = {};

  $scope.addNeeds = function(desc, skill, help) {
    if (desc) {
      $scope.needs.description = desc;
    }
    $scope.needs.project_id = $scope.project.id;
    $scope.needs.status = $scope.cHelp;
    if ($scope.project.picture) {
	$scope.needs.picture = Picture.resizePicture($scope.project.picture, 200, 200, "fill");
    } else {
	$scope.needs.picture = Picture.resizePicture("https://res.cloudinary.com/dqpkpmrgk/image/upload/v1456744591/no-bg_k0b9ob.jpg", 200, 200, "fill");
    }
    $scope.needs.skill = transformSkill()[0];
    $scope.needs.taggs = JSON.stringify(transformSkill()[1]);
    if (JSON.stringify(transformSkill()[1]) == 'false') {
      $scope.needs.taggs = false;
    }
    $http.post('/openings', $scope.needs).success(function(response) {
      if (response.serverStatus == 2) {
        $scope.needs.taggs = transformSkill()[1];
        if (JSON.stringify(transformSkill()[1]) == 'false') {
          $scope.needs.taggs = false;
        }
        $scope.needs.id = response.insertId;
        $scope.openings.push($scope.needs);
        $scope.dismiss();
      }
    });
  }

  $scope.updateNeeds = function(desc, skill, help) {
    if (desc) {
      $scope.needs.description = desc;
    }
    $scope.needs.project_id = $scope.project.id;
    $scope.needs.status = $scope.cHelp;
    //$scope.needs.picture = Picture.resizePicture($scope.project.picture, 300, 200, "fill");//$scope.project.picture;
    $scope.needs.skill = transformSkill()[0];
    $scope.needs.taggs = JSON.stringify(transformSkill()[1]);
    if (JSON.stringify(transformSkill()[1]) == 'false') {
      $scope.needs.taggs = false;
    }
    $http.put('/opening/' + $rootScope.need.id, $scope.needs).success(function(response) {
      if (response.serverStatus == 2) {
        $scope.needs.taggs = transformSkill()[1];
        if (JSON.stringify(transformSkill()[1]) == 'false') {
          $scope.needs.taggs = false;
        }
        $scope.needs.id = response.insertId;
        $scope.openings[$rootScope.need.index] = $scope.needs;
        $scope.dismiss();
      }
    });
  }


});
