FROM node:20
RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
RUN mkdir -p /run/jitsi-admin-matrix-bot && chown -R node:node /run/jitsi-admin-matrix-bot
USER root
WORKDIR /home/node/app

COPY --chown=node:node package*.json ./

RUN npm ci --omit=dev

RUN apt update && apt install -y socat

USER node
COPY --chown=node:node . .
RUN ["chmod", "755", "index.mjs"]

CMD [ "node", "index.mjs" ]
