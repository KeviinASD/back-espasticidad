# Documentación de API - FisioLab Backend

## Descripción General

Esta API REST proporciona los endpoints necesarios para gestionar el sistema de diagnóstico de espasticidad. Está construida con NestJS y utiliza PostgreSQL como base de datos.

**Base URL**: `http://localhost:3030` (o la URL configurada en tu servidor)

**Formato de Respuesta**: JSON

**Autenticación**: Bearer Token (JWT) - cuando sea necesario

---

## Índice de Módulos

1. [Users (Usuarios/Médicos)](#1-users-usuariosmédicos)
2. [Patients (Pacientes)](#2-patients-pacientes)
3. [Treatments (Tratamientos)](#3-treatments-tratamientos)
4. [Patient Treatments (Tratamientos de Pacientes)](#4-patient-treatments-tratamientos-de-pacientes)
5. [Questions (Preguntas)](#5-questions-preguntas)
6. [Appointments (Citas)](#6-appointments-citas)
7. [Appointment Answers (Respuestas de Citas)](#7-appointment-answers-respuestas-de-citas)
8. [Diagnoses (Diagnósticos)](#8-diagnoses-diagnósticos)
9. [AI Tools (Herramientas de IA)](#9-ai-tools-herramientas-de-ia)
10. [AI Evaluations (Evaluaciones de IA)](#10-ai-evaluations-evaluaciones-de-ia)
11. [System Logs (Logs del Sistema)](#11-system-logs-logs-del-sistema)

---

## 1. Users (Usuarios/Médicos)

**Nota Importante**: Los médicos ahora son usuarios del sistema. Todos los médicos deben registrarse e iniciar sesión usando el sistema de autenticación. La entidad `User` unifica tanto la funcionalidad de autenticación como la información del médico.

### Endpoints

#### Registro de Usuario (Médico)
```http
POST /auth/register
Content-Type: application/json
```

**Request Body:**
```json
{
  "username": "jperez",
  "email": "juan.perez@example.com",
  "password": "password123",
  "fullName": "Dr. Juan Pérez"
}
```

**Response (201 Created):**
```json
{
  "user": {
    "id": 1,
    "username": "jperez",
    "email": "juan.perez@example.com",
    "fullName": "Dr. Juan Pérez",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "roleTier": "User"
  },
  "acces_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Iniciar Sesión
```http
POST /auth/login
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "juan.perez@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "user": {
    "id": 1,
    "username": "jperez",
    "email": "juan.perez@example.com",
    "fullName": "Dr. Juan Pérez",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "roleTier": "User"
  },
  "acces_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Obtener Información del Usuario Actual
```http
GET /auth/me
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "sub": 1,
  "id": 1,
  "username": "jperez",
  "email": "juan.perez@example.com",
  "fullName": "Dr. Juan Pérez"
}
```

#### Crear Usuario (Admin)
```http
POST /users
Content-Type: application/json
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "username": "jperez",
  "email": "juan.perez@example.com",
  "password": "password123",
  "fullName": "Dr. Juan Pérez"
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "username": "jperez",
  "email": "juan.perez@example.com",
  "fullName": "Dr. Juan Pérez",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "roleTier": "User"
}
```

#### Obtener Todos los Usuarios
```http
GET /users
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "username": "jperez",
    "email": "juan.perez@example.com",
    "fullName": "Dr. Juan Pérez",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "roleTier": "User"
  }
]
```

#### Obtener Usuario por ID
```http
GET /users/:id
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "username": "jperez",
  "email": "juan.perez@example.com",
  "fullName": "Dr. Juan Pérez",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "roleTier": "User"
}
```

#### Actualizar Usuario
```http
PATCH /users/:id
Content-Type: application/json
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "fullName": "Dr. Juan Carlos Pérez"
}
```

#### Eliminar Usuario
```http
DELETE /users/:id
Authorization: Bearer {token}
```

**Response (204 No Content)**

---

## 2. Patients (Pacientes)

### Endpoints

#### Crear Paciente
```http
POST /patients
Content-Type: application/json
```

**Request Body:**
```json
{
  "fullName": "María González",
  "birthDate": "1990-05-15"
}
```

**Response (201 Created):**
```json
{
  "patientId": 1,
  "fullName": "María González",
  "birthDate": "1990-05-15",
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

#### Obtener Todos los Pacientes
```http
GET /patients
```

#### Obtener Paciente por ID
```http
GET /patients/:id
```

#### Actualizar Paciente
```http
PATCH /patients/:id
Content-Type: application/json
```

#### Eliminar Paciente
```http
DELETE /patients/:id
```

---

## 3. Treatments (Tratamientos)

### Endpoints

#### Crear Tratamiento
```http
POST /treatments
Content-Type: application/json
```

**Request Body:**
```json
{
  "treatmentName": "Fisioterapia",
  "description": "Tratamiento de fisioterapia para espasticidad"
}
```

**Response (201 Created):**
```json
{
  "treatmentId": 1,
  "treatmentName": "Fisioterapia",
  "description": "Tratamiento de fisioterapia para espasticidad"
}
```

#### Obtener Todos los Tratamientos
```http
GET /treatments
```

#### Obtener Tratamiento por ID
```http
GET /treatments/:id
```

#### Actualizar Tratamiento
```http
PATCH /treatments/:id
```

#### Eliminar Tratamiento
```http
DELETE /treatments/:id
```

---

## 4. Patient Treatments (Tratamientos de Pacientes)

Este módulo relaciona pacientes con médicos y tratamientos específicos.

### Endpoints

#### Crear Tratamiento de Paciente
```http
POST /patient-treatments
Content-Type: application/json
```

**Request Body:**
```json
{
  "patientId": 1,
  "doctorId": 1,
  "treatmentId": 1,
  "startDate": "2024-01-15",
  "endDate": "2024-06-15"
}
```

**Request Body:**
```json
{
  "patientId": 1,
  "doctorId": 1,  // ID del usuario/médico (de la tabla user)
  "treatmentId": 1,
  "startDate": "2024-01-15",
  "endDate": "2024-06-15"
}
```

**Response (201 Created):**
```json
{
  "patientTreatmentId": 1,
  "patientId": 1,
  "doctorId": 1,
  "treatmentId": 1,
  "startDate": "2024-01-15",
  "endDate": "2024-06-15"
}
```

#### Obtener Todos los Tratamientos de Pacientes
```http
GET /patient-treatments
```

#### Obtener Tratamientos por Paciente
```http
GET /patient-treatments?patientId=1
```

#### Obtener Tratamientos por Médico (Usuario)
```http
GET /patient-treatments?doctorId=1
```

**Nota:** `doctorId` ahora hace referencia al `id` de la tabla `user`.

#### Obtener Tratamiento de Paciente por ID
```http
GET /patient-treatments/:id
```

**Response incluye relaciones:**
```json
{
  "patientTreatmentId": 1,
  "patientId": 1,
  "doctorId": 1,
  "treatmentId": 1,
  "startDate": "2024-01-15",
  "endDate": "2024-06-15",
  "patient": {
    "patientId": 1,
    "fullName": "María González"
  },
  "doctor": {
    "id": 1,
    "username": "jperez",
    "email": "juan.perez@example.com",
    "fullName": "Dr. Juan Pérez"
  },
  "treatment": {
    "treatmentId": 1,
    "treatmentName": "Fisioterapia"
  }
}
```

#### Actualizar Tratamiento de Paciente
```http
PATCH /patient-treatments/:id
```

#### Eliminar Tratamiento de Paciente
```http
DELETE /patient-treatments/:id
```

---

## 5. Questions (Preguntas)

Las preguntas son los indicadores que se utilizan para evaluar la espasticidad.

### Endpoints

#### Crear Pregunta
```http
POST /questions
Content-Type: application/json
```

**Request Body:**
```json
{
  "questionText": "¿Experimenta rigidez muscular?"
}
```

**Response (201 Created):**
```json
{
  "questionId": 1,
  "questionText": "¿Experimenta rigidez muscular?"
}
```

#### Obtener Todas las Preguntas
```http
GET /questions
```

#### Obtener Pregunta por ID
```http
GET /questions/:id
```

#### Actualizar Pregunta
```http
PATCH /questions/:id
```

#### Eliminar Pregunta
```http
DELETE /questions/:id
```

---

## 6. Appointments (Citas)

Las citas representan sesiones de evaluación donde se recopilan respuestas y se genera un diagnóstico.

### Estados de Cita
- `SCHEDULED`: Programada
- `IN_PROGRESS`: En progreso
- `COMPLETED`: Completada
- `CANCELLED`: Cancelada
- `NO_SHOW`: No se presentó

### Endpoints

#### Crear Cita
```http
POST /appointments
Content-Type: application/json
```

**Request Body:**
```json
{
  "patientTreatmentId": 1,
  "status": "SCHEDULED",
  "progressPercentage": 0,
  "notes": "Primera evaluación"
}
```

**Response (201 Created):**
```json
{
  "appointmentId": 1,
  "patientTreatmentId": 1,
  "appointmentDate": "2024-01-15T10:30:00.000Z",
  "status": "SCHEDULED",
  "progressPercentage": 0,
  "notes": "Primera evaluación"
}
```

#### Obtener Todas las Citas
```http
GET /appointments
```

#### Obtener Citas por Tratamiento de Paciente
```http
GET /appointments?patientTreatmentId=1
```

#### Obtener Citas por Estado
```http
GET /appointments?status=IN_PROGRESS
```

#### Obtener Cita por ID (con todas las relaciones)
```http
GET /appointments/:id
```

**Response incluye:**
- Información del tratamiento de paciente
- Respuestas de la cita
- Diagnósticos
- Evaluaciones de IA

#### Actualizar Cita
```http
PATCH /appointments/:id
```

**Request Body:**
```json
{
  "status": "IN_PROGRESS",
  "progressPercentage": 50,
  "notes": "Evaluación en curso"
}
```

#### Eliminar Cita
```http
DELETE /appointments/:id
```

---

## 7. Appointment Answers (Respuestas de Citas)

Las respuestas almacenan las respuestas numéricas a las preguntas durante una cita.

### Endpoints

#### Crear Respuesta Individual
```http
POST /appointment-answers
Content-Type: application/json
```

**Request Body:**
```json
{
  "appointmentId": 1,
  "questionId": 1,
  "numericValue": 7.5
}
```

#### Crear Múltiples Respuestas (Recomendado)
```http
POST /appointment-answers/multiple
Content-Type: application/json
```

**Request Body:**
```json
{
  "appointmentId": 1,
  "answers": [
    {
      "questionId": 1,
      "numericValue": 7.5
    },
    {
      "questionId": 2,
      "numericValue": 8.0
    },
    {
      "questionId": 3,
      "numericValue": 6.5
    }
  ]
}
```

**Response (201 Created):**
```json
[
  {
    "answerId": 1,
    "appointmentId": 1,
    "questionId": 1,
    "numericValue": 7.5
  },
  {
    "answerId": 2,
    "appointmentId": 1,
    "questionId": 2,
    "numericValue": 8.0
  },
  {
    "answerId": 3,
    "appointmentId": 1,
    "questionId": 3,
    "numericValue": 6.5
  }
]
```

#### Obtener Todas las Respuestas
```http
GET /appointment-answers
```

#### Obtener Respuestas por Cita
```http
GET /appointment-answers?appointmentId=1
```

**Response:**
```json
[
  {
    "answerId": 1,
    "appointmentId": 1,
    "questionId": 1,
    "numericValue": 7.5,
    "question": {
      "questionId": 1,
      "questionText": "¿Experimenta rigidez muscular?"
    }
  }
]
```

#### Obtener Respuesta por ID
```http
GET /appointment-answers/:id
```

#### Actualizar Respuesta
```http
PATCH /appointment-answers/:id
```

#### Eliminar Respuesta
```http
DELETE /appointment-answers/:id
```

---

## 8. Diagnoses (Diagnósticos)

Los diagnósticos se generan basándose en las respuestas de una cita.

### Endpoints

#### Crear Diagnóstico
```http
POST /diagnoses
Content-Type: application/json
```

**Request Body:**
```json
{
  "appointmentId": 1,
  "hasSpasticity": true,
  "diagnosisSummary": "El paciente presenta signos de espasticidad moderada según las respuestas proporcionadas."
}
```

**Response (201 Created):**
```json
{
  "diagnosisId": 1,
  "appointmentId": 1,
  "hasSpasticity": true,
  "diagnosisSummary": "El paciente presenta signos de espasticidad moderada según las respuestas proporcionadas.",
  "diagnosisDate": "2024-01-15T10:30:00.000Z"
}
```

#### Obtener Todos los Diagnósticos
```http
GET /diagnoses
```

#### Obtener Diagnóstico por Cita
```http
GET /diagnoses?appointmentId=1
```

#### Obtener Diagnóstico por ID
```http
GET /diagnoses/:id
```

#### Actualizar Diagnóstico
```http
PATCH /diagnoses/:id
```

#### Eliminar Diagnóstico
```http
DELETE /diagnoses/:id
```

---

## 9. AI Tools (Herramientas de IA)

Catálogo de herramientas de IA disponibles (ChatGPT, Copilot, etc.).

### Endpoints

#### Crear Herramienta de IA
```http
POST /ai-tools
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "ChatGPT"
}
```

**Response (201 Created):**
```json
{
  "aiToolId": 1,
  "name": "ChatGPT"
}
```

#### Obtener Todas las Herramientas de IA
```http
GET /ai-tools
```

**Response:**
```json
[
  {
    "aiToolId": 1,
    "name": "ChatGPT"
  },
  {
    "aiToolId": 2,
    "name": "Copilot"
  }
]
```

#### Obtener Herramienta de IA por ID
```http
GET /ai-tools/:id
```

#### Actualizar Herramienta de IA
```http
PATCH /ai-tools/:id
```

#### Eliminar Herramienta de IA
```http
DELETE /ai-tools/:id
```

---

## 10. AI Evaluations (Evaluaciones de IA)

Almacena los resultados producidos por cada herramienta de IA para cada cita. El médico puede seleccionar la mejor evaluación.

### Endpoints

#### Crear Evaluación de IA
```http
POST /ai-evaluations
Content-Type: application/json
```

**Request Body:**
```json
{
  "appointmentId": 1,
  "aiToolId": 1,
  "aiResult": "Basado en las respuestas del paciente, se observa una probabilidad del 75% de espasticidad moderada. Se recomienda continuar con el tratamiento actual.",
  "isSelected": false,
  "justification": null
}
```

**Response (201 Created):**
```json
{
  "evaluationId": 1,
  "appointmentId": 1,
  "aiToolId": 1,
  "aiResult": "Basado en las respuestas del paciente, se observa una probabilidad del 75% de espasticidad moderada. Se recomienda continuar con el tratamiento actual.",
  "isSelected": false,
  "justification": null,
  "evaluationDate": "2024-01-15T10:30:00.000Z"
}
```

**Nota:** Solo puede existir una evaluación por combinación de `appointmentId` y `aiToolId`.

#### Seleccionar Evaluación como la Mejor
```http
POST /ai-evaluations/:id/select
Content-Type: application/json
```

**Request Body:**
```json
{
  "justification": "Esta evaluación proporciona el análisis más detallado y preciso."
}
```

**Nota:** Al seleccionar una evaluación, automáticamente se deselecciona cualquier otra evaluación seleccionada para la misma cita.

#### Obtener Todas las Evaluaciones
```http
GET /ai-evaluations
```

#### Obtener Evaluaciones por Cita
```http
GET /ai-evaluations?appointmentId=1
```

**Response:**
```json
[
  {
    "evaluationId": 1,
    "appointmentId": 1,
    "aiToolId": 1,
    "aiResult": "...",
    "isSelected": true,
    "justification": "...",
    "evaluationDate": "2024-01-15T10:30:00.000Z",
    "aiTool": {
      "aiToolId": 1,
      "name": "ChatGPT"
    }
  },
  {
    "evaluationId": 2,
    "appointmentId": 1,
    "aiToolId": 2,
    "aiResult": "...",
    "isSelected": false,
    "justification": null,
    "evaluationDate": "2024-01-15T10:30:00.000Z",
    "aiTool": {
      "aiToolId": 2,
      "name": "Copilot"
    }
  }
]
```

#### Obtener Evaluación por ID
```http
GET /ai-evaluations/:id
```

#### Actualizar Evaluación
```http
PATCH /ai-evaluations/:id
```

#### Eliminar Evaluación
```http
DELETE /ai-evaluations/:id
```

---

## 11. System Logs (Logs del Sistema)

Registra las acciones realizadas por los médicos en el sistema.

### Endpoints

#### Crear Log
```http
POST /system-logs
Content-Type: application/json
```

**Request Body:**
```json
{
  "doctorId": 1,
  "action": "CREATED_APPOINTMENT"
}
```

**Response (201 Created):**
```json
{
  "logId": 1,
  "doctorId": 1,
  "action": "CREATED_APPOINTMENT",
  "logDate": "2024-01-15T10:30:00.000Z"
}
```

#### Obtener Todos los Logs
```http
GET /system-logs
```

#### Obtener Logs por Médico (Usuario)
```http
GET /system-logs?doctorId=1
```

**Nota:** `doctorId` ahora hace referencia al `id` de la tabla `user`.

---

## Flujos de Trabajo Completos

### Flujo 1: Crear una Nueva Evaluación Completa

1. **Registrar/Iniciar Sesión como Médico**
   ```http
   POST /auth/register
   # o
   POST /auth/login
   ```

2. **Crear o seleccionar un Paciente**
   ```http
   POST /patients
   ```

3. **Crear o seleccionar un Tratamiento**
   ```http
   POST /treatments
   ```

4. **Asignar Tratamiento al Paciente**
   ```http
   POST /patient-treatments
   {
     "patientId": 1,
     "doctorId": 1,  // ID del usuario/médico autenticado
     "treatmentId": 1,
     "startDate": "2024-01-15"
   }
   ```

5. **Crear una Cita**
   ```http
   POST /appointments
   {
     "patientTreatmentId": 1,
     "status": "IN_PROGRESS"
   }
   ```

6. **Obtener las Preguntas Disponibles**
   ```http
   GET /questions
   ```

7. **Guardar las Respuestas del Paciente**
   ```http
   POST /appointment-answers/multiple
   {
     "appointmentId": 1,
     "answers": [
       { "questionId": 1, "numericValue": 7.5 },
       { "questionId": 2, "numericValue": 8.0 }
     ]
   }
   ```

8. **Generar Diagnóstico**
   ```http
   POST /diagnoses
   {
     "appointmentId": 1,
     "hasSpasticity": true,
     "diagnosisSummary": "Diagnóstico basado en las respuestas..."
   }
   ```

9. **Obtener Herramientas de IA Disponibles**
   ```http
   GET /ai-tools
   ```

10. **Crear Evaluaciones de IA (una por cada herramienta)**
    ```http
    POST /ai-evaluations
    {
      "appointmentId": 1,
      "aiToolId": 1,
      "aiResult": "Resultado de ChatGPT..."
    }
    ```

11. **Seleccionar la Mejor Evaluación de IA**
    ```http
    POST /ai-evaluations/1/select
    {
      "justification": "Mejor análisis"
    }
    ```

12. **Completar la Cita**
    ```http
    PATCH /appointments/1
    {
      "status": "COMPLETED",
      "progressPercentage": 100
    }
    ```

### Flujo 2: Consultar Historial de un Paciente

1. **Obtener Tratamientos del Paciente**
   ```http
   GET /patient-treatments?patientId=1
   ```

2. **Para cada tratamiento, obtener las citas**
   ```http
   GET /appointments?patientTreatmentId=1
   ```

3. **Para cada cita, obtener:**
   - Respuestas: `GET /appointment-answers?appointmentId=1`
   - Diagnóstico: `GET /diagnoses?appointmentId=1`
   - Evaluaciones de IA: `GET /ai-evaluations?appointmentId=1`

---

## Códigos de Estado HTTP

- `200 OK`: Solicitud exitosa
- `201 Created`: Recurso creado exitosamente
- `204 No Content`: Recurso eliminado exitosamente
- `400 Bad Request`: Error en la solicitud (datos inválidos)
- `404 Not Found`: Recurso no encontrado
- `500 Internal Server Error`: Error del servidor

---

## Manejo de Errores

### Formato de Error
```json
{
  "statusCode": 404,
  "message": "Patient with ID 999 not found",
  "error": "Not Found"
}
```

### Errores Comunes

1. **Recurso no encontrado (404)**
   - Verificar que el ID existe en la base de datos

2. **Datos inválidos (400)**
   - Verificar que todos los campos requeridos estén presentes
   - Verificar tipos de datos (números, fechas, etc.)
   - Verificar validaciones (emails, longitudes máximas, etc.)

3. **Violación de restricción única (400)**
   - Ejemplo: Intentar crear una evaluación de IA duplicada para la misma cita y herramienta

---

## Notas para Implementación en Flutter

### 1. Configuración de Cliente HTTP

```dart
import 'package:http/http.dart' as http;
import 'dart:convert';

class ApiClient {
  final String baseUrl = 'http://localhost:3030';
  final Map<String, String> headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  Future<Map<String, dynamic>> get(String endpoint) async {
    final response = await http.get(
      Uri.parse('$baseUrl$endpoint'),
      headers: headers,
    );
    return json.decode(response.body);
  }

  Future<Map<String, dynamic>> post(String endpoint, Map<String, dynamic> data) async {
    final response = await http.post(
      Uri.parse('$baseUrl$endpoint'),
      headers: headers,
      body: json.encode(data),
    );
    return json.decode(response.body);
  }

  Future<Map<String, dynamic>> patch(String endpoint, Map<String, dynamic> data) async {
    final response = await http.patch(
      Uri.parse('$baseUrl$endpoint'),
      headers: headers,
      body: json.encode(data),
    );
    return json.decode(response.body);
  }

  Future<void> delete(String endpoint) async {
    await http.delete(
      Uri.parse('$baseUrl$endpoint'),
      headers: headers,
    );
  }
}
```

### 2. Modelos de Datos

Crea clases Dart para cada entidad:

```dart
class Patient {
  final int? patientId;
  final String fullName;
  final DateTime? birthDate;
  final DateTime? createdAt;

  Patient({
    this.patientId,
    required this.fullName,
    this.birthDate,
    this.createdAt,
  });

  factory Patient.fromJson(Map<String, dynamic> json) {
    return Patient(
      patientId: json['patientId'],
      fullName: json['fullName'],
      birthDate: json['birthDate'] != null ? DateTime.parse(json['birthDate']) : null,
      createdAt: json['createdAt'] != null ? DateTime.parse(json['createdAt']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'fullName': fullName,
      'birthDate': birthDate?.toIso8601String().split('T')[0],
    };
  }
}
```

### 3. Servicios

Crea servicios para cada módulo:

```dart
class PatientService {
  final ApiClient _api = ApiClient();

  Future<List<Patient>> getAllPatients() async {
    final response = await _api.get('/patients');
    return (response as List)
        .map((json) => Patient.fromJson(json))
        .toList();
  }

  Future<Patient> getPatient(int id) async {
    final response = await _api.get('/patients/$id');
    return Patient.fromJson(response);
  }

  Future<Patient> createPatient(Patient patient) async {
    final response = await _api.post('/patients', patient.toJson());
    return Patient.fromJson(response);
  }

  Future<Patient> updatePatient(int id, Patient patient) async {
    final response = await _api.patch('/patients/$id', patient.toJson());
    return Patient.fromJson(response);
  }

  Future<void> deletePatient(int id) async {
    await _api.delete('/patients/$id');
  }
}
```

### 4. Manejo de Estados

Usa Provider, Riverpod, o Bloc para manejar el estado de la aplicación.

### 5. UI Sugerida

- **Pantalla de Lista de Pacientes**: Muestra todos los pacientes con opción de crear nuevo
- **Pantalla de Detalle de Paciente**: Muestra información del paciente y sus tratamientos
- **Pantalla de Crear Cita**: Formulario para crear una nueva cita
- **Pantalla de Evaluación**: Muestra las preguntas y permite ingresar respuestas
- **Pantalla de Resultados**: Muestra diagnósticos y evaluaciones de IA
- **Pantalla de Comparación de IA**: Permite ver y seleccionar la mejor evaluación de IA

---

## Ejemplos de Uso en Flutter

### Crear una Cita Completa

```dart
Future<void> createCompleteAppointment() async {
  // 1. Crear paciente
  final patient = await patientService.createPatient(
    Patient(fullName: 'María González', birthDate: DateTime(1990, 5, 15))
  );

  // 2. Obtener tratamiento
  final treatments = await treatmentService.getAllTreatments();
  final treatment = treatments.first;

  // 3. Crear tratamiento de paciente
  final patientTreatment = await patientTreatmentService.createPatientTreatment(
    CreatePatientTreatmentDto(
      patientId: patient.patientId!,
      doctorId: 1,
      treatmentId: treatment.treatmentId!,
      startDate: DateTime.now(),
    )
  );

  // 4. Crear cita
  final appointment = await appointmentService.createAppointment(
    CreateAppointmentDto(
      patientTreatmentId: patientTreatment.patientTreatmentId!,
      status: AppointmentStatus.IN_PROGRESS,
    )
  );

  // 5. Obtener preguntas
  final questions = await questionService.getAllQuestions();

  // 6. Guardar respuestas
  final answers = questions.map((q) => {
    'questionId': q.questionId,
    'numericValue': 7.5, // Valor del usuario
  }).toList();

  await appointmentAnswerService.createMultipleAnswers(
    CreateMultipleAnswersDto(
      appointmentId: appointment.appointmentId!,
      answers: answers,
    )
  );

  // 7. Generar diagnóstico
  await diagnosisService.createDiagnosis(
    CreateDiagnosisDto(
      appointmentId: appointment.appointmentId!,
      hasSpasticity: true,
      diagnosisSummary: 'Diagnóstico basado en respuestas...',
    )
  );

  // 8. Completar cita
  await appointmentService.updateAppointment(
    appointment.appointmentId!,
    UpdateAppointmentDto(
      status: AppointmentStatus.COMPLETED,
      progressPercentage: 100,
    )
  );
}
```

---

## Swagger Documentation

La API también está documentada con Swagger. Una vez que el servidor esté corriendo, puedes acceder a la documentación interactiva en:

```
http://localhost:3030/api
```

---

## Contacto y Soporte

Para más información sobre la implementación, consulta el código fuente o la documentación de Swagger.

