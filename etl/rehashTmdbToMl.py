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
            origPath = tmdbMovie['poster_path']
            if origPath:
                tmdbMovie['poster_path'] = 'https://image.tmdb.org/t/p/w130' + tmdbMovie['poster_path']
        except KeyError:
            pass
        mlDict[tmdbMovie['mlensId']] = tmdbMovie
    of = open(outFile, 'w')
    of.write(json.dumps(mlDict))


if __name__ == "__main__":
    rehashToMovielens()
