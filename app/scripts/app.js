angular.module('recsApp', ['elasticsearch']);


angular.module('recsApp')
.service('esClient', function (esFactory) {
  return esFactory({
    host: 'localhost:9200',
  });
});


angular.module('recsApp')
  .controller('LikedMoviesCtrl', function($scope, esClient) {
    var movies = this;

    esClient.get({
      index: 'ml_tmdb',
      type: 'movie',
      id: 1
    }).then(function(response) {
      var movie = response._source;
      movies.movies[0] = movie;
      console.log(response);
    });

    movies.movies = [
      {'title': 'fooshank redemption'},
      {'title': 'barest gump'}
    ];


  });
