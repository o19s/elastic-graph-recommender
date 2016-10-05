# Elastic Graph Recommender

![CircleCI](https://circleci.com/gh/o19s/elastic-graph-recommender.svg?style=svg)

Building recommenders with Elastic Graph! This app makes movie recommendations using Elastic graph based on the Movielens data set. [Movielens](http://grouplens.org/datasets/movielens/) is a well known open data set with user movie ratings.

We use this data alongside [The Movie Database(TMDB)](https://www.themoviedb.org/?language=en). TMDB has all the movie details such as title, image URL, etc.

## ETL and data prep

In the etl/ folder there are several Python scripts for importing movielens & TMDB data into Elasticsearch into two collections.

- One index, `movielens` stores user view data. Each record is a user and the movielens identifiers of movies they liked. The primary key is a movielens user id. These documents hold a single field `liked_movies` -- the movielens ids of the movies this user liked.
- Another index `ml_tmdb` uses the mapping from movielens ids -> tmdb ids to store details about each movies (title, poster image URL, etc). The primary key is the movielens movie id.

### Import Movielens ratings

- `prepareData.sh` is a shell script for downloading the latest movielens data (ml-20m) and unpacking it to the ml-20m folder.
- `ratingsToEs.py` is a Python 2.7 script for importing movielens data into Elasticsearch

### Import TMDB movie details

It's recommended you get ml_tmdb.json from someone. But you can recreate it with the scripts below

- `tmdb.py` crawls the movielens TMDB movies into tmdb.json
- `rehashTmdbToMl.py` creates ml_tmdb.json, which is tmdb.json with the movielens as the primary identifier
- `indexMlTmdb.py` indexes ml_tmdb.json into Elasticsearch 

## Angular App

The `app/` folder holds an angular app for querying Elasticsearch via the graph API for recommendations.

### Bootstrap app

See the `app/depends.sh` shell script for bootstrapping bower and npm dependencies

### Run the app

Start a dumb web server in the app/ dir, 

```
cd app/
python -m SimpleHTTPServer
```

### Tests

Tests are run via Karma, you can run `app/test.sh` to run tests. When debugging, I use the following command:

```
node_modules/karma/bin/karma start --no-single-run --log-level debug --auto-watch --browsers Chrome
```

which runs Karma in Chrome, autowatching the source files. 

# Deploying 

- However you like to deploy stuff, there's a script [bootstrap.sh](bootstrap.sh) that lists the steps taken to provision an Ubunutu box with Elastic Graph. NOTE this script is meant for development purposes, it does several non-secure things like opens up Elasticsearch to the world and with very liberal CORS permissions.  
