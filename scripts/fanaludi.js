// Establece el año actual en el pie de página
        document.getElementById('currentYear').textContent = new Date().getFullYear();

        // Manejo del formulario de contacto (simulado)
        document.getElementById('contactForm').addEventListener('submit', function(event) {
            event.preventDefault(); // Previene el envío por defecto del formulario

            const formMessage = document.getElementById('formMessage');
            formMessage.classList.remove('hidden', 'success-message', 'error-message');
            formMessage.textContent = ''; // Limpia mensajes anteriores

            // Simula un envío exitoso
            setTimeout(() => {
                formMessage.classList.add('success-message');
                formMessage.textContent = '¡Mensaje enviado con éxito! Nos pondremos en contacto contigo pronto.';
                formMessage.classList.remove('hidden');
                document.getElementById('contactForm').reset(); // Limpia el formulario
            }, 1000);
        });

        // Gemini API
        document.getElementById('getCompanyAnswerBtn').addEventListener('click', async function() {
            const questionPromptInput = document.getElementById('companyQuestionPrompt');
            const questionPrompt = questionPromptInput.value.trim();
            const answerOutputDiv = document.getElementById('companyAnswerOutput');
            const answerContentPre = document.getElementById('companyAnswerContent');
            const answerErrorDiv = document.getElementById('companyAnswerError');
            const loadingSpinner = document.getElementById('companyLoadingSpinner');
            const buttonText = document.getElementById('companyButtonText');
            const submitButton = this; // Referencia al botón que disparó el evento

            // Resetear estados visuales
            answerOutputDiv.classList.add('hidden');
            answerErrorDiv.classList.add('hidden');
            answerContentPre.textContent = '';
            answerErrorDiv.textContent = '';

            if (!questionPrompt) {
                answerErrorDiv.classList.remove('hidden');
                answerErrorDiv.textContent = 'Por favor, escribe tu pregunta sobre la empresa.';
                return;
            }

            // Mostrar spinner y deshabilitar botón
            buttonText.classList.add('hidden');
            loadingSpinner.classList.remove('hidden');
            submitButton.disabled = true;

            try {
                // El contexto de la empresa se mantiene como una cadena de texto para el prompt
                const companyInfo = `
                    Nombre de la Empresa: FaNaLuDi Software
                    Fundamentos del Nombre: Simboliza las primeras dos letras de cada integrante (Fabrizio, Nahuel, Lucas, Diego), fácil de recordar y pronunciar.
                    Logo de la Empresa: Compuesto por las iniciales de los integrantes fusionadas, con la palabra "software" debajo. Minimalista, limpio, elegante y adaptable.
                    Misión: Poder destacar en el desarrollo de software en Uruguay, con gente joven, dedicada y comprometida, sobresaliendo con visión innovadora y visionaria en el mercado local.
                    Visión: Ser reconocidos como líderes en el desarrollo de software, aportando soluciones de vanguardia y manteniendo un compromiso inquebrantable con la calidad y la satisfacción del cliente.
                    Valores de la Organización:
                    - Valoración del Empleado: Fomentar un buen ambiente laboral, comodidad y valoración, generando motivación, compromiso e interés.
                    - Compromiso y Seriedad: Profesionalismo en cada proyecto, brindando tranquilidad y confianza.
                    - Comunicación Efectiva: Comunicación clara y constante interna y con socios/clientes.
                    - Innovación: Búsqueda constante de nuevas ideas y tecnologías.

                    Equipo:
                    - Coordinador: Fabrizio Arriola (FabrizioArriola96@hotmail.com)
                    - Sub-Coordinador: Nahuel Silva (nahuelsilvavega@gmail.com)
                    - Integrante 1: Lucas Recarey (lrecarey@estudiante.ceibal.edu.uy)
                    - Integrante 2: Diego Zamora (diegozamora3784@gmail.com)

                    Proyecto Actual (S.I.G.P.D. - Draftosaurus):
                    - Propósito: Aplicación web para mejorar la experiencia del juego de mesa Draftosaurus.
                    - Funcionalidades Clave: Modo de Seguimiento (puntuación automática), Modo de Juego Digital (replicación de mecánicas), Cálculo de Puntajes automático, Validación de Movimientos, Historial y Estadísticas, Multijugador Local (2-5 jugadores).
                    - Tecnologías Utilizadas: PHP 8.x, MariaDB, HTML, CSS, JavaScript, Bootstrap. Ligero y sin conexión a internet externa.

                    Modelo de Negocio (Canvas) del Proyecto S.I.G.P.D.:
                    - Segmentos de Clientes: Jugadores de Draftosaurus (ocasionales a frecuentes), Clubs y comunidades de juegos de mesa.
                    - Propuesta de Valor: Automatiza puntuación, garantiza partidas sin errores, versión digital local, estadísticas detalladas, accesible e intuitiva sin internet.
                    - Canales: Sitio web oficial, boca a boca, redes sociales.
                    - Relación con los Clientes: Manual de usuario, feedback (encuestas, foros), soporte y actualizaciones continuas (offline), contacto email.
                    - Fuentes de Ingresos: Actualmente no genera ingresos directos, potencial de monetización futura (versión premium, expansiones, patrocinio, colaboración).
                    - Actividades Clave: Desarrollo del sistema de gestión de partidas, programación de lógica (reglas, recintos, puntuación), interfaz web, testeo, documentación.
                    - Recursos Clave: Conocimientos técnicos (PHP, JS, MySQL), equipos, conexión con comunidad de jugadores, dominio de reglas del juego base.
                    - Socios Clave: Liceo ISBO, plataformas de código abierto (Bootstrap, GitHub).
                    - Estructura de Costos: Tiempo de desarrollo del equipo, costos operativos mínimos (energía, equipos), materiales de presentación, hosting local, documentación y mantenimiento.
                `;

                const prompt = `Utiliza únicamente la información proporcionada sobre FaNaLuDi Software para responder a la siguiente pregunta. Si la información no es suficiente para responder, indica que no tienes esa información.
                
                Información de la empresa:
                ${companyInfo}

                Pregunta: "${questionPrompt}"`;

                // Aquí se usaría el historial de chat si se quisiera mantener una conversación continua.
                // Para una pregunta única, un solo turno de usuario es suficiente.
                const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };
                
                // La API Key será proporcionada por el entorno de Google Canvas automáticamente.
                const apiKey = ""; 
                const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                const result = await response.json();

                if (result.candidates && result.candidates.length > 0 &&
                    result.candidates[0].content && result.candidates[0].content.parts &&
                    result.candidates[0].content.parts.length > 0) {
                    const text = result.candidates[0].content.parts[0].text;
                    answerContentPre.textContent = text;
                    answerOutputDiv.classList.remove('hidden');
                } else {
                    answerErrorDiv.classList.remove('hidden');
                    answerErrorDiv.textContent = 'No se pudo generar una respuesta. Intenta con una pregunta diferente o reformúlala.';
                    console.error('Unexpected API response structure:', result);
                }
            } catch (error) {
                console.error('Error calling Gemini API:', error);
                answerErrorDiv.classList.remove('hidden');
                answerErrorDiv.textContent = 'Hubo un problema al conectar con la API. Asegúrate de que tu conexión esté activa.';
            } finally {
                // Ocultar spinner y re-habilitar botón
                loadingSpinner.classList.add('hidden');
                buttonText.classList.remove('hidden');
                submitButton.disabled = false;
            }
        });