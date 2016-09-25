from ratings import userBaskets

def esBaskets(minRating=4):
    """ Movies a given user likes """
    # Assumes sorted by user id
    for userId, basketDescription in userBaskets(minRating=minRating):
        yield {"_index": "movielens", "_type": "user",
                "_id": userId, "_source": basketDescription}



def createMovielens(es):
    es.indices.delete('movielens', ignore=['400', '404'])
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


def indexToEs(esUrl="http://localhost:9200"):
    from elasticsearch import Elasticsearch
    import elasticsearch.helpers
    es = Elasticsearch(esUrl)
    createMovielens(es)
    elasticsearch.helpers.bulk(es, esBaskets())

if __name__ == "__main__":
    from sys import argv
    esUrl="http://localhost:9200"
    if len(argv) > 1:
        esUrl = argv[1]
    indexToEs(esUrl=esUrl)
