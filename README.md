# Sistema de Gestión de Citas Médicas

Aplicación web fullstack para agendar y gestionar citas médicas en una clínica.

## Despliegue (Railway)

<!-- Sube tu video a YouTube y reemplaza VIDEO_ID con el id del video -->
[![Despliegue](frontend/img/Portada.png)](https://gestorcitas-production.up.railway.app/)

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | HTML5, CSS3, JavaScript vanilla |
| Backend | Node.js + Express.js |
| Base de datos | SQLite (better-sqlite3) |
| Autenticación | JWT + bcrypt |
| Despliegue | Railway / Render |
| Control de versiones | Git + GitHub |

## Estructura del proyecto

```
clinica-citas/
├── backend/
│   ├── controllers/        # Lógica de negocio
│   ├── middleware/         # Verificación JWT
│   ├── models/             # Acceso a datos
│   ├── routes/             # Endpoints de la API
│   ├── database.js         # Configuración SQLite
│   └── server.js           # Punto de entrada
├── frontend/
│   ├── pages/              # Vistas HTML
│   ├── css/styles.css
│   └── js/
└── docs/                   # Informes de calidad y seguridad
```

## Instalación local

```bash
git clone https://github.com/TU_USUARIO/clinica-citas.git
cd clinica-citas/backend
npm install
cp .env.example .env
npm start
```

El servidor corre en `http://localhost:3000`

## API Endpoints

### Usuarios
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | /api/users/register | Registrar usuario |
| POST | /api/users/login | Iniciar sesión |

### Citas
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | /api/citas | Crear cita |
| GET | /api/citas | Mis citas |
| GET | /api/citas/disponibilidad | Horarios disponibles |
| DELETE | /api/citas/:id | Cancelar cita |

### Admin
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/admin/citas | Todas las citas |
| GET | /api/admin/medicos | Lista de médicos |

## Seguridad
- Contraseñas cifradas con bcrypt
- Autenticación mediante JWT
- Validación de entradas
- Headers de seguridad con helmet.js

## Sprints
- **Sprint 1**: Registro e inicio de sesión
- **Sprint 2**: Agendamiento de citas
- **Sprint 3**: Panel administrativo
