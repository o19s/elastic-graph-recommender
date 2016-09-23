import requests
import json

def reindex(analysisSettings={}, mappingSettings={}, movieDict={}, index='ml_tmdb', esUrl='http://localhost:9200'):
    settings = { #A
        "settings": {
            "number_of_shards": 1, #B
            "index": {
                "analysis" : analysisSettings, #C
            }}}

    if mappingSettings:
        settings['mappings'] = mappingSettings #C

    resp = requests.delete(esUrl + ("/%s" % index)) #D
    resp = requests.put(esUrl + ("/%s" % index),
                        data=json.dumps(settings))

    bulkMovies = ""
    for id, movie in movieDict.iteritems():
        addCmd = {"index": {"_index": index, #E
                            "_type": "movie",
                            "_id": id}}
        bulkMovies += json.dumps(addCmd) + "\n" + json.dumps(movie) + "\n"
    requests.post(esUrl + "/_bulk", data=bulkMovies)

if __name__ == "__main__":
    from sys import argv
    esUrl="http://localhost:9200"
    if len(argv) > 1:
        esUrl = argv[1]
    movieDict = json.loads(open('ml_tmdb.json').read())
    reindex(movieDict=movieDict, esUrl=esUrl)
