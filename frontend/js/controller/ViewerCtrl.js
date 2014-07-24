var app = angular.module('MaidSafe', []);

app.run([
  '$rootScope', '$location', function($rootScope, $location) {
    $rootScope.socketEndPoint = "http://" + $location.host() + ":" + socketPort;
  }
]);

app.directive('clipCopy', ClipCopy);
app.directive('tooltip', ToolTip);
app.service('dataManager', DataManagerService);
app.service('vaultBehaviour', VaultBehaviourService);
app.service('socketService', SocketService);
app.controller('vaultCtrl', VaultCtrl);

app.controller('viewerCtrl', [
  '$scope', '$rootScope', '$location', 'dataManager', 'socketService', function($scope, $rootScope, $location, dataManager, socketService) {

    $rootScope.sessionName = $location.search().sn;

    $scope.iconsTrayClosed = true;

    $scope.vaults = [];
    $scope.allVaultsExpanded = false;

    $scope.showLoader = true;
    $scope.alert = null;
    $scope.currentTime = new Date().getTime();
    setInterval(function() {
      $scope.currentTime += 1000;
      if (!$scope.$$phase) {
        $scope.$apply();
      }
    }, 1000);
    $scope.timeline = function() {
      window.open('/timeline#?sn=' + $rootScope.sessionName, '_blank').focus();
    };
    $scope.search = function() {
      window.open('/search#?sn=' + $rootScope.sessionName, '_blank').focus();
    };
    $scope.setStatusAlert = function(msg) {
      $scope.alert = msg;
      setTimeout(function() {
        $scope.alert = null;
        if (!$scope.$$phase) {
          $scope.$apply();
        }
      }, 5000);
    };

    var newVault = function(vault) {
      $scope.vaults.push(vault);
      if (!$scope.$$phase) {
        $scope.$apply();
      }
    };
    var onVaultsLoaded = function(time) {
      $scope.showLoader = false;
      if (!$scope.vaults || $scope.vaults.length == 0) {
        $scope.setStatusAlert('No active vaults');
      }
    };
    $scope.toggleIconsTray = function() {
      $scope.iconsTrayClosed = !$scope.iconsTrayClosed;
    };
    $scope.toggleExpandAllLogs = function() {
      $scope.allVaultsExpanded = !$scope.allVaultsExpanded;
      $rootScope.$broadcast('expandVault', $scope.allVaultsExpanded);
    };
    dataManager.onNewVault(newVault);
    dataManager.onVaultsLoaded(onVaultsLoaded);
    setTimeout(function() {
      dataManager.getActiveVaults();
    }, 10);
  }
]);