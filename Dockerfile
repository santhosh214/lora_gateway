# Dockerfile
FROM node:lts-alpine3.18

# Default directory.
ENV INSTALL_PATH /app
RUN mkdir -p $INSTALL_PATH

# Create app directory.
WORKDIR $INSTALL_PATH

# Installing pnpm globally.
RUN npm install -g pnpm

# Install dependencies.
COPY pnpm-lock.yaml ./
COPY package*.json ./

# Building code for production.
RUN pnpm fetch --prod
RUN pnpm install -r --prod --ignore-scripts

# Bundle app source.
COPY . .

EXPOSE 3001

CMD pnpm run start
