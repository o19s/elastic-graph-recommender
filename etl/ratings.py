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


def bestGenre(moviesUserLiked, bestCutoffPercentage=35):
    movieFeatures = {'liked_movies': [], 'liked_genres': set()}
    genreCount = {}
    for movie in moviesUserLiked:
        movieFeatures['liked_movies'].append(movie['mlensId'])
        try:
            for genre in movie['genres']:
                genreName = genre['name'].replace(' ', '_').lower()
                movieFeatures['liked_genres'].add(genreName)
                try:
                    genreCount[genreName] += 1
                except KeyError:
                    genreCount[genreName] = 0
        except KeyError:
            pass # no genre for this movie

    cutoff = (bestCutoffPercentage / 100.0) * len(moviesUserLiked)
    for genreName, cnt in genreCount.items():
        if cnt < cutoff:
            movieFeatures['liked_genres'].remove(genreName)
    movieFeatures['liked_genres'] = list(movieFeatures['liked_genres'])
    return movieFeatures



def userBaskets(minRating=4, buildBasket=bestGenre):
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
