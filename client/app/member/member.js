'use strict';

angular.module('calendarApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/member', {
        templateUrl: 'app/member/member.html',
        controller: 'MemberCtrl'
      });
  });
