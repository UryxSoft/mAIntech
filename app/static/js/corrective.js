// app/static/js/corrective.js

class CorrectiveMaintenance {
    constructor(uiManager) {
        this.ui = uiManager;
        this.form = document.getElementById('fault-report-form');
        this.modalId = 'report-fault-modal';
        this.filepond = null;

        this.init();
    }

    init() {
        document.getElementById('btn-report-fault').addEventListener('click', () => this.openModal());
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitReport();
        });
        this.initFilePond();
    }

    openModal() {
        this.form.reset();
        this.filepond.removeFiles();
        this.ui.openModal(this.modalId);
    }

    initFilePond() {
        this.filepond = FilePond.create(document.getElementById('fault-attachments'), {
            allowMultiple: true,
            maxFiles: 5,
            // Aquí se configuraría el endpoint de subida real
        });
    }

    async submitReport() {
        const formData = new FormData(this.form);
        const data = Object.fromEntries(formData.entries());

        data.user_id = document.querySelector('meta[name="user-id"]').content;

        if (!data.asset_id || !data.description) {
            this.ui.showToast('El activo y la descripción son obligatorios.', 'error');
            return;
        }

        try {
            const response = await fetch('/maintenance/api/fault', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al reportar la falla.');
            }

            this.ui.showToast('Falla reportada con éxito. Se ha creado una Orden de Trabajo.');
            this.ui.closeModal(this.modalId);

        } catch (error) {
            this.ui.showToast(error.message, 'error');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('report-fault-modal')) {
        new CorrectiveMaintenance(ui);
    }
});
