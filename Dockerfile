## this is the stage one , also know as the build step

FROM node:lts
WORKDIR /usr/src/app
COPY package*.json ./
COPY . .
RUN npm install
RUN npm run build

## this is stage two , where the app actually runs

FROM node:lts

WORKDIR /usr/src/app
COPY package*.json ./
COPY tsconfig-paths-bootstrap.js ./
COPY .env ./
COPY tsconfig.json ./
COPY tsconfig.release.json ./
RUN npm install --only=production
COPY --from=0 /usr/src/app/build ./build
COPY --from=0 /usr/src/app/docs ./docs
# Start
CMD [ "npm", "start" ]

EXPOSE 8080