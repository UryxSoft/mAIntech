// app/static/js/autonomous.js

class AutonomousChecklist {
    constructor(uiManager) {
        this.ui = uiManager;
        this.container = document.getElementById('checklist-container');
        this.submitButton = document.getElementById('btn-submit-checklist');
        this.tasks = new Map(); // Para guardar el estado de cada tarea

        this.init();
    }

    init() {
        this.container.addEventListener('click', e => {
            if (e.target.matches('.btn-check')) {
                const taskItem = e.target.closest('.checklist-item');
                const taskId = taskItem.dataset.taskId;
                const status = e.target.dataset.status;
                this.setTaskStatus(taskItem, taskId, status);
            }
        });

        this.submitButton.addEventListener('click', () => this.submitChecklist());
    }

    setTaskStatus(taskItem, taskId, status) {
        this.tasks.set(taskId, {
            id: taskId,
            description: taskItem.querySelector('.task-description').textContent,
            status: status
        });

        // Feedback visual
        taskItem.classList.remove('status-ok', 'status-nok');
        taskItem.classList.add(status === 'ok' ? 'status-ok' : 'status-nok');
    }

    async submitChecklist() {
        const data = {
            asset_id: 1, // Placeholder, debería obtenerse de la URL o de un input
            user_id: document.querySelector('meta[name="user-id"]').content,
            tasks: Array.from(this.tasks.values()),
            notes: document.getElementById('checklist-notes').value
        };

        if (this.tasks.size !== document.querySelectorAll('.checklist-item').length) {
            this.ui.showToast('Debes completar todas las tareas del checklist.', 'error');
            return;
        }

        try {
            const response = await fetch('/maintenance/api/autonomous/checklist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!response.ok) throw new Error('Error al guardar el checklist.');

            const result = await response.json();
            if (result.anomalies_found > 0) {
                this.ui.showToast('Checklist finalizado. Se han reportado anomalías y se ha creado una OT.');
            } else {
                this.ui.showToast('Checklist finalizado sin novedades.');
            }
            // Redirigir a la página principal de mantenimiento
            window.location.href = '/maintenance';

        } catch (error) {
            this.ui.showToast(error.message, 'error');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('checklist-container')) {
        new AutonomousChecklist(ui);
    }
});
