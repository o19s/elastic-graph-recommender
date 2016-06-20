angular.module('recsApp', ['elasticsearch']);


angular.module('recsApp')
.service('esClient', function (esFactory) {
  return esFactory({
    host: 'localhost:9200',
  });
});

angular.module('recsApp')
  .controller('RecsUserCtrl', function(esClient) {
    var recUsers = this;
    recUsers.users = {
      '123': {name: 'Tom',  id: '123',  likedMovies: null},
      '5251': {name: 'Sue', id: '5251', likedMovies: null},
      '528': {name: 'Ed', id: '528', likedMovies: null},
      '17': {name: 'Kate', id: '17', likedMovies: null}
    };

    recUsers.refetchProfile = function() {
      // fetch this users baskets
      esClient.get({
        index: 'movielens',
        type: 'user',
        id: recUsers.selected}).then(function(resp) {
          var likedMovies = resp._source.liked_movies;
          recUsers.currUser = recUsers.users[recUsers.selected];

          esClient.mget({
            index: 'ml_tmdb',
            type: 'movie',
            body: {ids: likedMovies}}).then(function(resp) {
              var movies = [];
              angular.forEach(resp.docs, function(doc) {
                var movie = doc._source;
                movies.push(movie);
              });
              recUsers.currUser.likedMovies = movies;
              console.log(resp);
            });

        });
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
