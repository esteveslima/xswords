
FROM node:12-alpine as nodeBuilderStage


RUN apk add --no-cache curl && \
    apk add --no-cache bash   


WORKDIR /container


COPY package.json .

RUN npm install --only=production


COPY . .


HEALTHCHECK --interval=5m --timeout=10s --start-period=10s --retries=5 CMD curl -f http://localhost:5001/ || exit 1


EXPOSE 5001


CMD [ "npm", "start" ]







