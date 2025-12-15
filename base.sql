-- =====================================================
-- FisioLab Database Schema (PostgreSQL)
-- Disease: Spasticity
-- =====================================================

-- =========================
-- 1. Users (Doctors/Usuarios)
-- Los usuarios son los médicos que se loguean en el sistema
-- =========================
-- Nota: La tabla 'user' se crea automáticamente por TypeORM
-- pero aquí se muestra la estructura esperada:
-- CREATE TABLE "user" (
--     id SERIAL PRIMARY KEY,
--     username VARCHAR NOT NULL,
--     email VARCHAR UNIQUE NOT NULL,
--     password VARCHAR NOT NULL,
--     full_name VARCHAR(100),
--     "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     "roleTier" VARCHAR DEFAULT 'User',
--     "roleId" INT REFERENCES role(roleId)
-- );

-- =========================
-- 2. Patients
-- =========================
CREATE TABLE patients (
    patient_id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    birth_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- 4. Treatments (Catalog)
-- Master list of available treatments
-- =========================
CREATE TABLE treatments (
    treatment_id SERIAL PRIMARY KEY,
    treatment_name VARCHAR(100) NOT NULL,
    description TEXT
);

-- =========================
-- 4.1 Patient Treatments
-- Defines which treatments a patient is receiving
-- =========================
CREATE TABLE patient_treatments (
    patient_treatment_id SERIAL PRIMARY KEY,
    patient_id INT REFERENCES patients(patient_id),
    doctor_id INT REFERENCES "user"(id),
    treatment_id INT REFERENCES treatments(treatment_id),
    start_date DATE,
    end_date DATE
);

-- =========================
-- 5. Appointments
-- Each appointment collects answers and produces a diagnosis
-- =========================
CREATE TABLE appointments (
    appointment_id SERIAL PRIMARY KEY,
    patient_treatment_id INT REFERENCES patient_treatments(patient_treatment_id),
    appointment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED',
    progress_percentage INT CHECK (progress_percentage BETWEEN 0 AND 100),
    notes TEXT,
    CHECK (status IN ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW'))
);

-- =========================
-- 6. Diagnoses
-- Each appointment generates a diagnosis based on answered questions
-- =========================
CREATE TABLE diagnoses (
    diagnosis_id SERIAL PRIMARY KEY,
    appointment_id INT REFERENCES appointments(appointment_id),
    has_spasticity BOOLEAN NOT NULL,
    diagnosis_summary TEXT,
    diagnosis_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- 6. Questions (Indicators)
-- =========================
CREATE TABLE questions (
    question_id SERIAL PRIMARY KEY,
    question_text TEXT NOT NULL
);

-- =========================
-- 7. Appointment Answers
-- =========================
CREATE TABLE appointment_answers (
    answer_id SERIAL PRIMARY KEY,
    appointment_id INT REFERENCES appointments(appointment_id),
    question_id INT REFERENCES questions(question_id),
    numeric_value NUMERIC(5,2)
);

-- =========================
-- 8. AI Tools
-- =========================
CREATE TABLE ai_tools (
    ai_tool_id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

-- =========================
-- 9. AI Evaluations
-- Stores the result produced by each AI per appointment
-- and allows the doctor to select the best one
-- =========================
CREATE TABLE ai_evaluations (
    evaluation_id SERIAL PRIMARY KEY,
    appointment_id INT REFERENCES appointments(appointment_id),
    ai_tool_id INT REFERENCES ai_tools(ai_tool_id),
    ai_result TEXT NOT NULL,
    is_selected BOOLEAN DEFAULT FALSE,
    justification TEXT,
    evaluation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (appointment_id, ai_tool_id)
);

-- Only one AI can be selected as the best per appointment
CREATE UNIQUE INDEX one_selected_ai_per_appointment
ON ai_evaluations (appointment_id)
WHERE is_selected = true;

-- =========================
-- 10. System Logs
-- =========================
CREATE TABLE system_logs (
    log_id SERIAL PRIMARY KEY,
    doctor_id INT REFERENCES "user"(id),
    action VARCHAR(50),
    log_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- Initial Data for AI Tools
-- =========================
INSERT INTO ai_tools (name) VALUES ('ChatGPT'), ('Copilot');