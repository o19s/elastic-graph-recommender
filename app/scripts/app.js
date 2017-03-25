angular.module('recsApp', ['elasticsearch']);

//var esBaseURL = 'http://ec2-54-234-184-186.compute-1.amazonaws.com:9616';
// We expect a entry called elastic-graph-recommender that points to the
// Elasticsearch server, typically in your /etc/hosts file.  This is to
// be Docker friendly.
var esBaseURL = 'http://ELASTICSEARCH_HOST';
angular.module('recsApp')
.service('esClient', function (esFactory) {
  return esFactory({
    host: esBaseURL
  });
});
