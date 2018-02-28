FROM elasticsearch:2.4.4

# Need python to load sample data into Elasticsearch
RUN apt-get update
RUN apt-get install python -y
RUN apt-get install python-pip -y
RUN pip install elasticsearch

# Copy data prepped files to host.  Needed only if you don't have the init container
# and want to load locally into Elasticsearch.
# COPY etl /etl

# Copy over CORS enabled configuration
ADD ./deploy/elasticsearch/elasticsearch.yml /usr/share/elasticsearch/config/

# Need some plugins!
RUN /usr/share/elasticsearch/bin/plugin install license
RUN /usr/share/elasticsearch/bin/plugin install graph

EXPOSE 9200
EXPOSE 9300
