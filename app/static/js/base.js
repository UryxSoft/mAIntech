/**
 * main.js
 * Funcionalidad Vanilla JS para la Sidebar, el Submenú y el Switch de Tema.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Selectores clave
    const body = document.body;
    const appContainer = document.querySelector('.app-container');
    const menuItems = document.querySelectorAll('.app-sidebar__list-item button[data-panel-target]');
    const closeButtons = document.querySelectorAll('[data-toggle-close]');
    const themeToggle = document.getElementById('theme-toggle');
    
    const reportsToggle = document.getElementById('reports-toggle');
    const reportsPanel = document.getElementById('reports-panel');


    // --- 1. Función para alternar la visibilidad de cualquier panel (GRID/ANIMACIÓN) ---
    function togglePanel(button, panelId) {
        const targetPanel = document.getElementById(panelId);
        
        // 1. Cierra todos los paneles y resetea el estado activo de los botones
        const isCurrentlyExpanded = targetPanel.classList.contains('app-submenu-panel--expanded');

        document.querySelectorAll('.app-submenu-panel').forEach(panel => {
            panel.classList.remove('app-submenu-panel--expanded');
            panel.setAttribute('aria-hidden', 'true');
        });
        document.querySelectorAll('.app-sidebar__item').forEach(item => {
            item.classList.remove('app-sidebar__item--active');
            item.setAttribute('aria-expanded', 'false');
        });
        
        // Cierra el contenedor Grid si se estaba mostrando un panel
        appContainer.classList.remove('panel-expanded');

        // 2. Si el panel no estaba expandido, ábrelo
        if (!isCurrentlyExpanded) {
            targetPanel.classList.add('app-submenu-panel--expanded');
            targetPanel.setAttribute('aria-hidden', 'false');
            
            // Activar el botón correspondiente
            button.classList.add('app-sidebar__item--active');
            button.setAttribute('aria-expanded', 'true');
            
            // Abrir el contenedor Grid para animar la columna y ajustar el main
            appContainer.classList.add('panel-expanded');
        }
    }

    // --- 2. Event Listeners para Ítems de la Sidebar ---
    menuItems.forEach(button => {
        button.addEventListener('click', () => {
            const panelId = button.getAttribute('data-panel-target');
            // Ignorar elementos sin panel asociado (como el Dashboard con href="#")
            if (panelId) { 
                togglePanel(button, panelId);
            } else {
                 // Si no tiene panel, simplemente cierra todos los paneles si alguno está abierto
                 document.querySelectorAll('.app-submenu-panel').forEach(panel => {
                    panel.classList.remove('app-submenu-panel--expanded');
                    panel.setAttribute('aria-hidden', 'true');
                });
                document.querySelectorAll('.app-sidebar__item').forEach(item => {
                    item.classList.remove('app-sidebar__item--active');
                    item.setAttribute('aria-expanded', 'false');
                });
                appContainer.classList.remove('panel-expanded');
                
                // Activa el botón de Dashboard si es el que se pulsó
                button.classList.add('app-sidebar__item--active'); 
            }
        });
    });
    
    // --- 3. Event Listeners para Botones de Cerrar (Submenús) ---
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const panelId = button.getAttribute('data-toggle-close');
            const targetPanel = document.getElementById(panelId);
            const associatedButton = document.querySelector(`[data-panel-target="${panelId}"]`);
            
            if (targetPanel) {
                 targetPanel.classList.remove('app-submenu-panel--expanded');
                 targetPanel.setAttribute('aria-hidden', 'true');
            }
            if (associatedButton) {
                 associatedButton.classList.remove('app-sidebar__item--active');
                 associatedButton.setAttribute('aria-expanded', 'false');
            }
            
            // Cerrar el contenedor Grid para animar la columna y ajustar el main
            appContainer.classList.remove('panel-expanded');
        });
    });


    // --- 4. Lógica del Switch de Tema (Modo Oscuro) ---
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = body.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            body.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
        
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            body.setAttribute('data-theme', savedTheme);
        }
    }


    // --- 5. Toggle de la Sub-sección (Conversation topics) ---
    const sectionToggle = document.querySelector('.app-submenu-panel__section-toggle');
    const sectionContent = document.getElementById('conversation-topics-content');

    if (sectionToggle && sectionContent) {
        function toggleSection() {
            const isExpanded = sectionToggle.getAttribute('aria-expanded') === 'true';
            sectionToggle.setAttribute('aria-expanded', String(!isExpanded));
            
            if (isExpanded) {
                // Colapsar
                sectionContent.style.maxHeight = sectionContent.scrollHeight + 'px'; // Necesario para el colapso fluido
                setTimeout(() => {
                    sectionContent.style.maxHeight = '0';
                    sectionContent.style.opacity = '0';
                    sectionContent.style.paddingTop = '0';
                    sectionContent.style.paddingBottom = '0';
                }, 10);
            } else {
                // Expandir
                sectionContent.style.opacity = '1';
                sectionContent.style.paddingTop = '8px';
                sectionContent.style.paddingBottom = '8px';
                sectionContent.style.maxHeight = sectionContent.scrollHeight + 'px'; 
            }
        }
        
        sectionToggle.addEventListener('click', toggleSection);
        
        // Inicializar la sección de Topics como expandida
        sectionToggle.setAttribute('aria-expanded', 'true');
        sectionContent.style.maxHeight = sectionContent.scrollHeight + 'px';
        sectionContent.style.opacity = '1';
        sectionContent.style.paddingTop = '8px';
        sectionContent.style.paddingBottom = '8px';
        sectionContent.style.transition = 'max-height 0.3s ease-in-out, opacity 0.3s, padding 0.3s';
    }
    
    // --- 6. Inicializar Estado Activo (Reports por defecto) ---
    if (reportsToggle && reportsPanel) {
         // Activamos Reports por defecto
         reportsToggle.classList.add('app-sidebar__item--active');
         reportsToggle.setAttribute('aria-expanded', 'true');
         reportsPanel.classList.add('app-submenu-panel--expanded');
         reportsPanel.setAttribute('aria-hidden', 'false');
         
         // Inicializar el Grid como expandido para el panel por defecto
         appContainer.classList.add('panel-expanded');
    }
});
