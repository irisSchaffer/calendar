'use strict';

angular.module('calendarApp')
  .controller('ProjectCtrl', ['$scope', '$http', function ($scope, $http) {

    $scope.projects = {};
    $scope.project = {};
    $scope.errors = {};
    $scope.submitted = {};
    $scope.alerts = [];

    $http.get('/api/projects').success(function (projects) {
      $scope.projects = projects;
    });

    // Create new Project
    $scope.create = function (form) {
      $scope.alerts = [];
      $scope.newSubmitted = true;

      if (form.$valid) {
        $http.post('/api/projects', $scope.project)
          .success(function (project) {
            $scope.alerts.push({'type': 'success', 'heading': 'Great', 'msg': 'Project `' + project.name + '` was added successfully.'});
            $scope.projects.push($scope.project);
            $scope.project = {};
          })
          .error(function (data) {
            handleErrors(form, form.$name, data);
          });
      }
    };

    // Update existing project
    $scope.update = function (index) {
      $scope.alerts = [];
      $scope.submitted[index] = true;

      var form = this['form' + index];
      var project = $scope.projects[index];

      if (form.$valid) {
        $http.put('/api/projects/' + project._id, project)
          .success(function (project) {
            $scope.alerts.push({'type': 'success', 'heading': 'Yippie', 'msg': 'Project `' + project.name + '` was updated successfully.'});
          })
          .error(function (data) {
            handleErrors(form, index, data);
          });
      }
    };

    $scope.delete = function (index) {
      $scope.alerts = [];
      var project = $scope.projects[index];

      $http.delete('/api/projects/' + project._id)
        .success(function() {
          $scope.projects.splice(index, index);
          $scope.alerts.push({'type': 'success', 'heading': 'Yeah', 'msg': 'Project `' + project.name + '` was successfully deleted.'});
        })
        .error(function(data) {
          $scope.alerts.push({'type': 'danger', 'heading': 'Oops', 'msg': 'Project `' + project.name + '` couldn\'t be removed. Try again later!'});
        });
    };

    function handleErrors(form, formIdentifier, data) {
      $scope.errors = {};
      $scope.errors[formIdentifier] = [];

      // Update validity of form fields that match the mongoose errors
      angular.forEach(data.errors, function (error, field) {
        form[field].$setValidity('mongoose', false);
        $scope.errors[formIdentifier][field] = error.message;
      });
    }
  }]);
