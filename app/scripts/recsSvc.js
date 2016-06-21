angular.module('recsApp')
  .factory('recsSvc', recsSvc);

recsSvc.$inject = ['esClient', '$q']


function recsSvc(esClient, $q) {
  return {
    fetchProfile: fetchProfile
  };

  function fetchProfile(user) {
    esClient.get({
      index: 'movielens',
      type: 'user',
      id: user.id}).then(function(resp) {
        var likedMovies = resp._source.liked_movies;

        esClient.mget({
          index: 'ml_tmdb',
          type: 'movie',
          body: {ids: likedMovies}}).then(function(resp) {
            var movies = [];
            angular.forEach(resp.docs, function(doc) {
              var movie = doc._source;
              movies.push(movie);
            });
            user.likedMovies = movies;
          });
      });

  }
}
