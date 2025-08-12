FROM node:18

WORKDIR /app

COPY package*.json ./

# Install dependencies + required MUI peer deps
RUN npm install @emotion/react @emotion/styled
RUN npm install

COPY . .

EXPOSE 3000
CMD ["npm", "start"]
