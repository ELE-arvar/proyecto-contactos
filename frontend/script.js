document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('dataForm');
    const dataList = document.getElementById('dataList');
    const cancelButton = document.getElementById('cancelButton');
    
    let contactos = [];
    let editId = null;

    // Cargar contactos
    const cargarContactos = () => {
        fetch('http://localhost:3000/api/contactos')
            .then(response => response.json())
            .then(data => {
                contactos = data;
                renderContactos();
            })
            .catch(error => console.error('Error al cargar:', error));
    };
    cargarContactos();

    // Renderizar contactos
    const renderContactos = () => {
        dataList.innerHTML = '';
        
        contactos.forEach(contacto => {
            const div = document.createElement('div');
            div.className = 'contact-item';
            div.innerHTML = `
                <img src="${contacto.foto || 'placeholder.jpg'}" alt="Foto de ${contacto.nombre}">
                <div class="details">
                    <h3>${contacto.nombre} ${contacto.apellido}</h3>
                    <p>Edad: ${contacto.edad}</p>
                    <p>Correo: ${contacto.correo}</p>
                    <p>Celular: ${contacto.celular}</p>
                </div>
                <div class="actions">
                    <button onclick="editarContacto(${contacto.id})">Editar</button>
                    <button onclick="eliminarContacto(${contacto.id})">Eliminar</button>
                </div>
            `;
            dataList.appendChild(div);
        });
    };
//--------------------------------------------------------------------------------------


    form.addEventListener('submit', (e) => {
    e.preventDefault();

    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const age = parseInt(document.getElementById('age').value.trim(), 10);
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const image = document.getElementById('image').files[0];

    if (!firstName || !lastName || isNaN(age) || !email || !phone) {
        return alert('Todos los campos son obligatorios');
    }

    const contacto = {
        nombre: firstName,
        apellido: lastName,
        edad: age,
        correo: email,
        celular: phone,
        foto: ''
    };

    if (image) {
        const reader = new FileReader();
        reader.onload = () => {
            contacto.foto = reader.result;
            guardarContacto(contacto);
        };
        reader.readAsDataURL(image);
    } else {
        guardarContacto(contacto);
    }
});

    const obtenerFotoActual = (id) => {
        const contacto = contactos.find(c => c.id === id);
        return contacto ? contacto.foto : '';
    };

    const guardarContacto = (contacto) => {
        const method = editId ? 'PUT' : 'POST';
        const url = editId 
            ? `http://localhost:3000/api/contactos/${editId}`
            : 'http://localhost:3000/api/contactos';
    
        console.log('Datos que se están enviando:', contacto);

        fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(contacto)  // Convertir los datos a JSON
        })
        .then(response => {
            if (!response.ok) throw new Error('Error en la solicitud');
            return response.json();
        })
        .then(data => {
            console.log('Respuesta del servidor:', data);  // Verificar la respuesta del servidor
            
            // Mostrar una confirmación en la interfaz
            alert('Contacto guardado con éxito.');

            // Restablecer el formulario
            form.reset();
            editId = null;
            document.getElementById('image').required = true;

            // Recargar la lista de contactos
            cargarContactos();
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Hubo un error al guardar los datos');
        });
    };

    window.eliminarContacto = (id) => {
        if (confirm('¿Estás seguro?')) {
            fetch(`http://localhost:3000/api/contactos/${id}`, { method: 'DELETE' })
                .then(() => cargarContactos())
                .catch(error => console.error('Error al eliminar:', error));
        }
    };

    window.editarContacto = (id) => {
        editId = id;
        const contacto = contactos.find(c => c.id === id);
        
        document.getElementById('firstName').value = contacto.nombre;
        document.getElementById('lastName').value = contacto.apellido;
        document.getElementById('age').value = contacto.edad;
        document.getElementById('email').value = contacto.correo;
        document.getElementById('phone').value = contacto.celular;
        document.getElementById('image').required = false;
    };

    cancelButton.addEventListener('click', () => {
        form.reset();
        editId = null;
        document.getElementById('image').required = true;
    });
});
