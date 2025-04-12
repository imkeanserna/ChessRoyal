FROM node:20-alpine

WORKDIR /app

# Copy root workspace files
COPY package.json pnpm-workspace.yaml ./

# Copy the socket-server package
COPY apps/socket-server ./apps/socket-server/

# Copy dependency packages
COPY packages/chess ./packages/chess/
COPY packages/typescript-config ./packages/typescript-config/
COPY packages/prisma-db ./packages/prisma-db/
COPY packages/store ./packages/store/
COPY packages/ui ./packages/ui/
COPY packages/eslint-config ./packages/eslint-config/

# Install pnpm
RUN npm install -g pnpm

# Install dependencies without requiring a lockfile
RUN pnpm install

# Generate Prisma client
RUN cd apps/socket-server && pnpm db:generate

# Build the socket server
RUN cd apps/socket-server && pnpm build

# Set environment variables
ENV NODE_ENV production
ENV PORT 3001

# Expose the port
EXPOSE ${PORT}

# Set the working directory to the socket-server directory
WORKDIR /app/apps/socket-server

# Start the socket server
CMD ["node", "dist/index.js"]
