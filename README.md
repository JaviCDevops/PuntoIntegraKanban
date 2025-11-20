 Sistema ERP & Gestión de Proyectos (MERN Stack)

Plataforma web integral para la gestión operativa y comercial de la empresa. Este sistema unifica el flujo de trabajo desde la cotización inicial hasta la ejecución del proyecto, incluyendo control financiero y seguimiento de tareas mediante Kanban.

 Demo Online

Frontend: [[Tu Link de Netlify aquí]](https://puntointegrakanban.netlify.app/cotizaciones)
Backend: [[Tu Link de Render aquí]](https://puntointegrakanban.onrender.com/)

 Módulos y Funcionalidades

 Módulo de Cotizaciones (Presupuestos)

Sistema avanzado para la creación y seguimiento de propuestas comerciales.

Cálculos Automáticos: Ingresa el valor Neto en UF y el sistema calcula automáticamente IVA (19%) y Total.

Generación de PDF: Crea documentos formales con un clic, incluyendo:

Logo corporativo.

Firma digital de la empresa.

Detalle de costos desglosados.

Estados Visuales:

 0-PENDIENTE DE ENVIO

 1-ESPERA RESPUESTA CLIENTE (Registra fecha de envío automática)

 2-ADJUDICADO (Activa automatizaciones)

 3-PERDIDO

Privacidad: Botón para ocultar montos sensibles en reuniones.

2.  Gestión de Proyectos (PXX)

Módulo exclusivo para obras adjudicadas.

Automatización Inteligente: Al cambiar una cotización a "ADJUDICADO", el sistema:

Genera un código de proyecto correlativo único (P01, P02...).

Crea automáticamente una tarjeta en el tablero Kanban.

Control de Pagos y Facturación:

Modal interactivo para gestionar cuotas.

División porcentual de pagos (ej: 4 pagos de 25%).

Seguimiento de Nº de Factura y estados: Pendiente, Facturado, Pagado.

Indicadores visuales de progreso de pago en la tabla principal.

3.  Tablero Kanban

Gestión operativa de tareas con funcionalidad "Drag & Drop".

Columnas: Pendiente | En Proceso | Terminado.

Edición rápida de títulos.

Sincronización en tiempo real con la base de datos.

4. Diseño Responsive

Interfaz 100% adaptable a dispositivos móviles.

Las tablas complejas se transforman en tarjetas verticales ("Cards") en celulares para fácil lectura.

Botones y controles optimizados para pantallas táctiles.

 Tecnologías Utilizadas

Frontend (Cliente)

React + Vite: Framework principal.

Axios: Comunicación con API.

jspdf & jspdf-autotable: Motor de generación de documentos PDF.

react-icons: Iconografía profesional.

@hello-pangea/dnd: Librería para arrastrar y soltar (Kanban).

CSS3: Estilos personalizados y Media Queries avanzadas.

Backend (Servidor)

Node.js & Express: API RESTful robusta.

MongoDB Atlas: Base de datos NoSQL en la nube.

Mongoose: Modelado de datos (Schemas con validaciones).

 Instalación Local

Sigue estos pasos para correr el proyecto en tu computador:

Clonar el repositorio

git clone [https://github.com/TU_USUARIO/PuntoIntegraKanban.git](https://github.com/TU_USUARIO/PuntoIntegraKanban.git)
cd PuntoIntegraKanban


Configurar Backend

cd server
npm install
# Crea un archivo .env en /server con:
# MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/db
npm run dev


Configurar Frontend

cd client
npm install
# Crea un archivo .env en /client si es necesario, o usa config.js
npm run dev


 Seguridad y Variables de Entorno

Este proyecto utiliza variables de entorno para proteger credenciales sensibles.

Backend: MONGO_URI (Conexión a Base de Datos).

Frontend: VITE_API_URL (Dirección del servidor de producción).

 Autor

Desarrollado por Javier Cuevas Pérez.
Expertise en Desarrollo Full Stack MERN y Automatización de Procesos.
