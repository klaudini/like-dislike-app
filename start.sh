#!/bin/bash

echo "Like/Dislike Personajes - Instalación"
echo "===================================="
echo ""

# Verifica si Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado"
    echo "Por favor instala Docker Desktop desde: https://www.docker.com/products/docker-desktop"
    exit 1
fi

echo "✅ Docker instalado"

# Verifica si docker-compose está disponible
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose no está disponible"
    exit 1
fi

echo "✅ docker-compose disponible"
echo ""

# Verifica .env
if [ ! -f .env ]; then
    echo "⚠️  Archivo .env no encontrado"
    echo "Creando .env desde .env.docker.example..."
    cp .env.docker.example .env
    echo ""
    echo "⚠️  IMPORTANTE: Edita el archivo .env y agrega tu SUPERHERO_API_KEY"
    echo "   Obtén tu key en: https://superheroapi.com/"
    echo ""
    read -p "Presiona Enter cuando hayas configurado el .env..."
fi

echo ""
echo "Iniciando servicios..."
echo ""

docker-compose up -d

echo ""
echo "✅ Servicios iniciados!"
echo ""
echo "📱 Accede a la aplicación:"
echo "   Frontend: http://localhost"
echo "   Backend:  http://localhost:3000"
echo "   Swagger:  http://localhost:3000/api/docs"
echo ""
echo "Para ver logs: docker-compose logs -f"
echo "Para detener:  docker-compose down"
echo ""
