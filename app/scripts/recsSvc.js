angular.module('recsApp')
  .factory('recsSvc', recsSvc);

recsSvc.$inject = ['esClient', '$q', '$http'];


function recsSvc(esClient, $q, $http) {
  return {
    fetchProfile: fetchProfile
  };

  function movieDetails(movieIds) {
    var movies = [];
    var deferred = $q.defer();
    esClient.mget({
      index: 'ml_tmdb',
      type: 'movie',
      body: {ids: movieIds}}).then(function(resp) {
        var movies = [];
        angular.forEach(resp.docs, function(doc) {
          var movie = doc._source;
          if (movie) {
            movies.push(movie);
          }
        });
        deferred.resolve(movies);
      });
    return deferred.promise;

  }

  function fetchProfile(user) {
    esClient.get({
      index: 'movielens',
      type: 'user',
      id: user.id})
      .then(function(resp) {
        var likedMovies = resp._source.liked_movies;
        movieDetails(likedMovies)
        .then(function(movies) {
          user.likedMovies = movies;
          moreLikeThis(user);
        });
      });

  }

  function moreLikeThis(user) {
    //POST movielens/_graph/explore
    //
    // The elastic graph plugin works by first sampling the top <sample_size>
    // results of the query, then measuring the statistical significance (see sig
    // terms agregration) of terms in those results.
    //
    // Then it repeats this process using the significant terms to find related significant
    // terms to those (though this process is a bit less fuzzy to me)
    //
    // The first attempt I want to try is pure "collaborative" filtering, we have
    // an index with movies 'liked' by a user. Here we find users "more like" this user.
    // (this is collaborative filtering).
    //
    // But graph lets us go a step further and see the movies that are "special" ie
    // statistically interesting in the users more like me. Then we can find what's
    // special about those movies, and so on.
    //
    var esQuery=  {
          "query": {
              "more_like_this": {
                  "fields": ["liked_movies"],
                  "like": [
                      {"_id": user.id}
                  ],
                  "min_term_freq": 1
              }
          },
          "vertices": [
              {
                  "field": "liked_movies"
              }
          ],
         "controls": {
            "use_significance": true,
            "sample_size": 25 // this many relevant results used in sig terms
          },
          "connections": {
              "vertices": [
                  {"field": "liked_movies"}
              ]
          }

    };
    $http.post('http://localhost:9200/movielens/_graph/explore', esQuery)
    .success(function(resp) {
      // movies of depth 0 are statistically significant in the top <sample_size>
      // search results of the query
      var relatedMovies = resp.vertices;

      // sort by depth so 0 depth first, helps
      // organize the graph

      relatedMovieIds = [];
      angular.forEach(relatedMovies, function(movieVertex) {
        var movieId = movieVertex.term;
        relatedMovieIds.push(movieId);
      });
      movieDetails(relatedMovieIds)
      .then(function(movies) {
        // hash by movieId
        movieLookup = {};
        angular.forEach(movies, function(movie) {
          movieLookup[movie.mlensId] = movie;
        });

        // depth 0 movies are related to this user
        var thisUsersMovies = [];
        angular.forEach(relatedMovies, function(movieVertex) {
          if (movieVertex.depth === 0) {
            thisUsersMovies.push(movieLookup[movieVertex.term]);
          }
          // find connections to related movies from depth 0 movies
        });

        // organize a graph based on these details
        user.relatedMovies = movies;
      });

      // movies of depth 1 are significant to the movie at depth 0 it's connected to

      console.log(resp);
    });

  }
}
