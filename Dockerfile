# syntax=docker/dockerfile:1
FROM node:16-alpine

# Add repo for Python 3.7
RUN echo 'http://dl-cdn.alpinelinux.org/alpine/v3.10/main' >> /etc/apk/repositories

RUN apk update
RUN apk add --update --no-cache python3==3.7.10-r0 g++
WORKDIR /app
COPY . .
RUN yarn install
RUN pip3 install -r build/src/public/python/requirements.txt
#CMD ["sleep", "6000"]
CMD ["node", "build/index.js"]
