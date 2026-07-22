-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1:3306
-- Tiempo de generación: 22-07-2026 a las 02:21:57
-- Versión del servidor: 9.1.0
-- Versión de PHP: 8.3.14

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `inmobiliaria-la-finca`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `inmuebles`
--

DROP TABLE IF EXISTS `inmuebles`;
CREATE TABLE IF NOT EXISTS `inmuebles` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `id_usuario` bigint UNSIGNED DEFAULT NULL,
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
  KEY `fk_inmuebles_usuarios` (`id_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

--
-- Volcado de datos para la tabla `inmuebles`
--

INSERT INTO `inmuebles` (`id`, `id_usuario`, `tipo_inmueble`, `precio`, `direccion`, `localidad`, `provincia`, `estado`, `fotos`, `observaciones`, `createdAt`, `updatedAt`) VALUES
(1, NULL, 'Casa', 125000.00, 'Av. del Libertador 1200', 'CABA', 'Buenos Aires', 'DISPONIBLE', 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80', 'Excelente propiedad de 3 dormitorios con piscina.', '2026-07-21 16:45:15', '2026-07-21 16:45:15'),
(2, NULL, 'Departamento', 85000.00, 'Calle Corrientes 450', 'Rosario', 'Santa Fe', 'DISPONIBLE', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80', 'Departamento céntrico de 2 ambientes luminoso.', '2026-07-21 16:45:15', '2026-07-21 16:45:15'),
(3, NULL, 'Oficina', 210000.00, 'Bv. Chacabuco 800', 'Córdoba', 'Córdoba', 'DISPONIBLE', 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80', 'Oficina corporativa en zona comercial.', '2026-07-21 16:45:15', '2026-07-21 16:45:15'),
(4, NULL, 'Chalet', 320000.00, 'Av. Pellegrini 2100', 'Rosario', 'Santa Fe', 'RESERVADO', 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80', 'Chalet de categoría con amplio jardín.', '2026-07-21 16:45:15', '2026-07-21 16:45:15'),
(5, NULL, 'Penthouse', 450000.00, 'Puerto Madero - Torres del Parque 500', 'CABA', 'Buenos Aires', 'DISPONIBLE', 'https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?auto=format&fit=crop&w=600&q=80', 'Penthouse exclusivo con vista panorámica al río, terraza privada y acabados de lujo.', '2026-07-21 16:57:42', '2026-07-21 16:57:42'),
(6, NULL, 'Duplex', 165000.00, 'Calle San Martín 1420', 'Mendoza', 'Mendoza', 'DISPONIBLE', 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=600&q=80', 'Dúplex moderno de 3 ambientes en zona residencial con cochera doble.', '2026-07-21 16:57:42', '2026-07-21 16:57:42');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
CREATE TABLE IF NOT EXISTS `usuarios` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
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
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `nombre`, `apellido`, `email`, `telefono`, `password`, `dni`, `fechaNacimiento`, `genero`, `direccion`, `ciudad`, `provincia`, `observaciones`, `rol`, `foto`, `createdAt`, `updatedAt`) VALUES
(9, 'Javier', 'Garcia', 'secretario@lafinca.com', '+5465445333335', '$2b$10$WTO0XQHgy6rcfIv0SeYoEO5DhE7Ly711Cj2v.myfu5/ThCcEThqX.', '23212233', '1990-01-21', 'Masculino', 'La Paz 546', 'San Lorenzo', 'Santa Fe', NULL, 'SECRETARIO', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&q=80', '2026-07-21 17:26:42', '2026-07-21 17:28:37'),
(10, 'Yazmin', 'Ortiz', 'cliente@lafinca.com', '+54654453333', '$2b$10$prA6gn5ABb4HGYP0mqOqT.0kibv3taPNJ.3pehrGfbKGcOuDyvM9m', '23244242', '1980-10-20', 'Femenino', 'Cordoba 234', 'Andino', 'Santa Fe', NULL, 'CLIENTE', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80', '2026-07-21 17:35:24', '2026-07-21 17:36:26');

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `inmuebles`
--
ALTER TABLE `inmuebles`
  ADD CONSTRAINT `fk_inmuebles_usuarios` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
