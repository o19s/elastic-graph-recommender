from ratings import userBaskets

def esBaskets(mlTMDB,mlRatings):
    """ Movies a given user likes """
    # Assumes sorted by user id
    for userId, basketDescription in userBaskets(mlTMDB,mlRatings):
        yield {"_index": "movielens", "_type": "user",
                "_id": userId, "_source": basketDescription}



def createMovielens(es):

    es.indices.delete('movielens', ignore=[400, 404])

    settings = { #A
        "settings": {
            "number_of_shards": 1, #B
            "index": {
                "analysis": {
                    "analyzer": {
                        "default": {
                            "tokenizer": "keyword",
                            "filters": ["lowercase"]
                        }
                    }
                }
            }
        },
        "mappings": {
            "user": {
                "_all": {
                  "enabled": False
                },
                "properties": {
                    "liked_overview": {
                        "type": "string",
                        "analyzer": "english",
                        "position_increment_gap": 100
                    }
                }
            }
        }}
    es.indices.create('movielens', body=settings)


def indexToEs(esUrl="http://localhost:9200",mlTMDB="ml_tmdb.json",mlRatings='ml-20m/ratings.csv'):
    from elasticsearch import Elasticsearch
    import elasticsearch.helpers
    es = Elasticsearch(esUrl, timeout=30)
    createMovielens(es)
    elasticsearch.helpers.bulk(es, esBaskets(mlTMDB,mlRatings))

if __name__ == "__main__":
    from sys import argv
    esUrl="http://localhost:9200"
    mlRatings='ml_tmdb.json'
    mlRatings='ml-20m/ratings.csv'
    if len(argv) > 1:
        esUrl = argv[1]
        mlTMDB = argv[2]
        mlRatings = argv[3]
    indexToEs(esUrl=esUrl, mlTMDB=mlTMDB,mlRatings=mlRatings)
