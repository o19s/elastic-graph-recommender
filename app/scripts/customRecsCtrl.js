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
                         useOverviews: false,
                         numSimilarUsers: 1000,
                         minMovies: 50, // %
                         globalGuidance: false

                       }};
    customRecs.mode = 'define';

    customRecs.addMovie = function (movie) {
      customRecs.recs.likes.push(movie);
      localStorage.movieLibrary = JSON.stringify(customRecs.recs.likes);
    };

    customRecs.removeMovie = function (movie) {
      var movieIndex = customRecs.recs.likes.indexOf(movie);
      if (movieIndex >= 0) {
        customRecs.recs.likes.splice(movieIndex, 1);
        localStorage.movieLibrary = JSON.stringify(customRecs.recs.likes);
      }
    };

    customRecs.recs.setMode = function(mode) {
      if (mode === "relevance") {
        customRecs.recs.config.useOverviews = true;
      }
      customRecs.mode = mode;
      customRecs.recs.run();
    };


    customRecs.recs.run = function() {
      recsSvc.recommend(customRecs.recs, customRecs.recs.config);
    };



  });
