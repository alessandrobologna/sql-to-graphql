FROM node:8

COPY dist /dist
COPY src /src
COPY .babelrc /
COPY package.json /
RUN npm install && npm run build && cd /dist && npm install && rm -rf /src /node_modules
WORKDIR /dist
ENTRYPOINT ["npm"]
CMD ["start"]


