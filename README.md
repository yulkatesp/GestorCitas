<div align="center">

# Sistema de Gestión de Citas Médicas

**Aplicación web fullstack para agendar y gestionar citas médicas en una clínica**

![Node.js](https://img.shields.io/badge/NODE.JS-18+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/EXPRESS-4.x-000000?style=for-the-badge&logo=express&logoColor=white)
![JavaScript](https://img.shields.io/badge/JAVASCRIPT-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![NeDB](https://img.shields.io/badge/NEDB-4.x-4A7C6F?style=for-the-badge&logoColor=white)
![Railway](https://img.shields.io/badge/RAILWAY-DEPLOY-0B0D0E?style=for-the-badge&logo=railway&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-AUTH-d63aff?style=for-the-badge&logo=jsonwebtokens&logoColor=white)

</div>

## Despliegue (Railway)

[![Despliegue](frontend/img/Portada.png)](https://gestorcitas-production.up.railway.app/)

Haz click en la imagen para poder acceder a la página.

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
