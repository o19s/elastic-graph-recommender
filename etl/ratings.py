

def mergeDicts(*dict_args):
    '''
    Given any number of dicts, shallow copy and merge into a new dict,
    precedence goes to key value pairs in latter dicts.

    Taken from:
    http://stackoverflow.com/a/26853961/8123
    '''
    result = {}
    for dictionary in dict_args:
        result.update(dictionary)
    return result

def movieLensRatings(movieLensPath):
    import csv
    ml_ratings_f = open(movieLensPath)
    ml_reader = csv.reader(ml_ratings_f, delimiter=',')
    for rowNo, row in enumerate(ml_reader):
        try:
            yield (int(row[0]), int(row[1]), float(row[2]), int(row[3]))
        except ValueError:
            if rowNo == 0:
                print "Skipping CSV header"
            else:
                raise

def justMovieIds(userMovies, label='liked_movies'):
    movieFeatures = {label: []}
    for movie in userMovies:
        movieFeatures[label].append(movie['mlensId'])
    return movieFeatures


def bestGenres(userMovies, bestCutoffPercentage=35, label='liked_genres'):
    movieFeatures = {}
    likedGenres = set()
    genreCount = {}
    for movie in userMovies:
        try:
            for genre in movie['genres']:
                genreName = genre['name'].replace(' ', '_').lower()
                likedGenres.add(genreName)
                try:
                    genreCount[genreName] += 1
                except KeyError:
                    genreCount[genreName] = 0
        except KeyError:
            pass # no genre for this movie

    cutoff = (bestCutoffPercentage / 100.0) * len(userMovies)
    for genreName, cnt in genreCount.items():
        if cnt < cutoff:
            likedGenres.remove(genreName)
    movieFeatures[label] = list(likedGenres)
    return movieFeatures

def bestYears(userMovies, bestCutoffPercentage=15, label='liked_years'):
    movieFeatures = {label: []}
    from datetime import datetime
    yearCnt = {}
    for movie in userMovies:
        try:
            releaseDate = movie['release_date']
            try:
                releaseYear = datetime.strptime(releaseDate, '%Y-%m-%d').year
            except ValueError:
                raise KeyError('no parsable date')
            # divide by 5, multiply by 5 to get in 5 year divisions
            releaseYear = 5 * (releaseYear / 5)
            try:
                yearCnt[releaseYear] += 1
            except KeyError:
                yearCnt[releaseYear] = 0
        except KeyError:
            pass # no release date for this movie

    cutoff = (bestCutoffPercentage / 100.0) * len(userMovies)
    for year, cnt in yearCnt.items():
        if cnt > cutoff:
            movieFeatures[label].append(str(year))
    return movieFeatures

def allOverviewText(userMovies, label='liked_overview'):
    movieFeatures = {label: []}
    print "Appending %s movies overview" % len(userMovies)
    for movie in userMovies:
        try:
            movieFeatures[label].append(movie['overview'])
        except KeyError:
            pass
    return movieFeatures


def allFeatures(moviesUserLiked, moviesUserDisliked):
    likedDescriptors =  mergeDicts(justMovieIds(moviesUserLiked),
                                   bestYears(moviesUserLiked),
                                   bestGenres(moviesUserLiked),
                                   allOverviewText(moviesUserLiked))
    dislikedDescriptors =  mergeDicts(justMovieIds(moviesUserDisliked, label='disliked_movies'),
                                      bestYears(moviesUserDisliked, label='disliked_years'),
                                      bestGenres(moviesUserDisliked, label='disliked_genres'))

    return mergeDicts(likedDescriptors, dislikedDescriptors)


def userBaskets(mlTMDB='ml_tmdb.json',movieLensPath='ml-20m/ratings.csv', likeRating=4, dislikeRating=2, buildBasket=allFeatures):
    """ Movies a given user likes """
    import json
    movieDict = json.loads(open(mlTMDB).read())
    # Assumes sorted by user id
    print "Building baskets"
    lastUserId = -1
    moviesLiked = []
    moviesDisliked = []
    skipped = set()
    allmovies = set()

    def addMovieIf(basket, check):
        if check:
            try:
                allmovies.add(mlensId)
                basket.append(movieDict[str(mlensId)])
            except KeyError:
                skipped.add(mlensId)
                print "Skipped %s / %s " % (len(skipped), len(allmovies))
                pass

    for userId, mlensId, rating, timestamp in movieLensRatings(movieLensPath):
        if userId != lastUserId:
            lastUserId = userId
            if len(moviesLiked) > 0:
                yield userId, buildBasket(moviesLiked, moviesDisliked)
            moviesLiked = []
            moviesDisliked = []
        addMovieIf(moviesLiked, rating >= likeRating)
        addMovieIf(moviesDisliked, rating <= dislikeRating)
