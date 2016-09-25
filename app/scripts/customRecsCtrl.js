angular.module('recsApp')
  .controller('CustomRecsCtrl', function(esClient, recsSvc) {
    // Allow searches on title
    var customRecs = this;

    customRecs.recs = {likes: [], likeIds: []};
    customRecs.search = {hits: [], searchString: ''};

    customRecs.recs.run = function() {
      recsSvc.moreLikeThis(customRecs.recs);
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
