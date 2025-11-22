🏢 Sistema ERP & Gestión de Proyectos (MERN Stack)

Plataforma integral diseñada para la gestión comercial y operativa de empresas de servicios. Este sistema unifica el ciclo de vida del negocio: desde la gestión de clientes y cotizaciones, hasta la ejecución de proyectos y control financiero, todo bajo un entorno seguro con roles y permisos granulares.

🚀 Demo Online

Frontend: https://puntointegrakanban.netlify.app/login
Backend: https://puntointegrakanban.onrender.com

✨ Módulos y Funcionalidades Clave

1. 🔐 Seguridad y Administración (RBAC)

Sistema de autenticación robusto y gestión de usuarios.

Login Seguro: Autenticación mediante JWT (JSON Web Tokens) y contraseñas encriptadas con Bcrypt.

Roles Jerárquicos: Diferenciación entre Administrador (acceso total) y Usuarios Estándar.

Permisos Granulares: El administrador puede asignar permisos específicos a cada usuario mediante un sistema de casillas (checkboxes):

☑️ Ver Kanban

☑️ Ver Presupuestos

☑️ Ver Proyectos

☑️ Ver Clientes

Gestión de Usuarios: Creación, edición y eliminación de cuentas de equipo.

2. 🤝 CRM (Gestión de Clientes)

Base de datos centralizada para agilizar la venta.

Registro completo de clientes (RUT, Razón Social, Giro, Contacto, etc.).

Autocompletado: Al crear una cotización, los datos del cliente se cargan automáticamente desde esta base de datos.

3. 💰 Módulo Comercial (Cotizaciones)

Herramienta avanzada para la generación de negocios.

Cálculos en UF: Ingreso de valores netos en UF con cálculo automático de IVA y Totales.

Pipeline Visual: Tablero tipo Kanban para gestionar el estado de las cotizaciones (Pendiente -> Enviada -> Adjudicado -> Perdido).

Generación de PDF: Exportación de documentos formales con Logo corporativo y Firma digital.

Snapshot de Datos: Los datos del cliente se guardan estáticos en la cotización para mantener el histórico aunque el cliente cambie sus datos después.

4. 🏗️ Automatización Operativa (Proyectos)

El corazón de la automatización del sistema.

Disparador Automático: Al cambiar una cotización a estado "ADJUDICADO", el sistema:

Genera un código de proyecto único correlativo (P01, P02...).

Crea automáticamente la tarea inicial en el Tablero Kanban Operativo.

Gestión Financiera: Control detallado de estados de pago (Pendiente, Facturado, Pagado) con desglose de cuotas.

5. 📋 Tableros Kanban Dinámicos 2.0

Sistema de gestión de tareas altamente flexible.

Multi-Tablero: Creación ilimitada de tableros.

Estructura Matriz (Swimlanes): Soporte para Columnas Personalizadas (Estados) y Filas Personalizadas (Prioridades, Equipos, etc.).

Asignación de Equipos: El administrador decide qué usuarios tienen acceso a qué tablero.

Drag & Drop: Interfaz fluida para mover tareas entre celdas.

🛠️ Stack Tecnológico

Frontend (Cliente)

React + Vite: Core del frontend.

Axios: Peticiones HTTP con interceptores para JWT.

React Router DOM: Manejo de rutas protegidas y navegación.

@hello-pangea/dnd: Librería para la funcionalidad Drag & Drop.

jspdf & jspdf-autotable: Motor de generación de reportes PDF.

React Icons: Iconografía vectorial.

CSS3 Moderno: Variables, Flexbox, Grid y Diseño 100% Responsive (Mobile First).

Backend (Servidor)

Node.js & Express: API RESTful escalable.

MongoDB Atlas: Base de datos NoSQL en la nube.

Mongoose: Modelado de datos (Schemas) y validaciones.

JWT & Bcryptjs: Seguridad y criptografía.

📦 Instalación Local

Si deseas correr este proyecto en tu máquina local:

Clonar el repositorio

git clone https://github.com/JaviCDevops/PuntoIntegraKanban.git
cd PuntoIntegraKanban


Configurar el Backend

cd server
npm install


Crea un archivo .env en la carpeta server:

MONGO_URI=mongodb+srv://<usuario>:<password>@cluster.mongodb.net/mistareas
JWT_SECRET=tu_clave_secreta_super_segura
PORT=5000


Iniciar servidor:

npm run dev


Configurar el Frontend

Abre una nueva terminal.

cd client
npm install


(Opcional) Verifica client/src/config.js para apuntar a localhost:5000.

Iniciar cliente:

npm run dev


✒️ Autor

Desarrollado por Javier Cuevas Pérez.
Ingeniero de Software & Desarrollador Full Stack.

Este proyecto es propiedad intelectual de Javier Cuevas Pérez. Prohibida su distribución sin autorización.
