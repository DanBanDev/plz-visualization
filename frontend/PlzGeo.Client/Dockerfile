# Build Stage
FROM node:24 AS build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# Runtime Stage
FROM nginx:alpine

COPY --from=build /app/dist/plz-geo.client/browser /usr/share/nginx/html

EXPOSE 80