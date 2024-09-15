CREATE OR REPLACE FUNCTION audit_changes() RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO AuditoriaCambio(id_usuario, fecha, tabla_afectada, operacion, descripcion)
        VALUES (NEW.id_usuario, NOW(), TG_TABLE_NAME, TG_OP, row_to_json(NEW)::text);
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO AuditoriaCambio(id_usuario, fecha, tabla_afectada, operacion, descripcion)
        VALUES (NEW.id_usuario, NOW(), TG_TABLE_NAME, TG_OP, row_to_json(NEW)::text);
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO AuditoriaCambio(id_usuario, fecha, tabla_afectada, operacion, descripcion)
        VALUES (OLD.id_usuario, NOW(), TG_TABLE_NAME, TG_OP, row_to_json(OLD)::text);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE Rol (
    id_rol SERIAL PRIMARY KEY,
    descripcion VARCHAR(50) NOT NULL CHECK (descripcion <> '')
);

CREATE INDEX idx_rol_descripcion ON Rol(descripcion);

CREATE TRIGGER audit_rol AFTER INSERT OR UPDATE OR DELETE ON Rol
FOR EACH ROW EXECUTE FUNCTION audit_changes();

CREATE TABLE TipoEstado (
    id_tipo_estado SERIAL PRIMARY KEY,
    descripcion VARCHAR(50) NOT NULL CHECK (descripcion <> '')
);

CREATE TRIGGER audit_tipoestado AFTER INSERT OR UPDATE OR DELETE ON TipoEstado
FOR EACH ROW EXECUTE FUNCTION audit_changes();

CREATE TABLE Estado (
    id_estado SERIAL PRIMARY KEY,
    descripcion VARCHAR(50) NOT NULL CHECK (descripcion <> ''),
    tipo_estado_id INT REFERENCES TipoEstado(id_tipo_estado) ON DELETE CASCADE
);

CREATE TRIGGER audit_estado AFTER INSERT OR UPDATE OR DELETE ON Estado
FOR EACH ROW EXECUTE FUNCTION audit_changes();

CREATE INDEX idx_estado_descripcion ON Estado(descripcion);

CREATE TABLE TipoPersona (
    id_tipo_persona SERIAL PRIMARY KEY,
    descripcion VARCHAR(50) NOT NULL CHECK (descripcion <> '')
);

CREATE TRIGGER audit_tipopersona AFTER INSERT OR UPDATE OR DELETE ON TipoPersona
FOR EACH ROW EXECUTE FUNCTION audit_changes();

CREATE TABLE TipoCompania (
    id_tipo_compania SERIAL PRIMARY KEY,
    descripcion VARCHAR(50) NOT NULL CHECK (descripcion <> '')
);

CREATE TRIGGER audit_tipocompania AFTER INSERT OR UPDATE OR DELETE ON TipoCompania
FOR EACH ROW EXECUTE FUNCTION audit_changes();

