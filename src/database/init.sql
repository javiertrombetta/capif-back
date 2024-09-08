-- Creación de la base de datos
CREATE DATABASE CAPIF_DB;
GO

-- Seleccionar la base de datos
USE CAPIF_DB;
GO

-- Crear todas las tablas, índices y relaciones

-- Tabla Usuarios
CREATE TABLE Usuarios (
    id_usuario INT PRIMARY KEY IDENTITY(1, 1),
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    clave VARCHAR(256) NOT NULL,
    rol_id INT FOREIGN KEY REFERENCES Roles(id_rol),
    fecha_registro DATETIME NOT NULL DEFAULT GETDATE(),
    estado_id INT FOREIGN KEY REFERENCES Estados(id_estado),
    cuit CHAR(11) UNIQUE NOT NULL,  -- CUIT de 11 dígitos
    tipo_persona_id INT FOREIGN KEY REFERENCES TiposPersona(id_tipo_persona),
    domicilio VARCHAR(200),
    ciudad VARCHAR(100),
    provincia VARCHAR(100),
    pais VARCHAR(100),
    telefono VARCHAR(50),
    codigo_isrc_audio VARCHAR(10),
    codigo_isrc_video VARCHAR(10)
);
GO

-- Índice para el email
CREATE INDEX idx_email ON Usuarios(email);
GO

-- Tabla Compañías
CREATE TABLE Compañías (
    id_compania INT PRIMARY KEY IDENTITY(1, 1),
    nombre_compania VARCHAR(150) NOT NULL,
    direccion VARCHAR(200),
    telefono VARCHAR(50),
    email VARCHAR(150),
    cuit CHAR(11) UNIQUE NOT NULL,  -- CUIT de compañía
    tipo_id INT FOREIGN KEY REFERENCES TiposCompania(id_tipo),
    estado_id INT FOREIGN KEY REFERENCES Estados(id_estado)
);
GO

-- Tabla UsuariosAsignados
CREATE TABLE UsuariosAsignados (
    id_usuario_asignado INT PRIMARY KEY IDENTITY(1, 1),
    id_usuario INT FOREIGN KEY REFERENCES Usuarios(id_usuario) ON DELETE CASCADE,
    id_compania INT FOREIGN KEY REFERENCES Compañías(id_compania) ON DELETE CASCADE,
    fecha_asignacion DATETIME NOT NULL DEFAULT GETDATE()
);
GO

-- Tabla Fonogramas
CREATE TABLE Fonogramas (
    id_fonograma INT PRIMARY KEY IDENTITY(1, 1),
    id_repertorio INT FOREIGN KEY REFERENCES Repertorios(id_repertorio) ON DELETE CASCADE,
    titulo VARCHAR(150) NOT NULL,
    artista VARCHAR(100) NOT NULL,
    isrc VARCHAR(20) UNIQUE NOT NULL,  -- ISRC único
    duracion TIME NOT NULL,
    fecha_lanzamiento DATE,
    tipo VARCHAR(50),
    estado_id INT FOREIGN KEY REFERENCES Estados(id_estado)
);
GO

-- Tabla Conflictos
CREATE TABLE Conflictos (
    id_conflicto INT PRIMARY KEY IDENTITY(1, 1),
    id_fonograma INT FOREIGN KEY REFERENCES Fonogramas(id_fonograma) ON DELETE CASCADE,
    tipo_conflicto VARCHAR(100) NOT NULL,
    descripcion TEXT,
    estado_id INT FOREIGN KEY REFERENCES Estados(id_estado),
    fecha_creacion DATETIME NOT NULL DEFAULT GETDATE(),
    fecha_resolucion DATETIME
);
GO

-- Tabla Consultas
CREATE TABLE Consultas (
    id_consulta INT PRIMARY KEY IDENTITY(1, 1),
    id_usuario INT FOREIGN KEY REFERENCES Usuarios(id_usuario),
    asunto VARCHAR(150) NOT NULL,
    mensaje TEXT,
    fecha_envio DATETIME NOT NULL DEFAULT GETDATE(),
    estado_id INT FOREIGN KEY REFERENCES Estados(id_estado)
);
GO

