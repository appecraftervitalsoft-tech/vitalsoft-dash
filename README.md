# Gym Tracker - IronTrack Rutinas

Sistema completo de gestión de rutinas para gimnasios, socios y entrenadores con base de datos en tiempo real (Firebase Firestore).

## 🚀 Cómo ejecutarlo en tu computadora (Local)

1. **Requisitos previos**:
   - Tener instalado [Node.js](https://nodejs.org/) (versión 18 o superior).

2. **Instalar dependencias**:
   Abre una terminal en esta carpeta y ejecuta:
   ```bash
   npm install
   ```

3. **Iniciar en modo desarrollo**:
   ```bash
   npm run dev
   ```
   Abre tu navegador en `http://localhost:3000` (o el puerto que indique la consola).

4. **Compilar para producción**:
   ```bash
   npm run build
   ```
   Genera la carpeta `dist/` lista para subir a cualquier hosting.

---

## 🌐 Cómo publicarlo gratis en internet (Vercel / Netlify / Firebase)

### Opción A: Vercel (Recomendado - 2 minutos)
1. Sube este código a tu cuenta de **GitHub** (crea un repositorio nuevo y haz `git push`).
2. Entra en [vercel.com](https://vercel.com) e inicia sesión con GitHub.
3. Haz clic en **"Add New Project"**, selecciona el repositorio y presiona **"Deploy"**.
4. ¡Listo! Vercel te dará un enlace público tipo `mi-gym-tracker.vercel.app`.

### Opción B: Firebase Hosting
1. Instala Firebase CLI: `npm install -g firebase-tools`
2. Inicia sesión: `firebase login`
3. Despliega con: `npm run build && firebase deploy --only hosting`

---

## ✨ Funcionalidades principales

- **Portal de Alumnos**:
  - Ingreso ágil mediante DNI (sin necesidad de recordar contraseñas complejas).
  - Visualización del plan semanal (Día 1, Día 2, Día 3...).
  - Registro de series, pesos (kg), repeticiones y RPE logrados en tiempo real.
  - Temporizador integrado de descanso entre series (30s, 60s, 90s, 120s) con sonido de alerta.
  - Historial de entrenamientos y marcas personales (PRs).
  - Modo Tablet / Tótem para recepción de gimnasio y modo móvil responsive.

- **Portal de Profesores / Administradores**:
  - Gestión integral de alumnos (búsqueda rápida por nombre o DNI).
  - Creación y edición de rutinas personalizadas con biblioteca de ejercicios categorizados por grupo muscular.
  - Asignación de series, repeticiones objetivo y notas técnicas.
  - Registro inmediato de nuevos socios.
  - Sincronización en la nube con Firestore y almacenamiento seguro offline.
