angular.module('recsApp')
  .controller('AppModeCtrl', function(esClient, recsSvc, $scope) {
    var appMode = this;
    appMode.tabSelect = 'define';
    appMode.setMode = function(newMode) {
      $scope.$broadcast('modechanged', newMode);
      appMode.tabSelect = newMode;
    };
  });
