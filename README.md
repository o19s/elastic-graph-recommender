# Elastic Graph Recommender

[Blog Post](http://opensourceconnections.com/blog/2016/10/05/elastic-graph-recommendor/) | [Demo](http://elastic-graph-recs.labs.o19s.com/)

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

It's recommended you get the prepared source data file `ml_tmdb.json` from someone. But you can recreate it with the scripts below

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
./srv.sh
```

### Tests

Tests are run via Karma, you can run `app/test.sh` to run tests. When debugging, I use the following command:

```
node_modules/karma/bin/karma start --no-single-run --log-level debug --auto-watch --browsers Chrome
```

which runs Karma in Chrome, autowatching the source files.

# Deploying

## By rubbing two sticks together to start a fire

- However you like to deploy stuff, there's a script [bootstrap.sh](bootstrap.sh) that lists the steps taken to provision an Ubuntu box with Elastic Graph. NOTE this script is meant for development purposes, it does several non-secure things like opens up Elasticsearch to the world and has very liberal CORS permissions.  

## By using a blow torch

Start the docker images via:

```
docker login harbor.dev.o19s.com   # ask Eric for credentials

docker run -d -p 9200:9200 -p 9300:9300 --name elasticsearch harbor.dev.o19s.com/elastic-graph-recommender/elasticsearch:latest
docker run -d -p 8000:8000 --name app -e ELASTICSEARCH_GRAPH_RECOMMENDER_URL=localhost:9200 harbor.dev.o19s.com/elastic-graph-recommender/app:latest
```

If you are deploying in the cloud, remember that the `ELASTICSEARCH_GRAPH_RECOMMENDER_URL` is pointing to the public URL for the Elasticsearch node, so update accordingly!


Load the demo data via:

```
docker exec -it elasticsearch python /etl/indexMlTmdb.py http://localhost:9200 /etl/ml_tmdb.json
docker exec -it elasticsearch python /etl/ratingsToEs.py http://localhost:9200 /etl/ml_tmdb.json /etl/ml-20m/ratings.csv

```

Browse to http://localhost:8000 to try it out!


# Building Docker images
Build the docker images from scratch via:

```
docker build -t elastic-graph-recommender/elasticsearch -f deploy/elasticsearch/Dockerfile .
docker build -t elastic-graph-recommender/app -f deploy/app/Dockerfile .
```

Deploy to our private Docker registry http://harbor.dev.o19s.com:

```
docker login harbor.dev.o19s.com

docker tag elastic-graph-recommender/elasticsearch harbor.dev.o19s.com/elastic-graph-recommender/elasticsearch
docker tag elastic-graph-recommender/app harbor.dev.o19s.com/elastic-graph-recommender/app

docker push harbor.dev.o19s.com/elastic-graph-recommender/elasticsearch
docker push harbor.dev.o19s.com/elastic-graph-recommender/app
