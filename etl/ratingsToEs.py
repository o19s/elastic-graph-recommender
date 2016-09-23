from ratings import userBaskets

def esBaskets(minRating=4):
    """ Movies a given user likes """
    # Assumes sorted by user id
    for userId, likedMovies in userBaskets(minRating=minRating):
        yield {"_index": "movielens", "_type": "user",
                "_id": userId, "_source": {"liked_movies": likedMovies}}



def createMovielens(es):
    #es.indices.delete('movielens', ignore=['400', '404'])
    settings = { #A
        "settings": {
            "number_of_shards": 1, #B
        },
        "mappings": {
            "user": {
                "properties": {
                    "liked_movies": {
                        "type": "string"
                    }
                }
            }
        }}
    es.indices.create('movielens', body=settings)


def indexToEs():
    from elasticsearch import Elasticsearch
    import elasticsearch.helpers
    es = Elasticsearch()
    createMovielens(es)
    elasticsearch.helpers.bulk(es, esBaskets())

if __name__ == "__main__":
    indexToEs()
