'use strict';

angular.module('calendarApp')
  .controller('ProjectCtrl', ['$scope', '$http', function ($scope, $http) {

    $scope.members = {};
    $scope.member = {};
    $scope.errors = {};
    $scope.submitted = {};
    $scope.alerts = [];

    $http.get('/api/member').success(function (members) {
      $scope.members = members;
    });

    // Create new member
    $scope.create = function (form) {
      $scope.alerts = [];
      $scope.newSubmitted = true;

      if (form.$valid) {
        $http.post('/api/member', $scope.member)
          .success(function (member) {
            $scope.alerts.push({'type': 'success', 'heading': 'Great', 'msg': 'Member `' + member.name + '` was added successfully.'});
            $scope.members.push($scope.member);
            $scope.member = {};
          })
          .error(function (data) {
            handleErrors(form, form.$name, data);
          });
      }
    };

    // Update existing member
    $scope.update = function (index) {
      $scope.alerts = [];
      $scope.submitted[index] = true;

      var form = this['form' + index];
      var project = $scope.members[index];

      if (form.$valid) {
        $http.put('/api/member/' + member._id, member)
          .success(function (member) {
            $scope.alerts.push({'type': 'success', 'heading': 'Yippie', 'msg': 'Member `' + member.name + '` was updated successfully.'});
          })
          .error(function (data) {
            handleErrors(form, index, data);
          });
      }
    };

    // Delete member
    $scope.delete = function (index) {
      $scope.alerts = [];
      var member = $scope.members[index];

      $http.delete('/api/member/' + member._id)
        .success(function() {
          $scope.members.splice(index, index + 1);
          $scope.alerts.push({'type': 'success', 'heading': 'Yeah', 'msg': 'Member `' + member.name + '` was successfully deleted.'});
        })
        .error(function(data) {
          $scope.alerts.push({'type': 'danger', 'heading': 'Oops', 'msg': 'Member `' + member.name + '` couldn\'t be removed. Try again later!'});
        });
    };

    // handles form errors
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
