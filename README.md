# Kanban Typescript API

Este proyecto es una API Rest en Typescript hecha en express con PostgreSQL como base de datos.

## Instalación

Para instalar localmente seguir estos pasos:

1- Clonar repositorio
```bash
git clone https://github.com/pertinaz/docker-api.git
cd docker-api
```

2- Instalar dependencias
```bash
npm install
```

3- Configurar base de datos en PostgreSQL y alterar las variables de entorno (mirar .env.example)

4- Puedes usar tsx para ejecutar directamente el typescript
```bash
npm install tsx
tsx main.ts
```

o utilizar el script 'npm run prod' para compilarlo y luego usar node
```bash
npm run prod
node main.js
```
