/**
 * main.js
 * Funcionalidad Vanilla JS para Interacciones y Accesibilidad
 *
 * NOTA: Este archivo se mantiene vacío según el requisito, ya que la funcionalidad
 * de los botones (autenticación) excede el alcance de la reproducción de la interfaz.
 * Los estados de hover/focus/active se manejan a través de CSS.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Ejemplo de cómo manejar una interacción simple con JavaScript
    /*
    const emailButton = document.querySelector('.maintech_login_button--email');

    if (emailButton) {
        emailButton.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Botón de Email presionado. Implementar lógica de redirección aquí.');
            // Aquí se podría añadir una clase 'is-active' para un feedback visual más complejo
        });
    }
    */

    // Asegurar la accesibilidad de los botones
    const authButtons = document.querySelectorAll('.maintech_login_auth-options button');
    authButtons.forEach(button => {
        // Asegura que los botones son navegables por teclado (ya lo son por defecto, pero es buena práctica)
        button.setAttribute('tabindex', '0');
    });
});