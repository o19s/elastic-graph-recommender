angular.module('recsApp')
  .controller('CustomRecsCtrl', function(esClient, recsSvc, $scope, $log) {
    // Allow searches on title
    var customRecs = this;

    customRecs.recs = {likes: [], likeIds: []};
    customRecs.search = {hits: [], searchString: ''};
    customRecs.mode = 'define';

    customRecs.recs.run = function(mode) {
      recsSvc.moreLikeThis(customRecs.recs, mode);
    };

    customRecs.setMode = function(newMode) {
      if (newMode === 'simple' || newMode === 'relevance' || newMode === 'graph') {
        customRecs.recs.run(newMode);
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
