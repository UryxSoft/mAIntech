// app/static/js/preventive.js

class PreventiveWizard {
    constructor(uiManager) {
        this.ui = uiManager;
        this.currentStep = 1;
        this.totalSteps = 5;
        this.wizardData = {};

        this.prevButton = document.getElementById('wizard-btn-prev');
        this.nextButton = document.getElementById('wizard-btn-next');
        this.finishButton = document.getElementById('wizard-btn-finish');

        this.initEventListeners();
        this.updateView();
    }

    initEventListeners() {
        this.nextButton.addEventListener('click', () => this.nextStep());
        this.prevButton.addEventListener('click', () => this.prevStep());
        this.finishButton.addEventListener('click', () => this.finishWizard());

        // --- Listeners específicos de los pasos ---
        // Paso 1: Búsqueda de activos
        const assetSearch = document.getElementById('asset-search');
        assetSearch.addEventListener('input', this.debounce(e => this.searchAssets(e.target.value), 300));

        // Paso 2: Cambio de tipo de programación
        document.querySelectorAll('input[name="schedule_type"]').forEach(radio => {
            radio.addEventListener('change', e => this.toggleSchedulePanels(e.target.value));
        });

        // Paso 3: Añadir/Eliminar Tareas
        document.getElementById('btn-add-task').addEventListener('click', () => this.addTask());
        document.getElementById('task-list-container').addEventListener('click', e => {
            if (e.target.classList.contains('btn-remove-task')) {
                this.removeTask(e.target.parentElement);
            }
        });
    }

    // --- Navegación y Vistas ---
    nextStep() { /* ... (sin cambios) ... */ }
    prevStep() { /* ... (sin cambios) ... */ }
    updateView() { /* ... (sin cambios) ... */ }
    updateButtons() { /* ... (sin cambios) ... */ }

    // --- Lógica de Pasos ---
    validateStep(step) {
        if (step === 1) {
            if (!this.wizardData.asset_id) {
                this.ui.showToast('Debes seleccionar un activo.', 'error');
                return false;
            }
        }
        if (step === 3) {
            const tasks = document.querySelectorAll('input[name="tasks[]"]');
            if ([...tasks].some(input => !input.value.trim())) {
                this.ui.showToast('No puede haber tareas vacías.', 'error');
                return false;
            }
        }
        return true;
    }

    collectStepData(step) {
        if (step === 1) {
            this.wizardData.asset_id = document.getElementById('selected-asset-id').value;
            this.wizardData.asset_name = document.getElementById('selected-asset-info').textContent;
        } else if (step === 2) {
            this.wizardData.schedule_type = document.querySelector('input[name="schedule_type"]:checked').value;
            if (this.wizardData.schedule_type === 'time') {
                this.wizardData.interval_time = document.getElementById('interval_time').value;
            } else {
                this.wizardData.interval_usage = document.getElementById('interval_usage').value;
                this.wizardData.usage_unit = document.getElementById('usage_unit').value;
            }
        } else if (step === 3) {
            const taskInputs = document.querySelectorAll('input[name="tasks[]"]');
            this.wizardData.tasks = [...taskInputs].map(input => ({ description: input.value }));
        } else if (step === 4) {
            this.wizardData.resources = {
                technicians: document.getElementById('technicians_required').value,
                time: document.getElementById('estimated_time').value,
                skills: document.getElementById('required_skills').value
            };
        }
    }

    populateSummary() {
        document.getElementById('summary-asset').textContent = this.wizardData.asset_name;
        // ... (poblar el resto del resumen)
        const taskList = document.getElementById('summary-tasks');
        taskList.innerHTML = '';
        this.wizardData.tasks.forEach(task => {
            const li = document.createElement('li');
            li.textContent = task.description;
            taskList.appendChild(li);
        });
    }

    async finishWizard() {
        try {
            const response = await fetch('/maintenance/api/preventive', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(this.wizardData)
            });
            if (!response.ok) throw new Error('Error al crear el plan.');

            this.ui.showToast('Plan de mantenimiento creado con éxito.');
            // Redirigir o cerrar el wizard
            window.location.href = '/maintenance';

        } catch (error) {
            this.ui.showToast(error.message, 'error');
        }
    }

    // --- Funciones de Ayuda ---
    async searchAssets(query) { /* ... (implementación de búsqueda con fetch) ... */ }
    toggleSchedulePanels(type) { /* ... (lógica para mostrar/ocultar paneles) ... */ }
    addTask() { /* ... (lógica para añadir un nuevo input de tarea) ... */ }
    removeTask(taskElement) { /* ... (lógica para eliminar un input de tarea) ... */ }
    debounce(func, delay) { /* ... (sin cambios) ... */ }
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('preventive-wizard')) {
        new PreventiveWizard(ui); // Pasar la instancia de UIManager
    }
});