-- Tabla Tramites
CREATE TABLE Tramites (
    id_tramite INT PRIMARY KEY IDENTITY(1, 1),
    id_usuario INT FOREIGN KEY REFERENCES Usuarios(id_usuario),
    tipo_tramite VARCHAR(100),
    fecha_inicio DATETIME NOT NULL DEFAULT GETDATE(),
    estado_id INT FOREIGN KEY REFERENCES Estados(id_estado)
);
GO

-- Tabla Documentos
CREATE TABLE Documentos (
    id_documento INT PRIMARY KEY IDENTITY(1, 1),
    id_tramite INT FOREIGN KEY REFERENCES Tramites(id_tramite),
    nombre_documento VARCHAR(150),
    tipo_documento VARCHAR(50),
    ruta_documento VARCHAR(255),
    fecha_subida DATETIME NOT NULL DEFAULT GETDATE()
);
GO

-- Tabla Repertorios
CREATE TABLE Repertorios (
    id_repertorio INT PRIMARY KEY IDENTITY(1, 1),
    id_usuario INT FOREIGN KEY REFERENCES Usuarios(id_usuario),
    titulo VARCHAR(150) NOT NULL,
    tipo VARCHAR(50),
    fecha_creacion DATETIME NOT NULL DEFAULT GETDATE()
);
GO

-- Tabla Pagos
CREATE TABLE Pagos (
    id_pago INT PRIMARY KEY IDENTITY(1, 1),
    id_usuario INT FOREIGN KEY REFERENCES Usuarios(id_usuario),
    monto DECIMAL(10, 2) NOT NULL,
    fecha_pago DATETIME NOT NULL DEFAULT GETDATE(),
    metodo_pago VARCHAR(50),
    referencia VARCHAR(100)
);
GO

-- Tabla CuentasCorrientes
CREATE TABLE CuentasCorrientes (
    id_cuenta_corriente INT PRIMARY KEY IDENTITY(1, 1),
    id_usuario INT FOREIGN KEY REFERENCES Usuarios(id_usuario),
    saldo DECIMAL(10, 2) NOT NULL,
    fecha_actualizacion DATETIME NOT NULL DEFAULT GETDATE()
);
GO

-- Tabla Reportes
CREATE TABLE Reportes (
    id_reporte INT PRIMARY KEY IDENTITY(1, 1),
    id_usuario INT FOREIGN KEY REFERENCES Usuarios(id_usuario),
    tipo_reporte VARCHAR(100),
    fecha_generacion DATETIME NOT NULL DEFAULT GETDATE(),
    ruta_reporte VARCHAR(255)
);
GO

-- Tabla Archivos
CREATE TABLE Archivos (
    id_archivo INT PRIMARY KEY IDENTITY(1, 1),
    id_usuario INT FOREIGN KEY REFERENCES Usuarios(id_usuario),
    nombre_archivo VARCHAR(150),
    tipo_archivo VARCHAR(50),
    ruta_archivo VARCHAR(255),
    fecha_subida DATETIME NOT NULL DEFAULT GETDATE()
);
GO

-- Tabla Reglas
CREATE TABLE Reglas (
    id_regla INT PRIMARY KEY IDENTITY(1, 1),
    descripcion TEXT,
    fecha_creacion DATETIME NOT NULL DEFAULT GETDATE(),
    activo BIT
);
GO

-- Tabla Parametros
CREATE TABLE Parametros (
    id_parametro INT PRIMARY KEY IDENTITY(1, 1),
    nombre_parametro VARCHAR(100),
    valor VARCHAR(255)
);
GO

-- Tabla ISRC
CREATE TABLE ISRC (
    id_isrc INT PRIMARY KEY IDENTITY(1, 1),
    id_fonograma INT FOREIGN KEY REFERENCES Fonogramas(id_fonograma) ON DELETE CASCADE,
    codigo_isrc VARCHAR(20),
    tipo VARCHAR(50)
);
GO

