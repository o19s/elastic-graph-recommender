angular.module('recsApp')
  .controller('LikedMovieSearchCtrl', function(esClient) {
    movieSearch = this;

    movieSearch.searchString = "";
    movieSearch.hits = [];
    movieSearch.run = function() {
      // search ES by title, show results
      var esQuery = {
        "query": {
					"bool": {
            "should": [
              {"match": {
                "title": {
                  "query": movieSearch.searchString
                }
              }},
              {
                "match_phrase_prefix": {
                  "title": movieSearch.searchString
                }
              },
              {
                "match_phrase_prefix": {
                  "title_sentinel": {
                    "query":  "SENTINEL_BEGIN " + movieSearch.searchString,
                    "boost": 100
                  }
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
        movieSearch.hits = [];
        angular.forEach(resp.hits.hits, function(hit) {
          movieSearch.hits.push(hit._source);
        });
      });
    };
});
