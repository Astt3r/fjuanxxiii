-- Script para crear la tabla de eventos
CREATE TABLE IF NOT EXISTS eventos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  fecha_evento DATE NOT NULL,
  hora_inicio TIME,
  hora_fin TIME,
  ubicacion VARCHAR(255),
  tipo ENUM('evento', 'reunion', 'celebracion', 'academico') DEFAULT 'evento',
  color VARCHAR(7) DEFAULT '#3B82F6',
  estado ENUM('activo', 'inactivo', 'eliminado') DEFAULT 'activo',
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_fecha_evento (fecha_evento),
  INDEX idx_estado (estado),
  INDEX idx_tipo (tipo)
);

-- Insertar algunos eventos de ejemplo si la tabla está vacía
INSERT IGNORE INTO eventos (id, titulo, descripcion, fecha_evento, hora_inicio, hora_fin, ubicacion, tipo, color, estado) VALUES
(1, 'Reunión de Apoderados 4° Básico', 'Reunión informativa sobre el proceso académico del segundo semestre', '2025-08-15', '15:30:00', '17:00:00', 'Sala de Reuniones', 'reunion', '#F59E0B', 'activo'),
(2, 'Ceremonia de Graduación', 'Ceremonia de graduación para estudiantes de 8° básico', '2025-08-20', '10:00:00', '12:00:00', 'Auditorio Principal', 'celebracion', '#10B981', 'activo'),
(3, 'Taller de Matemáticas', 'Taller de reforzamiento en matemáticas para 5° y 6° básico', '2025-08-18', '14:00:00', '15:30:00', 'Aula 205', 'academico', '#EF4444', 'activo'),
(4, 'Misa de Acción de Gracias', 'Celebración religiosa de fin de semestre', '2025-08-22', '09:00:00', '10:30:00', 'Capilla del Colegio', 'evento', '#DC2626', 'activo');