-- Tabla Sesiones
CREATE TABLE Sesiones (
    id_sesion INT PRIMARY KEY IDENTITY(1, 1),
    id_usuario INT FOREIGN KEY REFERENCES Usuarios(id_usuario),
    fecha_inicio DATETIME NOT NULL DEFAULT GETDATE(),
    fecha_fin DATETIME,
    ip VARCHAR(50)
);
GO

-- Tabla LogActividades
CREATE TABLE LogActividades (
    id_log INT PRIMARY KEY IDENTITY(1, 1),
    id_usuario INT FOREIGN KEY REFERENCES Usuarios(id_usuario),
    actividad VARCHAR(255) NOT NULL,
    fecha DATETIME NOT NULL DEFAULT GETDATE()
);
GO

-- Tabla Premios
CREATE TABLE Premios (
    id_premio INT PRIMARY KEY IDENTITY(1, 1),
    id_usuario INT FOREIGN KEY REFERENCES Usuarios(id_usuario),
    codigo_premio VARCHAR(50),
    fecha_obtencion DATETIME NOT NULL DEFAULT GETDATE()
);
GO

-- Tabla ConsultasRespuestas
CREATE TABLE ConsultasRespuestas (
    id_respuesta INT PRIMARY KEY IDENTITY(1, 1),
    id_consulta INT FOREIGN KEY REFERENCES Consultas(id_consulta),
    id_usuario_responde INT FOREIGN KEY REFERENCES Usuarios(id_usuario),
    mensaje TEXT,
    fecha_respuesta DATETIME NOT NULL DEFAULT GETDATE()
);
GO

-- Tabla ArchivosRepertorio
CREATE TABLE ArchivosRepertorio (
    id_archivo_repertorio INT PRIMARY KEY IDENTITY(1, 1),
    id_repertorio INT FOREIGN KEY REFERENCES Repertorios(id_repertorio),
    nombre_archivo VARCHAR(150),
    ruta_archivo VARCHAR(255),
    fecha_subida DATETIME NOT NULL DEFAULT GETDATE()
);
GO

-- Tabla ParametrosSistema
CREATE TABLE ParametrosSistema (
    id_parametro INT PRIMARY KEY IDENTITY(1, 1),
    nombre VARCHAR(100),
    valor VARCHAR(255),
    descripcion TEXT
);
GO

-- Tabla DepuracionRepertorio
CREATE TABLE DepuracionRepertorio (
    id_depuracion INT PRIMARY KEY IDENTITY(1, 1),
    id_fonograma INT FOREIGN KEY REFERENCES Fonogramas(id_fonograma) ON DELETE CASCADE,
    accion VARCHAR(100),
    motivo TEXT,
    fecha_accion DATETIME NOT NULL DEFAULT GETDATE()
);
GO

-- Tablas adicionales de referencia para valores fijos

-- Tabla Roles
CREATE TABLE Roles (
    id_rol INT PRIMARY KEY IDENTITY(1, 1),
    descripcion VARCHAR(50) NOT NULL
);
GO

-- Tabla Estados
CREATE TABLE Estados (
    id_estado INT PRIMARY KEY IDENTITY(1, 1),
    descripcion VARCHAR(50) NOT NULL
);
GO

-- Tabla TiposPersona
CREATE TABLE TiposPersona (
    id_tipo_persona INT PRIMARY KEY IDENTITY(1, 1),
    descripcion VARCHAR(50) NOT NULL
);
GO

-- Tabla TiposCompania
CREATE TABLE TiposCompania (
    id_tipo INT PRIMARY KEY IDENTITY(1, 1),
    descripcion VARCHAR(50) NOT NULL
);
GO

-- Índices adicionales para consultas rápidas por fecha
CREATE INDEX idx_fecha_creacion_conflictos ON Conflictos(fecha_creacion);
CREATE INDEX idx_fecha_inicio_tramites ON Tramites(fecha_inicio);
CREATE INDEX idx_fecha_pago_pagos ON Pagos(fecha_pago);
GO