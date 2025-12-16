# 🔐 API de Autenticación - Documentación para Frontend/Mobile

Esta documentación describe cómo consumir la API de autenticación desde tu aplicación frontend o móvil.

---

## 📋 Información General

**Base URL:** `http://localhost:3000` (desarrollo)  
**Base URL:** `https://tu-dominio.com` (producción)

**Autenticación:** Bearer Token (JWT)

---

## 🔑 Flujo de Autenticación

1. **Registro/Login** → Obtienes un `access_token`
2. **Guardar token** → En localStorage/AsyncStorage/SecureStore
3. **Incluir token** → En todas las peticiones protegidas
4. **Header:** `Authorization: Bearer {token}`

---

## 📍 Endpoints

### 1. Registro de Usuario

**POST** `/auth/register`

Crea una nueva cuenta de usuario.

**Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "MySecurePass123"
}
```

**Validaciones:**
- `username`: mínimo 2 caracteres, requerido
- `email`: formato email válido, requerido
- `password`: mínimo 6 caracteres, requerido

**Respuesta exitosa (200):**
```json
{
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com"
  },
  "acces_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImlhdCI6MTY..."
}
```

**Errores posibles:**
- `401 Unauthorized` - "Email already exists"
- `400 Bad Request` - Datos inválidos

---

### 2. Inicio de Sesión

**POST** `/auth/login`

Autentica un usuario existente.

**Body:**
```json
{
  "email": "john@example.com",
  "password": "MySecurePass123"
}
```

**Respuesta exitosa (200):**
```json
{
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com"
  },
  "acces_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImlhdCI6MTY..."
}
```

**Errores posibles:**
- `401 Unauthorized` - "Email not found"
- `401 Unauthorized` - "Invalid password"

---

### 3. Obtener Perfil Actual

**GET** `/auth/me`

Obtiene la información del usuario autenticado.

**Headers requeridos:**
```
Authorization: Bearer {tu_token_aqui}
```

**Respuesta exitosa (200):**
```json
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "roleTier": "USER"
}
```

**Errores posibles:**
- `401 Unauthorized` - Token inválido o expirado

---

### 4. Login con Google

**GET** `/auth/google/login`

Inicia el flujo de autenticación con Google OAuth.

**Comportamiento:**
- Redirige al usuario a Google para autenticación
- Después de aprobar, Google redirige a `/auth/google/callback`
- Finalmente redirige a `/auth/success`

**No requiere headers ni body**

---

### 5. Callback de Google

**GET** `/auth/google/callback`

Endpoint interno manejado por Google OAuth (no llamar manualmente).

---

### 6. Success de Google

**GET** `/auth/success`

Página de confirmación después de login con Google.

**Respuesta (200):**
```json
{
  "message": "Google authentication successful. You can now access your account."
}
```
