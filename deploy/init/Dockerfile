FROM elasticsearch:2.4.4

# Need python to load sample data into Elasticsearch
RUN apt-get update
RUN apt-get install python -y
RUN apt-get install python-pip -y
RUN pip install elasticsearch

# Copy data prepped files to host
COPY etl /etl

ADD . /code

#USER solr
CMD /code/init.sh
