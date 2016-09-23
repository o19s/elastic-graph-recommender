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

def userBaskets(minRating=4):
    """ Movies a given user likes """
    # Assumes sorted by user id
    print "Buliding baskets"
    lastUserId = -1
    basket = []
    for userId, itemId, rating, timestamp in movieLensRatings():
        if userId != lastUserId:
            lastUserId = userId
            if len(basket) > 0:
                yield userId, basket
            basket = []
        if rating >= minRating:
            basket.append(str(itemId))
