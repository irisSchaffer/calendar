'use strict';

angular.module('calendarApp')
  .controller('NavbarCtrl', function ($scope, $location) {
    $scope.menu = [
      {
        'title': 'Configuration',
        'link': '/configuration'
      },
      {
        'title': 'Projects',
        'link': '/projects'
      },
      {
        'title': 'Members',
        'link': '/members'
      }
    ];

    $scope.isCollapsed = true;

    $scope.isActive = function(route) {
      return route === $location.path();
    };
  });
