<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

Backend para el sistema FisioLab - Diagnóstico de Espasticidad

Sistema de gestión para el diagnóstico y seguimiento de pacientes con espasticidad. Permite a los médicos crear citas, recopilar respuestas de pacientes, generar diagnósticos y comparar evaluaciones de diferentes herramientas de IA.

## Características

- ✅ Gestión de médicos y pacientes
- ✅ Catálogo de tratamientos
- ✅ Asignación de tratamientos a pacientes
- ✅ Sistema de citas con múltiples estados
- ✅ Cuestionarios personalizables
- ✅ Respuestas numéricas a preguntas
- ✅ Generación de diagnósticos
- ✅ Integración con múltiples herramientas de IA (ChatGPT, Copilot)
- ✅ Comparación y selección de evaluaciones de IA
- ✅ Sistema de logs para auditoría

## Estructura de Módulos

- **Doctors**: Gestión de médicos
- **Patients**: Gestión de pacientes
- **Treatments**: Catálogo de tratamientos disponibles
- **Patient Treatments**: Asignación de tratamientos a pacientes
- **Questions**: Preguntas/indicadores para evaluación
- **Appointments**: Citas de evaluación
- **Appointment Answers**: Respuestas de los pacientes
- **Diagnoses**: Diagnósticos generados
- **AI Tools**: Herramientas de IA disponibles
- **AI Evaluations**: Evaluaciones generadas por IA
- **System Logs**: Registro de acciones del sistema

## Requisitos Previos

- Node.js (v18 o superior)
- PostgreSQL (v12 o superior)
- npm o yarn

## Instalación

1. Clonar el repositorio
```bash
git clone <repository-url>
cd back-espasticidad
```

2. Instalar dependencias
```bash
npm install
```

3. Configurar variables de entorno

Crear un archivo `.env` en la raíz del proyecto:

```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=tu_usuario
DATABASE_PASSWORD=tu_contraseña
DATABASE_NAME=espasticidad_db

# Server
PORT=3030

# Frontend URLs (separadas por comas)
FRONTEND_URL=http://localhost:3000,http://localhost:3001
```

4. Crear la base de datos

Ejecutar el script SQL proporcionado en `base.sql`:

```bash
psql -U tu_usuario -d espasticidad_db -f base.sql
```

O importar manualmente el archivo `base.sql` en tu cliente de PostgreSQL.

## Ejecutar la Aplicación

```bash
# Modo desarrollo (con hot-reload)
$ npm run start:dev

# Modo producción
$ npm run start:prod

# Modo normal
$ npm run start
```

Una vez iniciado, la API estará disponible en:
- **API**: `http://localhost:3030`
- **Swagger Documentation**: `http://localhost:3030/api`

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Documentación de la API

Para una documentación completa y detallada de todos los endpoints, consulta el archivo [API_DOCUMENTATION.md](./API_DOCUMENTATION.md).

La documentación incluye:
- Descripción de todos los módulos
- Endpoints disponibles con ejemplos
- Formatos de request y response
- Flujos de trabajo completos
- Ejemplos de código para Flutter
- Guías de implementación

## Estructura del Proyecto

```
src/
├── modules/           # Módulos de la aplicación
│   ├── doctors/       # Gestión de médicos
│   ├── patient/       # Gestión de pacientes
│   ├── treatments/    # Catálogo de tratamientos
│   ├── patient-treatments/  # Tratamientos asignados
│   ├── questions/     # Preguntas/indicadores
│   ├── appointments/  # Citas
│   ├── appointment-answers/  # Respuestas
│   ├── diagnoses/     # Diagnósticos
│   ├── ai-tools/      # Herramientas de IA
│   ├── ai-evaluations/  # Evaluaciones de IA
│   └── system-logs/   # Logs del sistema
├── auth/              # Autenticación y autorización
├── common/            # Utilidades compartidas
└── config/            # Configuración
```

## Tecnologías Utilizadas

- **NestJS**: Framework de Node.js
- **TypeORM**: ORM para PostgreSQL
- **PostgreSQL**: Base de datos
- **Swagger**: Documentación de API
- **class-validator**: Validación de DTOs
- **JWT**: Autenticación

## Flujo de Trabajo Típico

1. **Crear/Seleccionar Paciente**: Registrar o buscar un paciente
2. **Asignar Tratamiento**: Vincular un tratamiento al paciente con un médico
3. **Crear Cita**: Programar una nueva evaluación
4. **Recopilar Respuestas**: El paciente responde las preguntas
5. **Generar Diagnóstico**: El sistema genera un diagnóstico basado en las respuestas
6. **Evaluaciones de IA**: Se generan evaluaciones usando diferentes herramientas de IA
7. **Seleccionar Mejor Evaluación**: El médico selecciona la evaluación más precisa
8. **Completar Cita**: Finalizar la evaluación

## Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## License

Este proyecto está bajo la Licencia MIT.
