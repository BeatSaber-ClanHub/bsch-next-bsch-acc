FROM node:latest

WORKDIR /app

COPY package*.json ./

RUN npm install --force 

COPY prisma ./prisma/

RUN npx prisma generate --no-engine

COPY . .

ENV PORT=3000

EXPOSE 8080

RUN npm run build
CMD ["npm", "start"]
