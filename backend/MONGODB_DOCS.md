# Documentación de MongoDB - Colección Personajes

## Estructura de la Base de Datos

### Base de Datos
**Nombre:** `like-dislike-db`

### Colección
**Nombre:** `characters`

---

## Schema del Documento

```typescript
{
  _id: ObjectId,              // ID generado automáticamente por MongoDB
  externalId: String,         // ID único del personaje (ej: "pokemon-25", "rick-1", "hero-644")
  name: String,               // Nombre del personaje
  image: String,              // URL de la imagen
  category: String,           // Categoría: "rickandmorty" | "pokemon" | "superhero"
  likes: Number,              // Contador de likes (default: 0)
  dislikes: Number,           // Contador de dislikes (default: 0)
  lastEvaluated: Date,        // Fecha de última evaluación
  metadata: Object,           // Información adicional del personaje
  createdAt: Date,            // Fecha de creación (automático)
  updatedAt: Date             // Fecha de actualización (automático)
}
```

---

## Índices

La colección tiene los siguientes índices para optimizar consultas:

```javascript
// Índice único en externalId
{ externalId: 1 } // unique: true

// Índices compuestos para estadísticas
{ category: 1, likes: -1 }
{ category: 1, dislikes: -1 }

// Índice para último evaluado
{ lastEvaluated: -1 }
```

---

## Ejemplos de Documentos

### 1. Pokémon - Pikachu

```json
{
  "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
  "externalId": "pokemon-25",
  "name": "Pikachu",
  "image": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png",
  "category": "pokemon",
  "likes": 150,
  "dislikes": 5,
  "lastEvaluated": "2024-02-05T10:30:00.000Z",
  "metadata": {
    "height": 4,
    "weight": 60,
    "types": ["electric"]
  },
  "createdAt": "2024-01-15T08:00:00.000Z",
  "updatedAt": "2024-02-05T10:30:00.000Z"
}
```

**Campos calculados (virtuals):**
```json
{
  "totalVotes": 155,
  "likePercentage": 97
}
```

---

### 2. Rick and Morty - Rick Sanchez

```json
{
  "_id": "65a1b2c3d4e5f6g7h8i9j0k2",
  "externalId": "rick-1",
  "name": "Rick Sanchez",
  "image": "https://rickandmortyapi.com/api/character/avatar/1.jpeg",
  "category": "rickandmorty",
  "likes": 89,
  "dislikes": 45,
  "lastEvaluated": "2024-02-05T09:15:00.000Z",
  "metadata": {
    "status": "Alive",
    "species": "Human",
    "gender": "Male",
    "origin": "Earth (C-137)",
    "location": "Citadel of Ricks"
  },
  "createdAt": "2024-01-20T12:00:00.000Z",
  "updatedAt": "2024-02-05T09:15:00.000Z"
}
```

**Campos calculados:**
```json
{
  "totalVotes": 134,
  "likePercentage": 66
}
```

---

### 3. Superhero - Batman

```json
{
  "_id": "65a1b2c3d4e5f6g7h8i9j0k3",
  "externalId": "hero-70",
  "name": "Batman",
  "image": "https://www.superherodb.com/pictures2/portraits/10/100/639.jpg",
  "category": "superhero",
  "likes": 200,
  "dislikes": 10,
  "lastEvaluated": "2024-02-05T11:45:00.000Z",
  "metadata": {
    "fullName": "Bruce Wayne",
    "alignment": "good",
    "publisher": "DC Comics",
    "gender": "Male",
    "race": "Human",
    "powerstats": {
      "intelligence": "100",
      "strength": "26",
      "speed": "27",
      "durability": "50",
      "power": "47",
      "combat": "100"
    }
  },
  "createdAt": "2024-01-18T14:30:00.000Z",
  "updatedAt": "2024-02-05T11:45:00.000Z"
}
```

**Campos calculados:**
```json
{
  "totalVotes": 210,
  "likePercentage": 95
}
```

---

## Consultas Útiles (MongoDB Shell)

### Obtener personaje más votado (likes)
```javascript
db.characters.findOne().sort({ likes: -1 })
```

### Obtener personaje más rechazado (dislikes)
```javascript
db.characters.findOne().sort({ dislikes: -1 })
```

### Obtener último personaje evaluado
```javascript
db.characters.findOne().sort({ lastEvaluated: -1 })
```

### Obtener todos los Pokémon
```javascript
db.characters.find({ category: "pokemon" })
```

### Obtener estadísticas de Pikachu
```javascript
db.characters.findOne({ externalId: "pokemon-25" })
```

### Contar total de personajes evaluados
```javascript
db.characters.countDocuments()
```

### Obtener total de votos (agregación)
```javascript
db.characters.aggregate([
  {
    $group: {
      _id: null,
      totalLikes: { $sum: "$likes" },
      totalDislikes: { $sum: "$dislikes" },
      totalVotes: { $sum: { $add: ["$likes", "$dislikes"] } }
    }
  }
])
```

### Top 5 personajes más populares
```javascript
db.characters.find().sort({ likes: -1 }).limit(5)
```

### Personajes por categoría con estadísticas
```javascript
db.characters.aggregate([
  {
    $group: {
      _id: "$category",
      count: { $sum: 1 },
      totalLikes: { $sum: "$likes" },
      totalDislikes: { $sum: "$dislikes" },
      avgLikes: { $avg: "$likes" }
    }
  }
])
```

---

## Validaciones de Schema

El schema incluye las siguientes validaciones:

- **externalId**: Requerido, único
- **name**: Requerido
- **image**: Requerido
- **category**: Requerido, debe ser uno de: `rickandmorty`, `pokemon`, `superhero`
- **likes**: Mínimo 0 (no puede ser negativo)
- **dislikes**: Mínimo 0 (no puede ser negativo)

---

## Ejemplo de Respuesta de API

Cuando la API retorna un personaje, incluye los campos calculados:

```json
{
  "externalId": "pokemon-25",
  "name": "Pikachu",
  "image": "https://...",
  "category": "pokemon",
  "likes": 150,
  "dislikes": 5,
  "totalVotes": 155,
  "likePercentage": 97,
  "lastEvaluated": "2024-02-05T10:30:00.000Z",
  "metadata": {
    "height": 4,
    "weight": 60,
    "types": ["electric"]
  }
}
```
