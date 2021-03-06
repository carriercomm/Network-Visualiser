/* global window:false */
var app = window.angular.module('MaidSafe', [ 'ui-rangeSlider', 'ngReact' ]);
app.run([
  '$rootScope', '$location', function($rootScope, $location) {
    $rootScope.socketEndPoint = 'http://' + $location.host() + ':' + window.socketPort;
    $rootScope.sessionName = $location.search().sn;
  }
]);
app.service('connectionMapStatus', window.ConnectionMapStatus);
app.service('d3Transformer', window.Transform);
app.service('dataService', window.ConnectionMapDataService);
app.service('playBackService', window.PlaybackDataService);
app.service('player', window.PlayerService);
app.controller('connectionMapTimelineCtrl', [
  '$scope', '$timeout', '$filter', '$rootScope', 'dataService', 'connectionMapStatus',
  'playBackService', 'player',
  function($scope, $timeout, $filter, $rootScope, dataService, mapStatus, playBackService, player) {
    var reactComponent;
    $scope.showStatusButton = false;
    $scope.PLAYER_STATE = { PLAYING: 'playing', STOPPED: 'stopped', PAUSED: 'pause' };
    $scope.playerState = $scope.PLAYER_STATE.STOPPED;
    $scope.maxTime = new Date();
    $scope.conMapStatus = 1;
    $scope.keyTrayClosed = false;
    $scope.connections = [];
    $scope.vaultsCount = 0;
    $scope.player = player;
    $scope.toggleKeyTray = function() {
      $scope.keyTrayClosed = !$scope.keyTrayClosed;
    };
    $scope.showRealtime = function() {
      window.location.href = '/connectionmap#?sn=' + $rootScope.sessionName;
    };
    $scope.showViewer = function() {
      window.location.href = '/viewer#?sn=' + $rootScope.sessionName;
    };
    var pushDiffs = function(data) {
      $timeout(function() {
        (data.hasOwnProperty('actionId') ? mapStatus.updateActual : mapStatus.updateExpected)(data);
      }, 1);
    };
    $scope.zoom = function(zoomFactor) {
      var text;
      var scaleIndex;
      var scale;
      var svg;
      svg = window.d3.select('svg g');
      text = svg.attr('transform');
      scaleIndex = text.indexOf('scale');
      if (scaleIndex > -1) {
        scale = parseFloat(text.substring(scaleIndex + 6, text.length - 1)) + zoomFactor;
        reactComponent.state.connectionMap.setLastScale(scale);
        svg.attr('transform', text.substring(0, scaleIndex) + 'scale(' + scale + ')');
        return;
      }
      scale = 1 + zoomFactor;
      reactComponent.state.connectionMap.setLastScale(scale);
      svg.attr('transform', text + 'scale(' + scale + ')');
    };
    var clockTimer = function() {
      $scope.currentTime = $filter('date')(new Date(), 'dd/MM/yyyy HH:mm:ss');
      $timeout(clockTimer, 1000);
    };
    var onSnapShotChange = function(data) {
      mapStatus.setSnapshot(data);
    };
    if (!$rootScope.sessionName) {
      console.error('Session Name not found');
      return;
    }
    $scope.registerReactComponent = function(reactComp) {
      reactComponent = reactComp;
    };
    $scope.changeConnectionStatus = function(mode) {
      $scope.conMapStatus = mode;
      reactComponent.state.connectionMap.setConnectionMode(mode);
    };
    mapStatus.onStatusChange(function(transformedData) {
      $scope.connections = transformedData;
      try {
        reactComponent.setState({});
        if (reactComponent.state.connectionMap) {
          reactComponent.state.connectionMap.onNodeTextClicked(function(clicked) {
            if (!clicked) {
              $scope.conMapStatus = 1;
            }
            $scope.showStatusButton = clicked;
          });
        }
      }catch (e) {
        console.error(e);
      }
    });
    playBackService.setSnapShotHandler(dataService.getConnectionMapSnapshot);
    playBackService.setBufferedDataHandler(dataService.getConnectionMapDiff);
    player.onSnapShotChange(onSnapShotChange);
    player.setPushLogHandler(pushDiffs);
    $timeout(function() {
      clockTimer();
    }, 10);
    player.init($rootScope.sessionName, $scope, $scope.player);
    $scope.$watch(function() {
      return mapStatus.vaultsCount;
    }, function(newValue) {
      $scope.vaultsCount = newValue ;
    });
  }
]);
