FROM node:19-alpine

#RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
RUN mkdir -p /opt/app
WORKDIR /home/node/app
COPY package*.json ./
USER root
RUN npm install
COPY --chown=node:node . .
RUN npm run build
EXPOSE 7777

CMD [ "npm", "start" ]
