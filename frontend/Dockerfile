FROM node:lts

WORKDIR /code

COPY package.json /code/package.json
COPY package-lock.json /code/package-lock.json

RUN npm ci

COPY . /code

ENTRYPOINT ["npm", "run", "dev"]