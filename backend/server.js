const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const app = express();
const port = 3000;

// Middleware para parsear JSON con un límite mayor
app.use(express.json({ limit: '10mb' })); // Aumenta el límite a 10 MB

// Resto de tu código...
// Middleware
app.use(cors());
app.use(express.json()); // Middleware para parsear JSON

// Configuración de multer para manejar la subida de imágenes
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Carpeta donde se guardarán las imágenes
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Nombre único para el archivo
  }
});
const upload = multer({ storage: storage });

// Hacer la carpeta 'uploads' accesible al público
app.use('/uploads', express.static('uploads'));

// Conexión a MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Antonella*100pre',
  database: 'contactos_db',
});

db.connect(err => {
  if (err) {
    console.error('Error conectando a la base de datos:', err);
    return;
  }
  console.log('Conectado a MySQL');
});
//------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------
// Ruta para obtener todos los contactos
app.get('/api/contactos', (req, res) => {
  const sql = 'SELECT * FROM contactos';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error al obtener contactos:', err);
      return res.status(500).send('Error del servidor');
    }
    res.json(results);
  });
});

// Ruta para agregar nuevo contacto (con subida de imagen)
app.post('/api/contactos', (req, res) => {
    const { nombre, apellido, edad, correo, celular, foto } = req.body;

    if (!nombre || !apellido || isNaN(edad) || !correo || !celular || !foto) {
        return res.status(400).send('Todos los campos son obligatorios');
    }

    const sql = 'INSERT INTO contactos (nombre, apellido, edad, correo, celular, foto) VALUES (?, ?, ?, ?, ?, ?)';
    
    db.query(sql, [nombre, apellido, edad, correo, celular, foto], (err, result) => {
        if (err) {
            console.error('Error al guardar en la base de datos:', err);
            return res.status(500).send('Error al guardar el contacto');
        }
        res.json({ id: result.insertId, nombre, apellido, edad, correo, celular, foto });
    });
});

app.put('/api/contactos/:id', (req, res) => {
    const { id } = req.params;
    const { nombre, apellido, edad, correo, celular, foto } = req.body;

    if (!nombre || !apellido || isNaN(edad) || !correo || !celular) {
        return res.status(400).send('Todos los campos son obligatorios');
    }

    const sql = 'UPDATE contactos SET nombre = ?, apellido = ?, edad = ?, correo = ?, celular = ?, foto = ? WHERE id = ?';
    
    db.query(sql, [nombre, apellido, edad, correo, celular, foto, id], (err, result) => {
        if (err) {
            console.error('Error al actualizar contacto:', err);
            return res.status(500).send('Error al actualizar el contacto');
        }
        res.json({ id, nombre, apellido, edad, correo, celular, foto });
    });
});

// Ruta para actualizar un contacto existente
app.put('/api/contactos/:id', upload.single('foto'), (req, res) => {
  const { id } = req.params;
  const { nombre, apellido, edad, correo, celular } = req.body;
  const foto = req.file ? req.file.path : req.body.foto; // Si se envía una nueva imagen, actualizarla

  console.log('Datos recibidos en PUT:', req.body);
  console.log('ID recibido:', id);

  if (!nombre || !apellido || isNaN(edad) || !correo || !celular) {
    return res.status(400).send('Todos los campos son obligatorios y válidos');
  }

  const sql = 'UPDATE contactos SET nombre = ?, apellido = ?, edad = ?, correo = ?, celular = ?, foto = ? WHERE id = ?';
  
  db.query(sql, [nombre, apellido, edad, correo, celular, foto, id], (err, result) => {
    if (err) {
      console.error('Error al actualizar contacto:', err);
      return res.status(500).send('Error al actualizar el contacto');
    }
    res.json({ id, nombre, apellido, edad, correo, celular, foto });
  });
});

// Ruta para eliminar un contacto
app.delete('/api/contactos/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM contactos WHERE id = ?';

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Error al eliminar contacto:', err);
      return res.status(500).send('Error al eliminar el contacto');
    }
    res.status(204).send(); // Eliminar correctamente
  });
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
