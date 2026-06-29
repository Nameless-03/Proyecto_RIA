# LittleBox Games — Explorador de Videojuegos

Proyecto desarrollado para el **Taller de RIA (Laboratorio 2026)**.

### Integrantes:
*   Felipe Bernardi
*   Anthony Curbelo
*   Guzmán Perera
*   Joaquín Bassini

---

## 🎮 Descripción de la Aplicación
LittleBox Games es una Single Page Application (SPA) para la exploración multimedia de videojuegos. Permite buscar títulos, filtrar por géneros, ordenar resultados, gestionar una lista de favoritos, añadir juegos a un carrito de compras y personalizar la experiencia mediante preferencias de usuario.

La aplicación está diseñada bajo el enfoque de **Offline-First**, permitiendo navegar por el catálogo, buscar y consultar fichas de detalles sin conexión a internet gracias al uso de bases de datos locales y Service Workers.

---

## 🛠️ Tecnologías y Arquitectura

*   **Framework principal:** Vue 3 (Composition API) con Vite como herramienta de construcción.
*   **Gestión de estado global:** Pinia.
*   **Enrutado:** Vue Router (con Lazy Loading de componentes para optimización).
*   **Estilos:** CSS3 Vanilla unificado en un archivo de diseño global (`assets/main.css`) bajo nomenclatura semántica y responsive design.
*   **Persistencia:**
    *   `sessionStorage`: Gestión de sesión de usuario simulada.
    *   `localStorage`: Preferencias de interfaz (Tema claro/oscuro, moneda de visualización, API Key de RAWG) y persistencia del Carrito de Compras.
    *   `IndexedDB` (a través de una capa nativa en `dbService.js`): Almacenamiento local de listados de juegos consultados, fichas técnicas de detalle y consultas del motor de traducción.
*   **Soporte Offline (PWA):** Service Worker nativo (`public/sw.js`) con estrategias diferenciadas:
    *   *Cache-First* para recursos locales del shell.
    *   *Stale-While-Revalidate* para peticiones a APIs externas e imágenes de portada (RAWG, Steam y CheapShark), con soporte para respuestas opacas.
*   **Traducción Dinámica:** Integración con la API de traducción de Google para adaptar las fichas técnicas al idioma preferido del usuario.

---

## 🔌 Orígenes de Datos (APIs)
La aplicación cuenta con una arquitectura de servicio flexible con soporte de fallback:

1.  **RAWG API (Principal):** Proporciona la base de datos de videojuegos más completa. Requiere configurar una API Key de RAWG.io (se puede ingresar en la pestaña de **Perfil**).
2.  **CheapShark API (Respaldo/CORS):** Si no se configura una API Key de RAWG o la cuota se agota, el sistema cambia automáticamente a CheapShark de forma transparente, recuperando ofertas de PC y mapeándolas al modelo de datos de la aplicación.
3.  **Mock Games (Local):** En caso de desconexión absoluta y ausencia de datos previos en el caché, la app utiliza una lista de juegos mock locales para garantizar la usabilidad.

---

## 🚀 Instalación y Ejecución

### 1. Clonar el repositorio e instalar dependencias
```bash
npm install
```

### 2. Ejecutar el servidor de desarrollo local
```bash
npm run dev
```
La aplicación estará disponible en `http://localhost:5173` (o el puerto configurado por Vite).

### 3. Compilar para producción
Genera el paquete optimizado y minificado en la carpeta `dist/`.
```bash
npm run build
```

### 4. Analizar código con el Linter
Ejecuta Oxlint y ESLint para validar la sintaxis y el formato del proyecto.
```bash
npm run lint
```
