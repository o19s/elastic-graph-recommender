angular.module('recsApp')
  .controller('CustomRecsCtrl', function(esClient, recsSvc, $scope, $log) {
    // Allow searches on title
    var customRecs = this;

    var storedLikes = localStorage.movieLibrary ? JSON.parse(localStorage.movieLibrary) : null;
    customRecs.recs = {likes:  storedLikes || [], useDate: true, useGenre: true};
    customRecs.search = {hits: [], searchString: ''};
    customRecs.mode = 'define';

    customRecs.addMovie = function (movie) {
      customRecs.recs.likes.push(movie);
      localStorage.movieLibrary = JSON.stringify(customRecs.recs.likes);
    }

    customRecs.removeMovie = function (movie) {
      var movieIndex = customRecs.recs.likes.indexOf(movie);
      if (movieIndex) {
        customRecs.recs.likes.splice(movieIndex, 1);
        localStorage.movieLibrary = JSON.stringify(customRecs.recs.likes);
      }
    }


    customRecs.recs.run = function(mode, useDate, useGenre) {
      recsSvc.moreLikeThis(customRecs.recs, mode, useDate, useGenre);
    };

    $scope.$watch("customRecs.recs.useGenre", function() {
      $log.info("CHANGED");
    });

    customRecs.setMode = function(newMode) {
      if (newMode === 'simple' || newMode === 'relevance' || newMode === 'graph') {
        customRecs.recs.run(newMode, customRecs.recs.useDate, customRecs.recs.useGenre);
      }
      customRecs.mode = newMode;
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
