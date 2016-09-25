angular.module('recsApp', ['elasticsearch']);

//var esBaseURL = 'http://ec2-54-234-184-186.compute-1.amazonaws.com:9200';
var esBaseURL = 'http://localhost:9200';
angular.module('recsApp')
.service('esClient', function (esFactory) {
  return esFactory({
    host: esBaseURL
  });
});

angular.module('recsApp')
  .controller('RecsUserCtrl', function(esClient, recsSvc) {
    var recUsers = this;
    recUsers.users = [
      {name: 'Tom',  id: '123',  likedMovies: null},
      {name: 'Sue', id: '5251', likedMovies: null},
      {name: 'Ed', id: '528', likedMovies: null},
      {name: '80s movies', id: '17', likedMovies: null}
    ];
    recUsers.currentUser = recUsers.users[0];

    recUsers.fetchProfile = function() {
      // fetch this users baskets
      recsSvc.fetchProfile(recUsers.currentUser);
    };
    recUsers.fetchProfile();
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
