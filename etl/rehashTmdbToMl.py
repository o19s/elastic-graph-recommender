import json

def rehashToMovielens(tmdbFile='tmdb.json', outFile='ml_tmdb.json'):
    f = open(tmdbFile)
    asDict = json.loads(f.read())
    mlDict = {}
    for tmdbId, tmdbMovie in asDict.iteritems():
        try:
            tmdbId = tmdbMovie['id']
            tmdbMovie['tmdb_id'] = tmdbId;
            del tmdbMovie['id']
        except KeyError:
            pass
        mlDict[tmdbMovie['mlensId']] = tmdbMovie
    of = open(outFile, 'w')
    of.write(json.dumps(mlDict))


if __name__ == "__main__":
    #movieIds = movieList()
    #movieDict = extract(movieIds)
    #f = open('tmdb.json', 'w')
    #f.write(json.dumps(movieDict))
    rehashToMovielens()
