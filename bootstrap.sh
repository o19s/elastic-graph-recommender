sudo add-apt-repository ppa:openjdk-r/ppa
sudo apt-get update
sudo apt-get install openjdk-7-jdk
wget https://download.elastic.co/elasticsearch/release/org/elasticsearch/distribution/deb/elasticsearch/2.4.0/elasticsearch-2.4.0.deb
sudo dpkg -i elasticsearch-2.4.0.deb
sudo update-rc.d elasticsearch enable

sudo echo "network.host: 0.0.0.0" >>  /etc/elasticsearch/elasticsearch.yml
sudo echo "http.cors.allow-origin: "/.*/"" >> /etc/elasticsearch/elasticsearch.yml
sudo echo "http.cors.enabled: true" >> /etc/elasticsearch/elasticsearch.yml

cd /usr/share/elasticsearch/
bin/plugin install license
bin/plugin install graph
