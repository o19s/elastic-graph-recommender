import requests
import json

def reindex(analysisSettings={}, mappingSettings={}, movieDict={}, index='ml_tmdb'):
    settings = { #A
        "settings": {
            "number_of_shards": 1, #B
            "index": {
                "analysis" : analysisSettings, #C
            }}}

    if mappingSettings:
        settings['mappings'] = mappingSettings #C

    resp = requests.delete("http://localhost:9200/%s" % index) #D
    resp = requests.put("http://localhost:9200/%s" % index,
                        data=json.dumps(settings))

    bulkMovies = ""
    for id, movie in movieDict.iteritems():
        addCmd = {"index": {"_index": index, #E
                            "_type": "movie",
                            "_id": id}}
        bulkMovies += json.dumps(addCmd) + "\n" + json.dumps(movie) + "\n"
    requests.post("http://localhost:9200/_bulk", data=bulkMovies)

if __name__ == "__main__":
    movieDict = json.loads(open('ml_tmdb.json').read())
    reindex(movieDict=movieDict)
