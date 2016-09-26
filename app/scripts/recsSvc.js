angular.module('recsApp')
  .factory('recsSvc', recsSvc);

recsSvc.$inject = ['esClient', '$q', '$http', 'graphUtils'];


function recsSvc(esClient, $q, $http, graphUtils) {
  return {
    fetchProfile: fetchProfile,
    moreLikeThis: moreLikeThis
  };

  function fetchMovieDetails(movieIds) {
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
        fetchMovieDetails(likedMovies)
        .then(function(movies) {
          user.likedMovies = movies;
          moreLikeThis(user);
        });
      });

  }


  function constructAdHocQuery(likes, mode, useDate, useGenre) {


    var genreCutoffPercentage = 35.0;

    var likedIds = [];
    var allGenres = {};
    var allYears = {};


    angular.forEach(likes, function(likedMovie) {
      likedIds.push(likedMovie.mlensId);
      angular.forEach(likedMovie.genres, function(genre) {
        if (likedMovie.hasOwnProperty('release_date')) {
          var releaseYear = likedMovie.release_date.substr(0,4);
          releaseHalfDecade = (5 * ~~(parseInt(releaseYear) / 5)).toString(); // hack to force integer division
          if (!allYears.hasOwnProperty(releaseHalfDecade)) {
            allYears[releaseHalfDecade] = 0;
          }
          else {
            allYears[releaseHalfDecade] += 1;
          }
        }
        if (!allGenres.hasOwnProperty(genre.name)) {
          allGenres[genre.name] = 0;
        }
        allGenres[genre.name] += 1;
      });
    });

    // include popular genres
    var genreCutoff = 0;
    var likedGenres = [];
    angular.forEach(allGenres, function(cnt, genre) {
      if (cnt > genreCutoff) {
        likedGenres.push(genre.toLowerCase().replace('/ /g', '_'));
      }
    });

    // include popular years
    var cutoff = 0;
    var likedHalfDecades = [];
    angular.forEach(allYears, function(cnt, year) {
      if (cnt > cutoff) {
        likedHalfDecades.push(year);
      }
    });

    movieIdqStr = likedIds.join(' OR ');
    likeGenreqStr = likedGenres.join(' OR ');
    likeYearQStr = likedHalfDecades.join(' OR ');


    queryClause1 = {"query_string": {
                      "query": movieIdqStr,
                      "fields": ["liked_movies"],
                      "minimum_should_match": "25%"
                    }};
    queryClause2 = {"query_string": {
                      "query": likeGenreqStr,
                      "fields": ["liked_genres"],
                      "minimum_should_match": "3",
                      "boost": 0.1
                    }};
    queryClause3 = {"query_string": {
                      "query": likeYearQStr,
                      "fields": ["liked_years"],
                      //"minimum_should_match": "50%",
                      "boost": 0.01
                    }};

    if (!mode || mode === 'simple') {
      // show not tuned results
      return {'bool': {'should': [queryClause1]}};
    } else if (mode === 'relevance') {
      // some more features layered in
      query = {'bool': {'should': [queryClause1]}};
      if (useGenre) {
        query.bool.should.push(queryClause2);
      }
      if (useDate) {
        query.bool.should.push(queryClause3);
      }
      return query;
    }
  }


  function moreLikeThis(user, mode, useDate, useGenre) {
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

    query = constructAdHocQuery(user.likes, mode, useDate, useGenre);

    likedIds = [];
    angular.forEach(user.likes, function(likedMovie) {
      likedIds.push(likedMovie.mlensId);
    });

    var esQuery=  {
          "query": query,
          "vertices": [
              {
                  "field": "liked_movies",
                  "exclude": likedIds
              }
          ],
         "controls": {
            "use_significance": true,
            "sample_size": 50 // this many relevant results used in sig terms
          },
          "connections": {
              //"query": query, // guide only in the context of these recs, not globally
              "vertices": [ // how many degrees of kevin bacon
                  {"field": "liked_movies"}
              ]
          }

    };
    $http.post(esBaseURL + '/movielens/_graph/explore', esQuery)
    .success(function(resp) {
      // movies of depth 0 are statistically significant in the top <sample_size>
      // search results of the query
      var allMovies = resp.vertices;
      var usersMovies = graphUtils.parse(resp.vertices, resp.connections);

      // sort by depth so 0 depth first, helps
      // organize the graph

      relatedMovieIds = [];
      angular.forEach(allMovies, function(movieVertex) {
        var movieId = movieVertex.term;
        relatedMovieIds.push(movieId);
      });
      fetchMovieDetails(relatedMovieIds)
      .then(function success(movieDetails) {

        // the rest of this is just merging the movie details from
        // the other collection with the graph structure we parsed
        // out above
        //

        // hash by movieId
        movieDetailsLookup = {};
        angular.forEach(movieDetails, function(movieDetail) {
          movieDetailsLookup[movieDetail.mlensId] = movieDetail;
        });

        // connect movies to one-another via graph
        angular.forEach(usersMovies, function(userMovie) {
          var currMovie = movieDetailsLookup[userMovie.term];
          if (currMovie) {
            currMovie.related = [];
            angular.forEach(userMovie.outbound, function(connectedMovie) {
              var connectedMovieDetailed = movieDetailsLookup[connectedMovie.term];
              currMovie.related.push(connectedMovieDetailed);
            });
          }
        });

        // add details to movies are related to this user
        var thisUsersMovies = [];
        angular.forEach(usersMovies, function(movieVertex) {
          thisUsersMovies.push(movieDetailsLookup[movieVertex.term]);
        });

        // organize a graph based on these details
        user.relatedMovies = thisUsersMovies;
      }, function error(err) {
        console.log(err);
      }

      );

      // movies of depth 1 are significant to the movie at depth 0 it's connected to

      console.log(resp);
    });

  }
}
