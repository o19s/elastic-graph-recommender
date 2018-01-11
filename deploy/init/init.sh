#!/bin/bash

# Wait until Elasticsearch is ready
#until wait-for-it.sh elasticsearch:9200  ";" ; do
#	echo "Waiting on Elasticsearch init..."
#	sleep 5
#done
sleep 15

#echo "Going to load data into Elasticsearch"

#ls /etl

#echo "Need to download ratings first.  Running prepareData.sh"
#cd /etl
#/etl/prepareData.sh
#cd /

#unset all_proxy # ignore stupid SOCKS proxy dependency warning

#echo "Running rehashTmdbToMl.py"
#python /etl/rehashTmdbToMl.py /etl/tmdb.json /etl/ml_tmdb.json

echo "Running indexMlTmdb.py"
python /etl/indexMlTmdb.py http://elasticsearch:9200 /etl/ml_tmdb.json

echo "Running ratingsToEs.py"
python /etl/ratingsToEs.py http://elasticsearch:9200 /etl/ml_tmdb.json /etl/ml-20m/ratings.csv


echo "Done with setup"
