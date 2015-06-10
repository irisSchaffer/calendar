/* global io */
'use strict';

angular.module('calendarApp')
  .factory('remoteSocket', ['socketFactory', 'piConfig', function(socketFactory, piConfig) {

    var remoteIoSocket = io.connect(piConfig.piHost + ':' + piConfig.piPort);

    var remoteSocket = socketFactory({
      ioSocket: remoteIoSocket
    });

    return remoteSocket;
  }]);
