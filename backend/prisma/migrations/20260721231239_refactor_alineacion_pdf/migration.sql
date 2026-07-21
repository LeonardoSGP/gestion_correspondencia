-- CreateTable
CREATE TABLE `roles` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(50) NOT NULL,
    `descripcion` VARCHAR(255) NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `roles_nombre_key`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `permisos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(100) NOT NULL,
    `modulo` VARCHAR(100) NOT NULL,
    `descripcion` VARCHAR(255) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `permisos_nombre_key`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `roles_permisos` (
    `rol_id` INTEGER NOT NULL,
    `permiso_id` INTEGER NOT NULL,

    PRIMARY KEY (`rol_id`, `permiso_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(150) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `rol_id` INTEGER NOT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `area_id` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    INDEX `users_rol_id_idx`(`rol_id`),
    INDEX `users_area_id_idx`(`area_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sesiones` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `token` VARCHAR(500) NOT NULL,
    `activa` BOOLEAN NOT NULL DEFAULT true,
    `ip_address` VARCHAR(45) NULL,
    `user_agent` VARCHAR(500) NULL,
    `fecha_creacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fecha_expiracion` DATETIME(3) NOT NULL,
    `ultima_actividad` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `sesiones_token_key`(`token`),
    INDEX `sesiones_user_id_idx`(`user_id`),
    INDEX `sesiones_token_idx`(`token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `solicitudes_recuperacion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `token` VARCHAR(255) NOT NULL,
    `usado` BOOLEAN NOT NULL DEFAULT false,
    `fecha_creacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fecha_expiracion` DATETIME(3) NOT NULL,

    UNIQUE INDEX `solicitudes_recuperacion_token_key`(`token`),
    INDEX `solicitudes_recuperacion_user_id_idx`(`user_id`),
    INDEX `solicitudes_recuperacion_token_idx`(`token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `areas_administrativas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(200) NOT NULL,
    `clave` VARCHAR(20) NOT NULL,
    `responsable` VARCHAR(150) NULL,
    `activa` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `areas_administrativas_clave_key`(`clave`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `correspondencias` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `folio` VARCHAR(30) NOT NULL,
    `tipo` ENUM('ENTRADA', 'SALIDA') NOT NULL,
    `prioridad` ENUM('URGENTE', 'ORDINARIA') NOT NULL DEFAULT 'ORDINARIA',
    `clasificacion` ENUM('NORMAL', 'CONFIDENCIAL', 'CON_VALORES') NOT NULL DEFAULT 'NORMAL',
    `estado` ENUM('REGISTRADA', 'EN_REVISION', 'EN_DISTRIBUCION', 'ENTREGADA_A_AREA', 'EN_RUTA', 'ENTREGADA', 'ACUSE_PENDIENTE', 'CERRADA', 'RECHAZADA', 'DEVUELTA') NOT NULL DEFAULT 'REGISTRADA',
    `asunto` VARCHAR(500) NOT NULL,
    `descripcion` TEXT NULL,
    `num_documento` VARCHAR(100) NULL,
    `fecha_documento` DATETIME(3) NULL,
    `cantidad_anexos` INTEGER NOT NULL DEFAULT 0,
    `observaciones` TEXT NULL,
    `remitente` VARCHAR(250) NULL,
    `cargo_remitente` VARCHAR(200) NULL,
    `inst_remitente` VARCHAR(250) NULL,
    `destinatario` VARCHAR(250) NULL,
    `cargo_destinatario` VARCHAR(200) NULL,
    `inst_destinatario` VARCHAR(250) NULL,
    `area_destino_id` INTEGER NULL,
    `area_origen_id` INTEGER NULL,
    `registrado_por_id` INTEGER NOT NULL,
    `fecha_recepcion` DATETIME(3) NULL,
    `fecha_despacho` DATETIME(3) NULL,
    `fecha_entrega` DATETIME(3) NULL,
    `fecha_limite` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `correspondencias_folio_key`(`folio`),
    INDEX `correspondencias_tipo_idx`(`tipo`),
    INDEX `correspondencias_estado_idx`(`estado`),
    INDEX `correspondencias_prioridad_idx`(`prioridad`),
    INDEX `correspondencias_fecha_recepcion_idx`(`fecha_recepcion`),
    INDEX `correspondencias_area_destino_id_idx`(`area_destino_id`),
    INDEX `correspondencias_area_origen_id_idx`(`area_origen_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `anexos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `correspondencia_id` INTEGER NOT NULL,
    `nombre_archivo` VARCHAR(255) NOT NULL,
    `ruta_archivo` VARCHAR(500) NOT NULL,
    `tipo_mime` VARCHAR(100) NULL,
    `tamano_bytes` INTEGER NULL,
    `descripcion` VARCHAR(300) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sellos_digitales` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `correspondencia_id` INTEGER NOT NULL,
    `codigo_sello` VARCHAR(50) NOT NULL,
    `fecha_hora_sellado` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `cadena_original` TEXT NULL,

    UNIQUE INDEX `sellos_digitales_correspondencia_id_key`(`correspondencia_id`),
    UNIQUE INDEX `sellos_digitales_codigo_sello_key`(`codigo_sello`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `acuses` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `correspondencia_id` INTEGER NOT NULL,
    `tipo` ENUM('GENERADO', 'DIGITALIZADO') NOT NULL,
    `ruta_archivo` VARCHAR(500) NULL,
    `fecha_generacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `observaciones` TEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `firmas_recepcion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `correspondencia_id` INTEGER NOT NULL,
    `firmado_por_id` INTEGER NOT NULL,
    `fecha_firma` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `observaciones` TEXT NULL,

    UNIQUE INDEX `firmas_recepcion_correspondencia_id_firmado_por_id_key`(`correspondencia_id`, `firmado_por_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `distribuciones_internas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `correspondencia_id` INTEGER NOT NULL,
    `area_destino_id` INTEGER NOT NULL,
    `entregado_por_id` INTEGER NOT NULL,
    `recibido_por_id` INTEGER NULL,
    `estado` ENUM('PENDIENTE', 'EN_TRANSITO', 'ENTREGADA', 'RECHAZADA') NOT NULL DEFAULT 'PENDIENTE',
    `fecha_distribucion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fecha_confirmacion` DATETIME(3) NULL,
    `observaciones` TEXT NULL,

    INDEX `distribuciones_internas_correspondencia_id_idx`(`correspondencia_id`),
    INDEX `distribuciones_internas_area_destino_id_idx`(`area_destino_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `metodos_envio` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(100) NOT NULL,
    `tipo` ENUM('MENSAJERIA_INTERNA', 'SERVICIO_POSTAL', 'PAQUETERIA') NOT NULL,
    `descripcion` VARCHAR(255) NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `metodos_envio_nombre_key`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rutas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `correspondencia_id` INTEGER NOT NULL,
    `metodo_envio_id` INTEGER NOT NULL,
    `mensajero_id` INTEGER NULL,
    `asignado_por_id` INTEGER NOT NULL,
    `alcance` ENUM('LOCAL', 'NACIONAL', 'INTERNACIONAL') NOT NULL DEFAULT 'LOCAL',
    `estado` ENUM('ASIGNADA', 'EN_TRANSITO', 'ENTREGADA', 'FALLIDA') NOT NULL DEFAULT 'ASIGNADA',
    `direccion_destino` VARCHAR(500) NULL,
    `numero_guia` VARCHAR(100) NULL,
    `fecha_asignacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fecha_entrega` DATETIME(3) NULL,
    `observaciones` TEXT NULL,

    INDEX `rutas_correspondencia_id_idx`(`correspondencia_id`),
    INDEX `rutas_mensajero_id_idx`(`mensajero_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `expedientes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `correspondencia_id` INTEGER NOT NULL,
    `acuse_id` INTEGER NULL,
    `creado_por_id` INTEGER NOT NULL,
    `area_generadora_id` INTEGER NULL,
    `fecha_cierre` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `observaciones` TEXT NULL,
    `notificado` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `expedientes_correspondencia_id_key`(`correspondencia_id`),
    UNIQUE INDEX `expedientes_acuse_id_key`(`acuse_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `historial_correspondencia` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `correspondencia_id` INTEGER NOT NULL,
    `usuario_id` INTEGER NOT NULL,
    `accion` VARCHAR(100) NOT NULL,
    `detalle` TEXT NULL,
    `estado_anterior` VARCHAR(50) NULL,
    `estado_nuevo` VARCHAR(50) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `historial_correspondencia_correspondencia_id_idx`(`correspondencia_id`),
    INDEX `historial_correspondencia_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `roles_permisos` ADD CONSTRAINT `roles_permisos_rol_id_fkey` FOREIGN KEY (`rol_id`) REFERENCES `roles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `roles_permisos` ADD CONSTRAINT `roles_permisos_permiso_id_fkey` FOREIGN KEY (`permiso_id`) REFERENCES `permisos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_rol_id_fkey` FOREIGN KEY (`rol_id`) REFERENCES `roles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_area_id_fkey` FOREIGN KEY (`area_id`) REFERENCES `areas_administrativas`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sesiones` ADD CONSTRAINT `sesiones_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `solicitudes_recuperacion` ADD CONSTRAINT `solicitudes_recuperacion_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `correspondencias` ADD CONSTRAINT `correspondencias_area_destino_id_fkey` FOREIGN KEY (`area_destino_id`) REFERENCES `areas_administrativas`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `correspondencias` ADD CONSTRAINT `correspondencias_area_origen_id_fkey` FOREIGN KEY (`area_origen_id`) REFERENCES `areas_administrativas`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `correspondencias` ADD CONSTRAINT `correspondencias_registrado_por_id_fkey` FOREIGN KEY (`registrado_por_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `anexos` ADD CONSTRAINT `anexos_correspondencia_id_fkey` FOREIGN KEY (`correspondencia_id`) REFERENCES `correspondencias`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sellos_digitales` ADD CONSTRAINT `sellos_digitales_correspondencia_id_fkey` FOREIGN KEY (`correspondencia_id`) REFERENCES `correspondencias`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `acuses` ADD CONSTRAINT `acuses_correspondencia_id_fkey` FOREIGN KEY (`correspondencia_id`) REFERENCES `correspondencias`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `firmas_recepcion` ADD CONSTRAINT `firmas_recepcion_correspondencia_id_fkey` FOREIGN KEY (`correspondencia_id`) REFERENCES `correspondencias`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `firmas_recepcion` ADD CONSTRAINT `firmas_recepcion_firmado_por_id_fkey` FOREIGN KEY (`firmado_por_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `distribuciones_internas` ADD CONSTRAINT `distribuciones_internas_correspondencia_id_fkey` FOREIGN KEY (`correspondencia_id`) REFERENCES `correspondencias`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `distribuciones_internas` ADD CONSTRAINT `distribuciones_internas_area_destino_id_fkey` FOREIGN KEY (`area_destino_id`) REFERENCES `areas_administrativas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `distribuciones_internas` ADD CONSTRAINT `distribuciones_internas_entregado_por_id_fkey` FOREIGN KEY (`entregado_por_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `distribuciones_internas` ADD CONSTRAINT `distribuciones_internas_recibido_por_id_fkey` FOREIGN KEY (`recibido_por_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rutas` ADD CONSTRAINT `rutas_correspondencia_id_fkey` FOREIGN KEY (`correspondencia_id`) REFERENCES `correspondencias`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rutas` ADD CONSTRAINT `rutas_metodo_envio_id_fkey` FOREIGN KEY (`metodo_envio_id`) REFERENCES `metodos_envio`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rutas` ADD CONSTRAINT `rutas_mensajero_id_fkey` FOREIGN KEY (`mensajero_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rutas` ADD CONSTRAINT `rutas_asignado_por_id_fkey` FOREIGN KEY (`asignado_por_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `expedientes` ADD CONSTRAINT `expedientes_correspondencia_id_fkey` FOREIGN KEY (`correspondencia_id`) REFERENCES `correspondencias`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `expedientes` ADD CONSTRAINT `expedientes_acuse_id_fkey` FOREIGN KEY (`acuse_id`) REFERENCES `acuses`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `expedientes` ADD CONSTRAINT `expedientes_creado_por_id_fkey` FOREIGN KEY (`creado_por_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `expedientes` ADD CONSTRAINT `expedientes_area_generadora_id_fkey` FOREIGN KEY (`area_generadora_id`) REFERENCES `areas_administrativas`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `historial_correspondencia` ADD CONSTRAINT `historial_correspondencia_correspondencia_id_fkey` FOREIGN KEY (`correspondencia_id`) REFERENCES `correspondencias`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `historial_correspondencia` ADD CONSTRAINT `historial_correspondencia_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
