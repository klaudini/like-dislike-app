# 👺 Like/Dislike Personajes

Sistema de votación para personajes de Rick and Morty, Pokémon y Superhéroes.

---

## Inicio Rápido con Docker (RECOMENDADO)

### Requisitos
- **Docker Desktop** instalado ([Descargar aquí](https://www.docker.com/products/docker-desktop))
- Credenciales para el ambiente enviadas por correo.

### Pasos

1. **Clonar el repositorio**
```bash
git clone https://github.com/klaudini/like-dislike-app.git
cd like-dislike-app
```

2. **Configurar credenciales del backend**
```bash
# Crear archivo .env uno dentro de backend/ y otro en frontend/ con las credenciales enviadas por correo
```

3. **Levantar todo**
```bash
docker-compose up
```

4. **Abrir en el navegador**
- Frontend: http://localhost
- Backend API: http://localhost:3000
- Swagger Docs: http://localhost:3000/api/docs

### Detener

```bash
docker-compose down
```

### Limpiar todo (borrar datos)

```bash
docker-compose down -v
```

---

## 📋 Instalación Manual (Sin Docker)

### Requisitos
- Node.js v18+
- Credenciales de acceso (enviadas por correo)

### Backend

```bash
cd backend
npm install
# Crear .env con credenciales del correo
npm run start:dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 📁 Estructura

```
like-dislike-app/
├── backend/          # NestJS API
├── frontend/         # React App
├── docker-compose.yml
└── README.md
```

---

## 🛠 Tecnologías

**Backend:** NestJS, TypeScript, MongoDB, Swagger  
**Frontend:** React, TypeScript, Vite, Tailwind  
**Infraestructura:** Docker, Docker Compose, Nginx

---

## 📚 Documentación

- [Diagrama de Arquitectura](DIAGRAMA_ARQUITECTURA.md)

---

## 🐛 Problemas?

### "Port already in use"
```bash
docker-compose down
# Cambiar puertos en docker-compose.yml si es necesario
```

### Backend no conecta a MongoDB
```bash
docker-compose logs mongodb
docker-compose restart backend
```

### Frontend no se conecta al backend
- Verifica que el backend esté corriendo
- Revisa logs: `docker-compose logs backend`

---

## 📧 Contacto

Si tienes problemas con las credenciales, envìame un correo a claudiocisterna3@gmail.com

---

## 📄 Licencia

MIT