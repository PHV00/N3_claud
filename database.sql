create database security; 
use security;
CREATE TABLE user (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(45),
    password VARCHAR(255)
);
