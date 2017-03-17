FROM elasticsearch:2.4.4

RUN echo "network.host: 0.0.0.0" >>  /etc/elasticsearch/elasticsearch.yml
RUN echo "http.cors.allow-origin: "/.*/"" >> /etc/elasticsearch/elasticsearch.yml
RUN echo "http.cors.enabled: true" >> /etc/elasticsearch/elasticsearch.yml

RUN /usr/share/elasticsearch/bin/plugin install license
RUN /usr/share/elasticsearch/bin/plugin install graph
