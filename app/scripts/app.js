angular.module('recsApp', []);

angular.module('recsApp', [])
  .controller('LikedMoviesCtrl', function($scope) {
    var movies = this;
    movies.movies = [
      {'title': 'fooshank redemption'},
      {'title': 'barest gump'}
    ];


  });
