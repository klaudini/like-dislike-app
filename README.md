# 👺 Like/Dislike Personajes

Sistema de votación para personajes de Rick and Morty, Pokémon y Superhéroes.

---

## 📦 Inicio Rápido con Docker (RECOMENDADO)

### Requisitos
- **Docker Desktop** instalado (incluye Docker Compose)
- Credenciales para el ambiente enviadas por correo

### Instalación de Docker Desktop

#### **Windows / macOS**
1. Descargar Docker Desktop desde [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)
2. Ejecutar el instalador
3. Reiniciar el sistema si es necesario
4. Verificar instalación:
```bash
docker --version
docker-compose --version
```

#### **Linux (Ubuntu/Debian)**
```bash
# Instalar Docker
sudo apt-get update
sudo apt-get install docker.io

# Instalar Docker Compose
sudo apt-get install docker-compose

# Agregar usuario al grupo docker (evitar usar sudo)
sudo usermod -aG docker $USER
newgrp docker

# Verificar instalación
docker --version
docker-compose --version
```

#### **Linux (Fedora/RHEL/CentOS)**
```bash
# Instalar Docker
sudo dnf install docker

# Instalar Docker Compose
sudo dnf install docker-compose

# Iniciar Docker
sudo systemctl start docker
sudo systemctl enable docker

# Agregar usuario al grupo docker
sudo usermod -aG docker $USER
newgrp docker

# Verificar instalación
docker --version
docker-compose --version
```

#### **macOS (Homebrew)**
```bash
brew install --cask docker
# O descargar Docker Desktop desde docker.com
```

---

### Pasos de Ejecución

1. **Clonar el repositorio**
```bash
git clone https://github.com/klaudini/like-dislike-app.git
cd like-dislike-app
```

2. **Configurar credenciales**

Crear archivo `backend/.env`:
```env
Descompromir env.zip enviado por correo y copiar contenido de env_back en el .env creado.
```

Crear archivo `frontend/.env`:
```env
Descompromir env.zip enviado por correo y copiar contenido de env_front en el .env creado.
```

3. **Levantar todo**
```bash
docker-compose up
```

O en modo detached (segundo plano):
```bash
docker-compose up -d
```

4. **Abrir en el navegador**
- **Frontend:** http://localhost
- **Backend API:** http://localhost:3000
- **Swagger Docs:** http://localhost:3000/api/docs

---

### Comandos Útiles de Docker
```bash
# Ver logs en tiempo real
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f backend
docker-compose logs -f frontend

# Detener todo
docker-compose down

# Detener y eliminar volúmenes (limpiar base de datos)
docker-compose down -v

# Reconstruir imágenes (después de cambios en código)
docker-compose build
docker-compose up --build

# Ver contenedores corriendo
docker ps

# Entrar a un contenedor
docker exec -it like-dislike-backend sh
docker exec -it like-dislike-mongodb mongosh
```

---

## 📋 Instalación Manual (Sin Docker)

### Requisitos
- **Node.js v18+** ([Descargar aquí](https://nodejs.org))
- **MongoDB** local o Atlas URI
- Credenciales de acceso (enviadas por correo)

### Backend
```bash
cd backend
npm install

# Crear .env con las credenciales enviadas al correo
# Descompromir env.zip enviado por correo y copiar contenido de env_back en el .env creado.

npm run start:dev
```

### Frontend
```bash
cd frontend
npm install

# Crear .env con la URL del backend
# Descompromir env.zip enviado por correo y copiar contenido de env_front en el .env creado.

npm run dev
```

### MongoDB Local
```bash
# Instalar MongoDB (Ubuntu)
sudo apt-get install mongodb

# O usar Docker solo para MongoDB
docker run -d -p 27017:27017 --name mongodb mongo:7.0
```

---

## 📁 Estructura del Proyecto
```
like-dislike-app/
├── backend/              # NestJS API
│   ├── src/
│   ├── test/
│   ├── Dockerfile
│   └── package.json
├── frontend/             # React App
│   ├── src/
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── docker-compose.yml    # Orquestación de servicios
├── DIAGRAMA_ARQUITECTURA.md
└── README.md
```

---

## 🛠 Stack Tecnológico

**Backend:**
- NestJS (Framework)
- TypeScript
- MongoDB + Mongoose
- Swagger/OpenAPI (Documentación)
- Jest (Testing)

**Frontend:**
- React 18
- TypeScript
- Vite (Build tool)
- Tailwind CSS
- Framer Motion (Animaciones)

**Infraestructura:**
- Docker + Docker Compose
- Nginx (Servidor web)
- MongoDB Atlas (Base de datos cloud)

---

## 🧪 Testing
```bash
# Backend - Tests unitarios
cd backend
npm test

# Backend - Tests E2E
npm run test:e2e

# Backend - Coverage
npm run test:cov

```

---

## 📚 Documentación Adicional

- [Diagrama de Arquitectura](DIAGRAMA_ARQUITECTURA.md)
- [Swagger API Docs](http://localhost:3000/api/docs) (después de levantar el backend)

---

## 🐛 Problemas?

### "Port 80 is already allocated"
```bash
# Opción 1: Detener servicios
docker-compose down

# Opción 2: Cambiar puerto en docker-compose.yml
# Cambiar "80:80" a "8080:80" en el servicio frontend
```

### "Port 3000 is already allocated"
```bash
# Verificar qué proceso usa el puerto
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Matar el proceso o cambiar puerto en docker-compose.yml
```

### Backend no conecta a MongoDB
```bash
# Ver logs de MongoDB
docker-compose logs mongodb

# Reiniciar servicios
docker-compose restart backend

# Verificar que MongoDB esté corriendo
docker ps | grep mongodb
```

### Frontend muestra "Network Error"
```bash
# Verificar que backend esté corriendo
curl http://localhost:3000/api/characters/stats

# Ver logs del backend
docker-compose logs backend

# Verificar variable VITE_API_URL en frontend/.env
```

### "Cannot connect to Docker daemon"
```bash
# Linux: Iniciar Docker
sudo systemctl start docker

# macOS/Windows: Abrir Docker Desktop
```

### Limpiar todo y empezar de nuevo
```bash
# Detener todo y borrar volúmenes
docker-compose down -v

# Borrar imágenes (opcional)
docker rmi like-dislike-app-backend like-dislike-app-frontend

# Reconstruir desde cero
docker-compose build --no-cache
docker-compose up
```



---

## 📧 Contacto

Si tienes problemas con las credenciales o la configuración:

**Email:** claudiocisterna3@gmail.com  
**GitHub:** [@klaudini](https://github.com/klaudini)

---

## 📄 Licencia

MIT
