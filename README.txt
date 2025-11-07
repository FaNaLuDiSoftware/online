# proyectoDraftosaurus
Proyecto de UTU-ISBO - Draftosaurus Game

El primer paso es acceder al código del proyecto, que se encuentra alojado en GitHub.
Acceso a GitHub:
Navegue al repositorio del proyecto en GitHub. La URL específica de este repositorio se proporcionará en la "Sección 7. Control de Versiones y Repositorio" del documento principal del proyecto.
Descarga del Repositorio:
Existen dos métodos principales para obtener el código:
Descarga Directa (ZIP): En la página del repositorio de GitHub, localice el botón "Code" (o "Código") y seleccione la opción "Download ZIP" (o "Descargar ZIP"). Este método es el más sencillo para obtener una copia estática del proyecto sin necesidad de herramientas adicionales de control de versiones.
Clonación con Git (Recomendado para desarrollo): Si tiene Git instalado en su sistema, puede clonar el repositorio usando la línea de comandos. Copie la URL HTTPS del repositorio (también disponible al hacer clic en el botón "Code") y ejecute el comando git clone [ENLACE A GITHUB] en su terminal o línea de comandos. Este método es preferible para el desarrollo continuo, ya que permite gestionar versiones, realizar actualizaciones y colaborar eficientemente con el equipo.



Descompresión del Archivo (si aplica)
Si optó por la descarga en formato .zip, es necesario extraer su contenido antes de poder trabajar con el proyecto.
Una vez finalizada la descarga, localice el archivo .zip en su sistema (comúnmente en la carpeta de "Descargas").
Haga clic derecho sobre el archivo .zip y seleccione la opción "Extraer todo" (o una opción similar, como "Descomprimir aquí" o "Extract Here", dependiendo de su sistema operativo y software de compresión).
Elija una ubicación conveniente y de fácil acceso en su equipo para la carpeta descomprimida. Asegúrese de que la ruta resultante sea conocida para los siguientes pasos.
Abrir el Proyecto en Visual Studio Code
Con el código ya en su equipo, el siguiente paso es abrir el proyecto en su entorno de desarrollo integrado (IDE).
Iniciar Visual Studio Code: Abra la aplicación Visual Studio Code.
Abrir la Carpeta del Proyecto:
Diríjase al menú Archivo (o File) en la barra superior.
Seleccione la opción Abrir Carpeta... (o Open Folder...).
Navegue hasta la carpeta raíz de su proyecto (la que acaba de descomprimir o clonar, por ejemplo, Draftosaurus). Esta es la carpeta que contiene el archivo index.html y las subcarpetas del proyecto (como css, js, php, etc.).
Seleccione esta carpeta y haga clic en "Seleccionar Carpeta". Visual Studio Code cargará todos los archivos y la estructura del proyecto en su explorador.

 Ejecutar el Frontend con la Extensión Live Server
Para visualizar la interfaz de usuario del proyecto (la parte frontend, que incluye HTML, CSS y JavaScript) de manera rápida y con recarga automática, utilizaremos la extensión Live Server de Visual Studio Code.
Localizar index.html: Dentro del explorador de archivos de Visual Studio Code (ubicado en la barra lateral izquierda), navegue y localice el archivo principal del frontend, que es index.html.
Iniciar Live Server:
Haga clic derecho sobre el archivo index.html.
En el menú contextual que aparece, seleccione la opción "Open with Live Server".
Esta acción iniciará un servidor de desarrollo local a través de la extensión Live Server y abrirá automáticamente el archivo index.html en su navegador web predeterminado.
Beneficios de Live Server:
Podrá visualizar la interfaz de usuario del juego en tiempo real.
Cada vez que guarde cambios en los archivos HTML, CSS o JavaScript del frontend, el navegador se recargará automáticamente, lo que agiliza significativamente el proceso de desarrollo y prueba visual.
Es importante destacar que esta ejecución solo muestra la parte visual y la lógica del frontend; la lógica de backend (PHP y la conexión a la base de datos) no estará operativa a través de Live Server y requerirá la configuración completa del stack de servidor (Apache, PHP, MariaDB) detallada en el documento principal.



Antes de ingresar a la página se debe de crear la base de datos con el siguiente codigo. Luego de ejecutarlo ya sería posible abrir la página/juego (index.html) sin ningún tipo de problema.

------------------------------
BASE DE DATOS DE NUESTRO JUEGO
------------------------------
-- creamos y usamos la base de datos
CREATE DATABASE usuarios_registrados_bd;
USE usuarios_registrados_bd;

-- creamos la tabla de registro de usuarios
CREATE TABLE register_user (
    id_user INT AUTO_INCREMENT PRIMARY KEY,
    user_name VARCHAR(20) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    score INT NOT NULL,
    money INT NOT NULL
);

-- creamos la tabla de ranking del seguimiento
CREATE TABLE ranking_tracking (
    id_user_rt INT AUTO_INCREMENT PRIMARY KEY,
    user_name_rt VARCHAR(20) NOT NULL UNIQUE,
    score_rt INT NOT NULL
);

-- creamos el usuario ADMIN con la contraseña hasheada

INSERT INTO register_user (user_name, password, score, money)
VALUES ('ADMIN', '$2b$12$oc5rbYqq..aUtOa6LkWVJ.bzZqyidNJGiswjeBYY0O0OecTqEc2h2', 0, 0);

-- damos todos los privilegios sobre la base al ADMIN
GRANT ALL PRIVILEGES ON usuarios_registrados_bd.* TO 'ADMIN'@'localhost';

-- creamos tabla de partidas
CREATE TABLE party_tables (
    id_table INT AUTO_INCREMENT PRIMARY KEY,
    table_name VARCHAR(20) NOT NULL,
    table_code INT NOT NULL
);

------------------------------
FIN DE LA BASE DE DATOS
------------------------------

IMPORTANTE: Para poder ingresar como administrador se debe ingresar como:
usuario: ADMIN
contraseña: patitofanatico69
