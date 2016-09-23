import pysolr
from ratings import userBaskets

solrUrl = 'http://localhost:8983/solr/movielens'

def indexToSolr(minRating=4):
   solr = pysolr.Solr(solrUrl)
   for userId, likedMovies in userBaskets(minRating=minRating):
        solr.add([{'id': userId,
                  'liked_movies': likedMovies}], commit=False)


if __name__ == "__main__":
    indexToSolr()



