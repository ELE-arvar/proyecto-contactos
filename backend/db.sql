CREATE DATABASE contactos_db;
USE contactos_db;

CREATE TABLE contactos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255),       
  apellido VARCHAR(255),     
  edad INT,                  
  correo VARCHAR(255),       
  celular VARCHAR(255),      
  foto TEXT                  
);
