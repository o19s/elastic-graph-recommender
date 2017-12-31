FROM elasticsearch:2.4.4

# Need python to load sample data into Elasticsearch
RUN apt-get update
RUN apt-get install python -y
RUN apt-get install python-pip -y
RUN pip install elasticsearch

# Copy files to container
COPY etl /etl
COPY deploy/init /code

RUN chown -R elasticsearch:elasticsearch /code
RUN chown -R elasticsearch:elasticsearch /etl

CMD /code/init.sh
