FROM node as builder
WORKDIR /usr/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# FROM node
# WORKDIR /usr/app
# COPY package*.json ./
# RUN npm install --production

# COPY --from=builder /usr/app/build ./build
# ENV PG_HOST=localhost
# # COPY .env .
# EXPOSE 3334
# CMD node build/server.js

# Build final runtime container
FROM node
# Set environment variables
ENV NODE_ENV=production
# Disable .env file loading
ENV ENV_SILENT=true
# Listen to external network connections
# Otherwise it would only listen in-container ones
ENV HOST=0.0.0.0
# Set port to listen
ENV PORT=3334
# Set app key at start time
ENV APP_KEY=Xhv9yKujQsnpPF2QqUikLn1f1e_xAV-M
ENV DRIVE_DISK=local
ENV DB_CONNECTION=pg
ENV PG_HOST=127.0.0.1
ENV PG_PORT=5432
ENV PG_USER=devops
ENV PG_PASSWORD=Th1s1s4N3wpwd*.
ENV PG_DB_NAME=dbdocs

# Set home dir
WORKDIR /usr/app
# Copy over built files
COPY --from=builder /usr/app/build .
# Install only required packages
RUN npm ci --production
# Expose port to outside world
EXPOSE 3334
# Start server up
CMD [ "node", "server.js" ]