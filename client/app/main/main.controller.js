'use strict';

angular.module('calendarApp')
  .controller('MainCtrl', ['$scope', '$http', 'remoteSocket', function ($scope, $http, remoteSocket) {
    $scope.src = '';
    remoteSocket.emit('take-picture');

    $scope.takePicture = function() {
      remoteSocket.emit('take-picture');
    };

    remoteSocket.on('picture', function(data) {
      $scope.src = 'data:image/jpg;base64,' + data;
    });

    //$scope.awesomeThings = [];

    //$http.get('/api/things').success(function(awesomeThings) {
    //  $scope.awesomeThings = awesomeThings;
    //  socket.syncUpdates('thing', $scope.awesomeThings);
    //});
    //
    //$scope.addThing = function() {
    //  if($scope.newThing === '') {
    //    return;
    //  }
    //  $http.post('/api/things', { name: $scope.newThing });
    //  $scope.newThing = '';
    //};
    //
    //$scope.deleteThing = function(thing) {
    //  $http.delete('/api/things/' + thing._id);
    //};
    //
    //$scope.$on('$destroy', function () {
    //  socket.unsyncUpdates('thing');
    //});
  }]);
