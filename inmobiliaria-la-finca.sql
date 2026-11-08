-- MySQL dump 10.13  Distrib 9.1.0, for Win64 (x86_64)
--
-- Host: localhost    Database: inmobiliaria-la-finca
-- ------------------------------------------------------
-- Server version	9.1.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `conceptos_recibo`
--

DROP TABLE IF EXISTS `conceptos_recibo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `conceptos_recibo` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `id_recibo` bigint unsigned NOT NULL,
  `concepto` varchar(100) COLLATE utf8mb4_spanish_ci NOT NULL,
  `monto` decimal(12,2) NOT NULL DEFAULT '0.00',
  `es_obligatorio` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `fk_conceptos_recibos` (`id_recibo`),
  CONSTRAINT `fk_conceptos_recibos` FOREIGN KEY (`id_recibo`) REFERENCES `recibos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `conceptos_recibo`
--

LOCK TABLES `conceptos_recibo` WRITE;
/*!40000 ALTER TABLE `conceptos_recibo` DISABLE KEYS */;
INSERT INTO `conceptos_recibo` VALUES (1,1,'Alquiler Mensual',125000.00,1),(2,1,'Expensas Comunes',20000.00,1),(3,1,'Agua Corriente',5000.00,0),(4,1,'Energía Eléctrica (Luz)',5000.00,0),(5,2,'Alquiler Mensual',85000.00,1),(6,2,'Expensas Comunes',15000.00,1),(7,2,'Agua Corriente',3000.00,0),(8,2,'Gas Natural',2000.00,0),(9,3,'Alquiler Mensual',125000.00,1),(10,3,'Expensas Comunes',22000.00,1),(11,3,'Agua Corriente',5500.00,0),(12,3,'Energía Eléctrica (Luz)',5500.00,0),(13,4,'Alquiler Mensual',85000.00,1),(14,4,'Expensas Comunes',15000.00,1),(15,4,'Agua Corriente',3000.00,0),(16,4,'Gas Natural',2000.00,0),(17,5,'Alquiler Comercial',210000.00,1),(18,5,'Expensas Edificio',25000.00,1),(19,5,'Impuestos Municipales',10000.00,0),(20,6,'Alquiler Chalet',320000.00,1),(21,6,'Mantenimiento Parque',25000.00,0),(22,6,'Agua Corriente',15000.00,0);
/*!40000 ALTER TABLE `conceptos_recibo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cuentas_bancarias`
--

DROP TABLE IF EXISTS `cuentas_bancarias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cuentas_bancarias` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `banco` varchar(100) COLLATE utf8mb4_spanish_ci NOT NULL,
  `numero_cuenta` varchar(50) COLLATE utf8mb4_spanish_ci NOT NULL,
  `cbu_alias` varchar(100) COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `titular` varchar(150) COLLATE utf8mb4_spanish_ci NOT NULL,
  `tipo_cuenta` varchar(50) COLLATE utf8mb4_spanish_ci DEFAULT 'Cuenta Corriente',
  `saldo` decimal(14,2) NOT NULL DEFAULT '0.00',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cuentas_bancarias`
--

LOCK TABLES `cuentas_bancarias` WRITE;
/*!40000 ALTER TABLE `cuentas_bancarias` DISABLE KEYS */;
INSERT INTO `cuentas_bancarias` VALUES (1,'Banco Santander','CC-45892-01','LAFINCA.PROPIEDADES','Inmobiliaria La Finca S.A.','Cuenta Corriente',500000.00,'2026-11-08 00:16:14','2026-11-08 00:16:14'),(2,'Banco Galicia','CA-88912-03','LAFINCA.GALICIA','Inmobiliaria La Finca S.A.','Caja de Ahorro',250000.00,'2026-11-08 03:18:52','2026-11-08 03:18:52');
/*!40000 ALTER TABLE `cuentas_bancarias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inmuebles`
--

DROP TABLE IF EXISTS `inmuebles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inmuebles` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `id_usuario` bigint unsigned DEFAULT NULL,
  `tipo_inmueble` varchar(100) COLLATE utf8mb4_spanish_ci NOT NULL,
  `precio` decimal(12,2) NOT NULL,
  `direccion` varchar(255) COLLATE utf8mb4_spanish_ci NOT NULL,
  `localidad` varchar(100) COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `provincia` varchar(100) COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `estado` varchar(50) COLLATE utf8mb4_spanish_ci DEFAULT 'DISPONIBLE',
  `fotos` text COLLATE utf8mb4_spanish_ci,
  `observaciones` text COLLATE utf8mb4_spanish_ci,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_inmuebles_usuarios` (`id_usuario`),
  CONSTRAINT `fk_inmuebles_usuarios` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inmuebles`
--

LOCK TABLES `inmuebles` WRITE;
/*!40000 ALTER TABLE `inmuebles` DISABLE KEYS */;
INSERT INTO `inmuebles` VALUES (1,NULL,'Casa',125000.00,'Av. del Libertador 1200','CABA','Buenos Aires','DISPONIBLE','https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80','Excelente propiedad de 3 dormitorios con piscina.','2026-07-21 16:45:15','2026-07-21 16:45:15'),(2,NULL,'Departamento',85000.00,'Calle Corrientes 450','Rosario','Santa Fe','DISPONIBLE','https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80','Departamento céntrico de 2 ambientes luminoso.','2026-07-21 16:45:15','2026-07-21 16:45:15'),(3,NULL,'Oficina',210000.00,'Bv. Chacabuco 800','Córdoba','Córdoba','DISPONIBLE','https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80','Oficina corporativa en zona comercial.','2026-07-21 16:45:15','2026-07-21 16:45:15'),(4,NULL,'Chalet',320000.00,'Av. Pellegrini 2100','Rosario','Santa Fe','RESERVADO','https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80','Chalet de categoría con amplio jardín.','2026-07-21 16:45:15','2026-07-21 16:45:15'),(5,NULL,'Penthouse',450000.00,'Puerto Madero - Torres del Parque 500','CABA','Buenos Aires','DISPONIBLE','https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?auto=format&fit=crop&w=600&q=80','Penthouse exclusivo con vista panorámica al río, terraza privada y acabados de lujo.','2026-07-21 16:57:42','2026-07-21 16:57:42'),(6,NULL,'Duplex',165000.00,'Calle San Martín 1420','Mendoza','Mendoza','DISPONIBLE','https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=600&q=80','Dúplex moderno de 3 ambientes en zona residencial con cochera doble.','2026-07-21 16:57:42','2026-07-21 16:57:42');
/*!40000 ALTER TABLE `inmuebles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `movimientos_bancarios`
--

DROP TABLE IF EXISTS `movimientos_bancarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `movimientos_bancarios` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `id_cuenta` bigint unsigned NOT NULL,
  `id_inmueble` bigint unsigned DEFAULT NULL,
  `id_recibo` bigint unsigned DEFAULT NULL,
  `tipo` enum('INGRESO','GASTO') COLLATE utf8mb4_spanish_ci NOT NULL,
  `categoria` varchar(100) COLLATE utf8mb4_spanish_ci NOT NULL,
  `monto` decimal(12,2) NOT NULL,
  `fecha` date NOT NULL,
  `descripcion` text COLLATE utf8mb4_spanish_ci,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_movimientos_cuentas` (`id_cuenta`),
  KEY `fk_movimientos_inmuebles` (`id_inmueble`),
  KEY `fk_movimientos_recibos` (`id_recibo`),
  CONSTRAINT `fk_movimientos_cuentas` FOREIGN KEY (`id_cuenta`) REFERENCES `cuentas_bancarias` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_movimientos_inmuebles` FOREIGN KEY (`id_inmueble`) REFERENCES `inmuebles` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_movimientos_recibos` FOREIGN KEY (`id_recibo`) REFERENCES `recibos` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `movimientos_bancarios`
--

LOCK TABLES `movimientos_bancarios` WRITE;
/*!40000 ALTER TABLE `movimientos_bancarios` DISABLE KEYS */;
INSERT INTO `movimientos_bancarios` VALUES (1,1,1,NULL,'INGRESO','Cobro de Alquiler',155000.00,'2026-10-05','Cobro Recibo REC-2026-001 (Carlos Benítez)','2026-11-08 03:18:52','2026-11-08 03:18:52'),(2,1,2,NULL,'INGRESO','Cobro de Alquiler',105000.00,'2026-10-08','Cobro Recibo REC-2026-002 (Mariana Gómez)','2026-11-08 03:18:52','2026-11-08 03:18:52'),(3,1,2,NULL,'GASTO','Reparación de ascensor',45000.00,'2026-10-12','Mantenimiento preventivo y reemplazo de contactores en ascensor.','2026-11-08 03:18:52','2026-11-08 03:18:52'),(4,1,3,NULL,'GASTO','Sueldo señora de limpieza',80000.00,'2026-10-30','Honorarios mensuales de maestranza en oficinas.','2026-11-08 03:18:52','2026-11-08 03:18:52'),(5,1,1,NULL,'INGRESO','Cobro de Alquiler',158000.00,'2026-11-04','Cobro Recibo REC-2026-003 (Carlos Benítez)','2026-11-08 03:18:52','2026-11-08 03:18:52'),(6,1,2,NULL,'GASTO','Mantenimiento y plomería',35000.00,'2026-11-02','Reparación de bomba elevadora de agua y tablero.','2026-11-08 03:18:52','2026-11-08 03:18:52'),(7,2,4,NULL,'GASTO','Mantenimiento y plomería',22000.00,'2026-11-05','Desobstrucción y service de cañerías en cocina.','2026-11-08 03:18:52','2026-11-08 03:18:52');
/*!40000 ALTER TABLE `movimientos_bancarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `recibos`
--

DROP TABLE IF EXISTS `recibos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `recibos` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `numero_recibo` varchar(50) COLLATE utf8mb4_spanish_ci NOT NULL,
  `id_inmueble` bigint unsigned NOT NULL,
  `id_cliente` bigint unsigned DEFAULT NULL,
  `fecha_emision` date NOT NULL,
  `periodo` varchar(30) COLLATE utf8mb4_spanish_ci NOT NULL,
  `total` decimal(12,2) NOT NULL DEFAULT '0.00',
  `estado` enum('PENDIENTE','COBRADO') COLLATE utf8mb4_spanish_ci NOT NULL DEFAULT 'PENDIENTE',
  `fecha_cobro` date DEFAULT NULL,
  `observaciones` text COLLATE utf8mb4_spanish_ci,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_recibos_inmuebles` (`id_inmueble`),
  KEY `fk_recibos_clientes` (`id_cliente`),
  CONSTRAINT `fk_recibos_clientes` FOREIGN KEY (`id_cliente`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_recibos_inmuebles` FOREIGN KEY (`id_inmueble`) REFERENCES `inmuebles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `recibos`
--

LOCK TABLES `recibos` WRITE;
/*!40000 ALTER TABLE `recibos` DISABLE KEYS */;
INSERT INTO `recibos` VALUES (1,'REC-2026-001',1,13,'2026-10-01','Octubre 2026',155000.00,'COBRADO','2026-10-05','Cobro abonado por transferencia bancaria.','2026-11-08 03:18:52','2026-11-08 03:18:52'),(2,'REC-2026-002',2,14,'2026-10-01','Octubre 2026',105000.00,'COBRADO','2026-10-08','Pago en término.','2026-11-08 03:18:52','2026-11-08 03:18:52'),(3,'REC-2026-003',1,13,'2026-11-01','Noviembre 2026',158000.00,'COBRADO','2026-11-04','Abonado con Santander Débito.','2026-11-08 03:18:52','2026-11-08 03:18:52'),(4,'REC-2026-004',2,14,'2026-11-01','Noviembre 2026',105000.00,'PENDIENTE',NULL,'Vencimiento el 10/11.','2026-11-08 03:18:52','2026-11-08 03:18:52'),(5,'REC-2026-005',3,15,'2026-11-01','Noviembre 2026',245000.00,'PENDIENTE',NULL,'Locación comercial.','2026-11-08 03:18:52','2026-11-08 03:18:52'),(6,'REC-2026-006',4,16,'2026-11-01','Noviembre 2026',360000.00,'PENDIENTE',NULL,'Aguardando confirmación de transferencia.','2026-11-08 03:18:52','2026-11-08 03:18:52');
/*!40000 ALTER TABLE `recibos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) COLLATE utf8mb4_spanish_ci NOT NULL,
  `apellido` varchar(100) COLLATE utf8mb4_spanish_ci NOT NULL,
  `email` varchar(150) COLLATE utf8mb4_spanish_ci NOT NULL,
  `telefono` varchar(50) COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_spanish_ci NOT NULL,
  `dni` varchar(50) COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `fechaNacimiento` date DEFAULT NULL,
  `genero` varchar(50) COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `direccion` varchar(255) COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `ciudad` varchar(100) COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `provincia` varchar(100) COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `observaciones` text COLLATE utf8mb4_spanish_ci,
  `rol` varchar(50) COLLATE utf8mb4_spanish_ci DEFAULT 'CLIENTE',
  `foto` varchar(255) COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (9,'Javier','Garcia','secretario@lafinca.com','+5465445333335','$2b$10$WTO0XQHgy6rcfIv0SeYoEO5DhE7Ly711Cj2v.myfu5/ThCcEThqX.','23212233','1990-01-21','Masculino','La Paz 546','San Lorenzo','Santa Fe',NULL,'SECRETARIO','https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&q=80','2026-07-21 17:26:42','2026-07-21 17:28:37'),(10,'Yazmin','Ortiz','cliente@lafinca.com','+54654453333','$2b$10$prA6gn5ABb4HGYP0mqOqT.0kibv3taPNJ.3pehrGfbKGcOuDyvM9m','23244242','1980-10-20','Femenino','Cordoba 234','Andino','Santa Fe',NULL,'CLIENTE','https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80','2026-07-21 17:35:24','2026-07-21 17:36:26'),(13,'Carlos','Benítez','carlos.benitez@gmail.com','+54 341 512-3456','$2b$10$R05Ch5w7AugAeNLpLH2oeucwqnjM67o9epFCNkZfjNnZExxEJPZ4y','30125488','1983-04-15','Masculino','Bv. Oroño 1120, Piso 4','Rosario','Santa Fe','Inquilino con aval bancario de Banco Macro y recibo de sueldo.','CLIENTE','https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80','2026-11-08 03:18:51','2026-11-08 03:18:51'),(14,'Mariana','Gómez','mariana.gomez@gmail.com','+54 341 698-7654','$2b$10$R05Ch5w7AugAeNLpLH2oeucwqnjM67o9epFCNkZfjNnZExxEJPZ4y','32458912','1987-08-22','Femenino','Calle Alvear 450','Rosario','Santa Fe','Contrato laboral por tiempo indeterminado. Garantes propietarios.','CLIENTE','https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80','2026-11-08 03:18:52','2026-11-08 03:18:52'),(15,'Roberto','Rossi','roberto.rossi@gmail.com','+54 341 456-7890','$2b$10$R05Ch5w7AugAeNLpLH2oeucwqnjM67o9epFCNkZfjNnZExxEJPZ4y','28912345','1981-12-05','Masculino','Av. Fuerza Aérea 2300','Funes','Santa Fe','Profesional independiente. Contrato de locación comercial de 3 años.','CLIENTE','https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80','2026-11-08 03:18:52','2026-11-08 03:18:52'),(16,'Sofía','Martínez','sofia.martinez@gmail.com','+54 341 555-8899','$2b$10$R05Ch5w7AugAeNLpLH2oeucwqnjM67o9epFCNkZfjNnZExxEJPZ4y','35123987','1991-03-30','Femenino','Paraguay 890','Rosario','Santa Fe','Cuenta con seguro de caución Finaer.','CLIENTE','https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80','2026-11-08 03:18:52','2026-11-08 03:18:52'),(17,'Andrés','Fernández','andres.fernandez@gmail.com','+54 341 711-2233','$2b$10$R05Ch5w7AugAeNLpLH2oeucwqnjM67o9epFCNkZfjNnZExxEJPZ4y','31874521','1985-09-18','Masculino','Urquiza 2100','Roldán','Santa Fe','Propietario interesado en vender duplex.','CLIENTE','https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=256&q=80','2026-11-08 03:18:52','2026-11-08 03:18:52');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-08  0:20:47
