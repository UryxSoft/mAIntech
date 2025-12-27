/**
 * main.js
 * Funcionalidad Vanilla JS para Interacciones y Accesibilidad
 * * TODO: Implementar la funcionalidad de toggle para los menús desplegables 
 * en la línea de tiempo.
 */

document.addEventListener('DOMContentLoaded', () => {
    const timelineItems = document.querySelectorAll('.timeline-item');

    timelineItems.forEach(item => {
        const header = item.querySelector('.timeline-header');
        const content = item.querySelector('.timeline-content');
        
        // Asignar un estado inicial para el contenido (opcionalmente)
        // content.style.display = 'block'; 

        // Escuchador de eventos para el header de cada sección
        if (header) {
            header.addEventListener('click', () => {
                // Alternar la visibilidad del contenido
                if (content.style.display === 'none' || content.style.display === '') {
                    content.style.display = 'block';
                    // Aquí se podría añadir rotación de flecha
                    // header.querySelector('.dropdown-arrow').style.transform = 'rotate(0deg)';
                } else {
                    content.style.display = 'none';
                    // header.querySelector('.dropdown-arrow').style.transform = 'rotate(180deg)';
                }

                // Opcional: Usar una clase CSS para manejar la transición/animación
                // content.classList.toggle('is-open'); 
            });

            // Añadir atributos ARIA para accesibilidad
            header.setAttribute('role', 'button');
            header.setAttribute('aria-expanded', 'true');
            header.setAttribute('tabindex', '0'); // Hacer focusable
            
            // Permitir toggle con la tecla Enter/Space
            header.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    header.click();
                    // Actualizar ARIA
                    const isExpanded = header.getAttribute('aria-expanded') === 'true';
                    header.setAttribute('aria-expanded', String(!isExpanded));
                }
            });
        }
    });

    // Añadir lógica para los botones flotantes (hover/active states ya en CSS)
    const floatButtons = document.querySelectorAll('.float-button');
    floatButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Eliminar 'active' de todos
            floatButtons.forEach(btn => btn.classList.remove('active'));
            // Añadir 'active' al presionado
            button.classList.add('active');
        });
    });
});