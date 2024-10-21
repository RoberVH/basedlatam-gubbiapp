# Container for Ofertika server Ofersrv
# Agosto 2019

FROM node:8.11-alpine
MAINTAINER Roberto Vicuna <roberto.vicuna@gmail.com>

WORKDIR /usr/src/srv

COPY package*.json ./

RUN apk --no-cache add --virtual builds-deps build-base python p7zip

RUN npm install

RUN npm rebuild bcrypt --build-from-source .

COPY . . 

EXPOSE 4000

CMD ["npm", "start"]



