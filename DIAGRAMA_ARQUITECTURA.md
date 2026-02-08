# Diagrama de Arquitectura - Like/Dislike App

```
┌─────────────────────────────────────────────────────────────────────┐
│                           USUARIO                                   │
│                        (Navegador Web)                              │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             │ HTTP
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      FRONTEND (React)                               │
│                      http://localhost                               │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │
│  │ CharacterCard│  │ StatsDisplay │  │   Loading    │               │
│  │  Component   │  │  Component   │  │  Component   │               │
│  └──────────────┘  └──────────────┘  └──────────────┘               │
│                                                                     │
│  ┌────────────────────────────────────────────────────┐             │
│  │           React Query (Estado + Cache)             │             │
│  └────────────────────────────────────────────────────┘             │
│                                                                     │
│  ┌────────────────────────────────────────────────────┐             │
│  │              Axios (API Service)                   │             │
│  └────────────────────────────────────────────────────┘             │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             │ REST API
                             │ (JSON)
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    BACKEND (NestJS)                                 │
│                  http://localhost:3000/api                          │
│                                                                     │
│  ┌────────────────────────────────────────────────────┐             │
│  │             Characters Controller                  │             │
│  │  • GET  /random          (personaje aleatorio)     │             │
│  │  • POST /vote            (votar like/dislike)      │             │
│  │  • GET  /stats           (estadísticas)            │             │
│  │  • GET  /most-liked      (más gustado)             │             │
│  │  • GET  /most-disliked   (más rechazado)           │             │
│  │  • GET  /pikachu/status  (status de pikachu)       │             │
│  └────────────────────────────────────────────────────┘             │
│                             │                                       │
│                             ▼                                       │
│  ┌────────────────────────────────────────────────────┐             │
│  │             Characters Service                     │             │
│  │  • Lógica de negocio                               │             │
│  │  • Procesamiento de votos                          │             │
│  │  • Cálculo de estadísticas                         │             │
│  └────────────────────────────────────────────────────┘             │
│            │                              │                         │
│            ▼                              ▼                         │
│  ┌──────────────────┐        ┌──────────────────────┐               │
│  │ External APIs    │        │  MongoDB (Mongoose)  │               │
│  │    Service       │        │                      │               │
│  └──────────────────┘        └──────────────────────┘               │
└────────┬─────────────────────────────┬──────────────────────────────┘
         │                             │
         │ HTTP                        │
         ▼                             ▼
┌─────────────────────┐    ┌──────────────────────────┐
│   APIS EXTERNAS     │    │   BASE DE DATOS          │
│                     │    │   (MongoDB Atlas)        │
│ • Rick & Morty API  │    │                          │
│ • Pokémon API       │    │  Collection: characters  │
│ • Superhero API     │    │  ┌────────────────────┐  │
│                     │    │  │ externalId         │  │
└─────────────────────┘    │  │ name               │  │
                           │  │ image              │  │
                           │  │ category           │  │
                           │  │ likes              │  │
                           │  │ dislikes           │  │
                           │  │ lastEvaluated      │  │
                           │  │ metadata           │  │
                           │  └────────────────────┘  │
                           └──────────────────────────┘
```

---

## Flujo de Datos Principal

```
1. Usuario hace clic en "Next Character"
                ↓
2. Frontend llama GET /api/characters/random
                ↓
3. Backend → External API Service
                ↓
4. Obtiene personaje aleatorio de Rick&Morty/Pokemon/Superhero
                ↓
5. Backend retorna personaje al Frontend
                ↓
6. Frontend muestra CharacterCard
                ↓
7. Usuario hace clic en "Like" o "Dislike"
                ↓
8. Frontend llama POST /api/characters/vote
                ↓
9. Backend → Characters Service
                ↓
10. Service verifica si existe en MongoDB
    ├─ SI EXISTE → Incrementa likes/dislikes
    └─ NO EXISTE → Crea nuevo documento
                ↓
11. Guarda en MongoDB
                ↓
12. Backend retorna personaje actualizado
                ↓
13. Frontend actualiza stats automáticamente
                ↓
14. Muestra siguiente personaje
```

---

## Despliegue con Docker

```
┌─────────────────────────────────────────────────────┐
│                  Docker Compose                     │
│                                                     │
│  ┌───────────────┐  ┌────────────┐  ┌────────────┐  │
│  │   Frontend    │  │  Backend   │  │  MongoDB   │  │
│  │   (Nginx)     │  │  (NestJS)  │  │   Local    │  │
│  │   Port: 80    │  │  Port:3000 │  │Port: 27017 │  │
│  │               │  │            │  │            │  │
│  └───────┬───────┘  └──────┬─────┘  └────┬───────┘  │
│          │                 │              │         │
│          └─────────────────┴──────────────┘         │
│                   Bridge Network                    │
└─────────────────────────────────────────────────────┘
         │
         │ docker-compose up
         ▼
    Corriendo en:
    - http://localhost (Frontend)
    - http://localhost:3000 (Backend)
```

---

## Estructura del Proyecto

```
like-dislike-app/
│
├── backend/                    # API NestJS
│   ├── src/
│   │   ├── characters/
│   │   │   ├── controllers/   # Endpoints REST
│   │   │   ├── services/      # Lógica de negocio
│   │   │   ├── entities/      # Modelos MongoDB
│   │   │   ├── dto/           # Validación de datos
│   │   │   └── interfaces/    # Tipos TypeScript
│   │   └── main.ts            # Entry point
│   ├── test/                  # Tests unitarios + E2E
│   ├── Dockerfile
│   └── package.json
│
├── frontend/                   # App React
│   ├── src/
│   │   ├── components/        # Componentes UI
│   │   ├── services/          # API calls (Axios)
│   │   ├── types/             # Tipos TypeScript
│   │   ├── App.tsx            # Componente principal
│   │   └── main.tsx           # Entry point
│   ├── Dockerfile
│   ├── nginx.conf             # Servidor web
│   └── package.json
│
├── docker-compose.yml          # Orquestación
└── README.md                   # Documentación
```

---

## Tecnologías Usadas

| Capa       | Tecnología                | Propósito                   |
|------------|---------------------------|-----------------------------|
| Frontend   | React + TypeScript        | Interfaz de usuario         |
|            | Vite                      | Build tool rápido           |
|            | Tailwind CSS              | Estilo minimalista y simple |
|            | Framer Motion             | Animaciones                 |
|            | React Query               | Estado + cache              |
| Backend    | NestJS + TypeScript       | API REST                    |
|            | Mongoose                  | ODM para MongoDB            |
|            | Swagger                   | Documentación API           |
|            | Axios                     | HTTP client                 |
| Base Datos | MongoDB                   | Base de datos NoSQL         |
| Deploy     | Docker + Docker Compose   | Uso de contenedores         |
|            | Nginx                     | Servidor web (frontend)     |