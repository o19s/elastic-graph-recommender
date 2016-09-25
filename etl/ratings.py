movieLensPath = 'ml-20m/ratings.csv'

def movieLensRatings():
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

def justMovieIds(moviesUserLiked):
    movieFeatures = {'liked_movies': []}
    for movie in moviesUserLiked:
        movieFeatures['liked_movies'].append(movie['mlensId'])
    return movieFeatures


def bestGenres(moviesUserLiked, bestCutoffPercentage=35):
    movieFeatures = {}
    likedGenres = set()
    genreCount = {}
    for movie in moviesUserLiked:
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

    cutoff = (bestCutoffPercentage / 100.0) * len(moviesUserLiked)
    for genreName, cnt in genreCount.items():
        if cnt < cutoff:
            likedGenres.remove(genreName)
    movieFeatures['liked_genres'] = list(likedGenres)
    return movieFeatures

def bestYears(moviesUserLiked, bestCutoffPercentage=15):
    movieFeatures = {'liked_years': []}
    from datetime import datetime
    yearCnt = {}
    for movie in moviesUserLiked:
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

    cutoff = (bestCutoffPercentage / 100.0) * len(moviesUserLiked)
    for year, cnt in yearCnt.items():
        if cnt > cutoff:
            movieFeatures['liked_years'].append(str(year))
    return movieFeatures

def allFeatures(moviesUserLiked):
    movieFeatures = justMovieIds(moviesUserLiked);
    movieFeatures['liked_years'] = bestYears(moviesUserLiked)['liked_years']
    movieFeatures['liked_genres'] = bestGenres(moviesUserLiked)['liked_genres']
    return movieFeatures


def userBaskets(minRating=4, buildBasket=allFeatures):
    """ Movies a given user likes """
    import json
    movieDict = json.loads(open('ml_tmdb.json').read())
    # Assumes sorted by user id
    print "Buliding baskets"
    lastUserId = -1
    basket = []
    skipped = set()
    allmovies = set()
    for userId, mlensId, rating, timestamp in movieLensRatings():
        if userId != lastUserId:
            lastUserId = userId
            if len(basket) > 0:
                yield userId, buildBasket(basket)
            basket = []
        if rating >= minRating:
            try:
                allmovies.add(mlensId)
                basket.append(movieDict[str(mlensId)])
            except KeyError:
                skipped.add(mlensId)
                print "Skipped %s / %s " % (len(skipped), len(allmovies))
                pass