CREATE TABLE Usuario (
    id_usuario SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL CHECK (nombre <> ''),
    apellido VARCHAR(100) NOT NULL CHECK (apellido <> ''),
    email VARCHAR(150) UNIQUE NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    clave VARCHAR(256) NOT NULL CHECK (length(clave) >= 8),
    rol_id INT REFERENCES Rol(id_rol) ON DELETE CASCADE,
    fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    estado_id INT REFERENCES Estado(id_estado),
    cuit CHAR(11) UNIQUE NOT NULL CHECK (cuit ~ '^[0-9]{11}$'),
    tipo_persona_id INT REFERENCES TipoPersona(id_tipo_persona) ON DELETE CASCADE,
    domicilio VARCHAR(200),
    ciudad VARCHAR(100) NOT NULL,
    provincia VARCHAR(100) NOT NULL,
    pais VARCHAR(100) NOT NULL CHECK (pais <> ''),
    telefono VARCHAR(50),
    codigo_isrc_audio VARCHAR(10) NOT NULL,
    codigo_isrc_video VARCHAR(10) NOT NULL,
    registro_pendiente BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TRIGGER audit_usuario AFTER INSERT OR UPDATE OR DELETE ON Usuario
FOR EACH ROW EXECUTE FUNCTION audit_changes();

CREATE INDEX idx_email ON Usuario(email);
CREATE INDEX idx_cuit ON Usuario(cuit);
CREATE INDEX idx_estado_usuario ON Usuario(estado_id);
CREATE INDEX idx_rol_usuario ON Usuario(rol_id);

CREATE TABLE Compania (
    id_compania SERIAL PRIMARY KEY,
    nombre_compania VARCHAR(150) NOT NULL CHECK (nombre_compania <> ''),
    direccion VARCHAR(200),
    telefono VARCHAR(50),
    email VARCHAR(150) UNIQUE CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    cuit CHAR(11) UNIQUE NOT NULL CHECK (cuit ~ '^[0-9]{11}$'),
    tipo_compania_id INT REFERENCES TipoCompania(id_tipo_compania) ON DELETE CASCADE,
    estado_id INT REFERENCES Estado(id_estado)
);

CREATE TRIGGER audit_compania AFTER INSERT OR UPDATE OR DELETE ON Compania
FOR EACH ROW EXECUTE FUNCTION audit_changes();

CREATE INDEX idx_estado_compania ON Compania(estado_id);
CREATE INDEX idx_tipo_compania ON Compania(tipo_compania_id);

CREATE TABLE UsuarioAsignado (
    id_usuario_asignado SERIAL PRIMARY KEY,
    id_usuario INT REFERENCES Usuario(id_usuario) ON DELETE CASCADE,
    id_compania INT REFERENCES Compania(id_compania) ON DELETE CASCADE,
    fecha_asignacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER audit_usuarioasignado AFTER INSERT OR UPDATE OR DELETE ON UsuarioAsignado
FOR EACH ROW EXECUTE FUNCTION audit_changes();

CREATE INDEX idx_usuario_compania_asignado ON UsuarioAsignado(id_usuario, id_compania);

CREATE TABLE Repertorio (
    id_repertorio SERIAL PRIMARY KEY,
    id_usuario INT REFERENCES Usuario(id_usuario),
    titulo VARCHAR(150) NOT NULL CHECK (titulo <> ''),
    tipo VARCHAR(50),
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    codigo_postulacion VARCHAR(50)
);

CREATE TRIGGER audit_repertorio AFTER INSERT OR UPDATE OR DELETE ON Repertorio
FOR EACH ROW EXECUTE FUNCTION audit_changes();

CREATE INDEX idx_titulo_repertorio ON Repertorio(titulo);
CREATE INDEX idx_fecha_creacion_repertorio ON Repertorio(fecha_creacion);

CREATE TABLE Fonograma (
    id_fonograma SERIAL PRIMARY KEY,
    id_repertorio INT REFERENCES Repertorio(id_repertorio) ON DELETE CASCADE,
    titulo VARCHAR(150) NOT NULL CHECK (titulo <> ''),
    artista VARCHAR(100) NOT NULL CHECK (artista <> ''),
    isrc VARCHAR(20) UNIQUE NOT NULL CHECK (isrc ~ '^[A-Z]{2}[0-9A-Z]{3}[0-9]{2}[0-9]{5}$'),
    duracion TIME NOT NULL,
    fecha_lanzamiento DATE,
    tipo VARCHAR(50),
    estado_id INT REFERENCES Estado(id_estado)
);

CREATE TRIGGER audit_fonograma AFTER INSERT OR UPDATE OR DELETE ON Fonograma
FOR EACH ROW EXECUTE FUNCTION audit_changes();

CREATE INDEX idx_estado_fonograma ON Fonograma(estado_id);
CREATE INDEX idx_artista_fonograma ON Fonograma(artista);

CREATE TABLE Conflicto (
    id_conflicto SERIAL PRIMARY KEY,
    id_fonograma INT REFERENCES Fonograma(id_fonograma) ON DELETE CASCADE,
    tipo_conflicto VARCHAR(100) NOT NULL CHECK (tipo_conflicto <> ''),
    descripcion TEXT,
    estado_id INT REFERENCES Estado(id_estado),
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_resolucion TIMESTAMP
);

CREATE TRIGGER audit_conflicto AFTER INSERT OR UPDATE OR DELETE ON Conflicto
FOR EACH ROW EXECUTE FUNCTION audit_changes();

CREATE INDEX idx_fecha_creacion_conflicto ON Conflicto(fecha_creacion);
CREATE INDEX idx_estado_conflicto ON Conflicto(estado_id);
CREATE INDEX idx_fonograma_estado_conflicto ON Conflicto(id_fonograma, estado_id);

CREATE TABLE Consulta (
    id_consulta SERIAL PRIMARY KEY,
    id_usuario INT REFERENCES Usuario(id_usuario),
    asunto VARCHAR(150) NOT NULL CHECK (asunto <> ''),
    mensaje TEXT,
    fecha_envio TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    estado_id INT REFERENCES Estado(id_estado)
);

CREATE TRIGGER audit_consulta AFTER INSERT OR UPDATE OR DELETE ON Consulta
FOR EACH ROW EXECUTE FUNCTION audit_changes();

CREATE INDEX idx_estado_consulta ON Consulta(estado_id);

CREATE TABLE Tramite (
    id_tramite SERIAL PRIMARY KEY,
    id_usuario INT REFERENCES Usuario(id_usuario),
    tipo_tramite VARCHAR(100) NOT NULL CHECK (tipo_tramite <> ''),
    fecha_inicio TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    estado_id INT REFERENCES Estado(id_estado)
);

CREATE TRIGGER audit_tramite AFTER INSERT OR UPDATE OR DELETE ON Tramite
FOR EACH ROW EXECUTE FUNCTION audit_changes();

CREATE INDEX idx_estado_tramite ON Tramite(estado_id);
CREATE INDEX idx_fecha_inicio_tramite ON Tramite(fecha_inicio);
CREATE INDEX idx_usuario_tramite ON Tramite(id_usuario);

CREATE TABLE Documento (
    id_documento SERIAL PRIMARY KEY,
    id_tramite INT REFERENCES Tramite(id_tramite),
    nombre_documento VARCHAR(150) NOT NULL CHECK (nombre_documento <> ''),
    tipo_documento VARCHAR(50) NOT NULL CHECK (tipo_documento <> ''),
    ruta_documento VARCHAR(255) NOT NULL,
    fecha_subida TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER audit_documento AFTER INSERT OR UPDATE OR DELETE ON Documento
FOR EACH ROW EXECUTE FUNCTION audit_changes();

CREATE INDEX idx_tramite_documento ON Documento(id_tramite);

CREATE TABLE AuditoriaCambio (
    id_auditoria SERIAL PRIMARY KEY,
    id_usuario INT REFERENCES Usuario(id_usuario),
    fecha TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    tabla_afectada VARCHAR(100) NOT NULL,
    operacion VARCHAR(50) NOT NULL,
    descripcion TEXT NOT NULL
);

CREATE INDEX idx_fecha_auditoria ON AuditoriaCambio(fecha);
CREATE INDEX idx_usuario_auditoria ON AuditoriaCambio(id_usuario);

CREATE TABLE Pago (
    id_pago SERIAL PRIMARY KEY,
    id_usuario INT REFERENCES Usuario(id_usuario),
    monto DECIMAL(10, 2) NOT NULL,
    fecha_pago TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    metodo_pago VARCHAR(50),
    referencia VARCHAR(100)
);

CREATE INDEX idx_fecha_pago ON Pago(fecha_pago);
CREATE INDEX idx_monto_pago ON Pago(monto);

CREATE TABLE CuentaCorriente (
    id_cuenta_corriente SERIAL PRIMARY KEY,
    id_usuario INT REFERENCES Usuario(id_usuario),
    saldo DECIMAL(10, 2) NOT NULL,
    fecha_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER audit_cuentacorriente AFTER INSERT OR UPDATE OR DELETE ON CuentaCorriente
FOR EACH ROW EXECUTE FUNCTION audit_changes();

CREATE INDEX idx_usuario_cuenta_corriente ON CuentaCorriente(id_usuario);

CREATE TABLE LogActividad (
    id_log SERIAL PRIMARY KEY,
    id_usuario INT REFERENCES Usuario(id_usuario),
    actividad VARCHAR(255) NOT NULL,
    fecha TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ip_origen VARCHAR(50) NOT NULL,
    navegador VARCHAR(100) NOT NULL
);

CREATE INDEX idx_fecha_actividad ON LogActividad(fecha);
CREATE INDEX idx_navegador ON LogActividad(navegador);
CREATE INDEX idx_ip_origen ON LogActividad(ip_origen);

CREATE TABLE ErroresInsercion (
    id_error SERIAL PRIMARY KEY,
    tabla_afectada VARCHAR(100) NOT NULL,
    descripcion_error TEXT NOT NULL,
    fecha_error TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Regla (
    id_regla SERIAL PRIMARY KEY,
    descripcion VARCHAR(255) NOT NULL,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX idx_fecha_creacion_regla ON Regla(fecha_creacion);