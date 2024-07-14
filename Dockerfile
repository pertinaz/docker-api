# Usa la imagen oficial de Node.js
FROM node:14

# Establece el directorio de trabajo
WORKDIR /usr/src/main.ts

# Copia los archivos de tu proyecto
COPY package*.json ./
RUN npm install

COPY . .

# Expone el puerto en el que corre la API
EXPOSE 4000

# Comando para iniciar la aplicación
CMD ["node", "build/index.js"]
