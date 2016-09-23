angular.module('recsApp', ['elasticsearch']);

var esBaseURL = 'http://localhost:1337/ec2-54-234-184-186.compute-1.amazonaws.com:9200';
angular.module('recsApp')
.service('esClient', function (esFactory) {
  return esFactory({
    host: esBaseURL
  });
});

angular.module('recsApp')
  .controller('RecsUserCtrl', function(esClient, recsSvc) {
    var recUsers = this;
    recUsers.users = {
      '123': {name: 'Tom',  id: '123',  likedMovies: null},
      '5251': {name: 'Sue', id: '5251', likedMovies: null},
      '528': {name: 'Ed', id: '528', likedMovies: null},
      '17': {name: '80s movies', id: '17', likedMovies: null}
    };

    recUsers.refetchProfile = function() {
      // fetch this users baskets
      recUsers.currUser = recUsers.users[recUsers.selected];
      recsSvc.fetchProfile(recUsers.currUser);
    };
    recUsers.currUser = null;
    recUsers.selected = null;

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
