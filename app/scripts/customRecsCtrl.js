angular.module('recsApp')
  .controller('CustomRecsCtrl', function(esClient, recsSvc, $scope, $log) {
    // Allow searches on title
    var customRecs = this;

    var storedLikes = localStorage.movieLibrary ? JSON.parse(localStorage.movieLibrary) : null;
    customRecs.recs = {likes:
                       storedLikes || [],
                       config: {
                         useDate: false,
                         useGenre: false,
                         numSimilarUsers: 1000,
                         minMovies: 50, // %
                         globalGuidance: false
                       }};
    customRecs.search = {hits: [], searchString: ''};
    customRecs.mode = 'define';

    customRecs.addMovie = function (movie) {
      customRecs.recs.likes.push(movie);
      localStorage.movieLibrary = JSON.stringify(customRecs.recs.likes);
    };

    customRecs.removeMovie = function (movie) {
      var movieIndex = customRecs.recs.likes.indexOf(movie);
      if (movieIndex && movieIndex >= 0) {
        customRecs.recs.likes.splice(movieIndex, 1);
        localStorage.movieLibrary = JSON.stringify(customRecs.recs.likes);
      }
    };

    customRecs.recs.setMode = function(mode) {
      if (mode === "relevance" || mode === "graph") {
        customRecs.recs.config.useDate = true;
        customRecs.recs.config.useGenre = true;
      } else {
        customRecs.recs.config.useDate = false;
        customRecs.recs.config.useGenre = false;
      }
      customRecs.mode = mode;
      customRecs.recs.run();
    };


    customRecs.recs.run = function() {
      recsSvc.recommend(customRecs.recs, customRecs.recs.config);
    };


    customRecs.search.run = function() {
      // search ES by title, show results

      var esQuery = {
        "query": {
					"bool": {
            "should": [
              {"match": {
                "title": {
                  "query": customRecs.search.searchString
                }
              }},
              {
                "match_phrase_prefix": {
                  "title": customRecs.search.searchString
                }
              }
            ]
				  }
        }
      };

      esClient.search({
        index: 'ml_tmdb',
        type: 'movie',
        body: esQuery
      }).then(function success(resp) {
        customRecs.search.hits = [];
        angular.forEach(resp.hits.hits, function(hit) {
          customRecs.search.hits.push(hit._source);
        });
      });
    };


  });
