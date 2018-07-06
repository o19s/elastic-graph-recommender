FROM nginx:alpine
COPY app /usr/share/nginx/html
COPY deploy/app/entrypoint.sh /usr/share/nginx/html/entrypoint.sh
RUN chmod 755 /usr/share/nginx/html/entrypoint.sh

WORKDIR /usr/share/nginx/html

RUN apk add --update nodejs nodejs-npm
RUN npm install

RUN apk --no-cache add ca-certificates wget
RUN wget -q -O /etc/apk/keys/sgerrand.rsa.pub https://raw.githubusercontent.com/sgerrand/alpine-pkg-node-bower/master/sgerrand.rsa.pub
RUN wget https://github.com/sgerrand/alpine-pkg-node-bower/releases/download/unreleased/node-bower-1.8.2-r0.apk
RUN apk add --no-cache node-bower-1.8.2-r0.apk

RUN bower --allow-root install -g

ENTRYPOINT ["/usr/share/nginx/html/entrypoint.sh"]

CMD ["nginx", "-g", "daemon off;"]
