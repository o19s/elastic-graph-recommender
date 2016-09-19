angular.module('recsApp')
  .controller('AppModeCtrl', function(esClient, recsSvc) {
    var appMode = this;
    appMode.tabSelect = 'profile';

  });
