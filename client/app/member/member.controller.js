'use strict';

angular.module('calendarApp')
  .controller('MemberCtrl', ['$scope', '$window', '$routeParams', '$location', '$http', '$q', function ($scope, $window, $routeParams, $location, $http, $q) {

    $scope.members = [];
    $scope.member = {};
    $scope.errors = {};
    $scope.submitted = {};
    $scope.alerts = [];

    $http.get('/api/members').success(function (members) {
      angular.forEach(members, function (member, key) {
        $scope.members.push(member);
      });
    });

    if ($routeParams.success !== undefined) {
      if(JSON.parse($routeParams.success) === true) {
        $scope.alerts.push({'type': 'success', 'heading': 'Yippie', 'msg': 'Member `' + $routeParams.name + '` was authenticated and saved successfully.'});
      } else {
        $scope.member.name = $routeParams.name;
        $scope.alerts.push({'type': 'danger', 'heading': 'Oops', 'msg': 'Something went wrong and we couldn\'t save member `' + $scope.member.name + '`. Please try again later.'});
      }
      $location.search({});
    }

    // Create new member
    $scope.auth = function (form) {
      $window.location.href = '/api/auth?name=' + JSON.stringify($scope.member.name);
    };

    // Drag and Drop Listener
    $scope.dragControlListeners = {
      accept: function (sourceItemHandleScope, destSortableScope) { return true; },
      orderChanged: function(event) {
        var promise = updateSequence(event);

        promise.then(function(data) {
          $scope.alerts.push({'type': 'success', 'heading': 'Yaay', 'msg': 'Sequence was updated successfully.'});
        }, function(data) {
          $scope.alerts.push({'type': 'danger', 'heading': 'Oops', 'msg': 'Couldn\'t change sequence, please try again later!'});
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
        $http.put('/api/members/' + member._id, member)
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

      $http.delete('/api/members/' + member._id)
        .success(function() {
          $scope.members.splice(index, 1);
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


    // Updates order of members and saves their new positions
    function updateSequence(event) {
      var src = event.source.index;
      var dest = event.dest.index;
      var moved = $scope.members[src];

      var i = src;
      while(i != dest) {
        var incr = (dest > src ? +1 : -1);

        var member = $scope.members[i];
        member.position = i + 1;
        i += incr;

      }
      $scope.members[dest].position = dest + 1;

      var promises = [];

      angular.forEach($scope.members, function(member) {
        var deferred = $q.defer();
        promises.push(deferred.promise);

        $http.put('/api/members/' + member._id, member)
          .success(function() {
            deferred.resolve();
          })
          .error(function (data) {
            deferred.reject(data);
          });
      });

      return $q.all(promises);
    };
  }]);
