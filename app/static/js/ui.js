// static/js/ui.js

class UIManager {
    constructor() {
        this.initEventListeners();
    }

    // --- Offcanvas Management ---
    openOffcanvas(id) {
        const offcanvas = document.getElementById(id);
        const backdrop = document.getElementById('offcanvas-backdrop');
        if (offcanvas && backdrop) {
            offcanvas.classList.add('is-open');
            backdrop.classList.add('is-visible');
        }
    }

    closeOffcanvas(id) {
        const offcanvas = document.getElementById(id);
        const backdrop = document.getElementById('offcanvas-backdrop');
        if (offcanvas && backdrop) {
            offcanvas.classList.remove('is-open');
            backdrop.classList.remove('is-visible');
        }
    }

    // --- Modal Management ---
    openModal(id) {
        const modal = document.getElementById(id);
        const backdrop = document.querySelector('.modal-backdrop');
        if (modal && backdrop) {
            modal.style.display = 'flex';
            backdrop.style.display = 'block';
        }
    }

    closeModal(id) {
        const modal = document.getElementById(id);
        const backdrop = document.querySelector('.modal-backdrop');
        if (modal && backdrop) {
            modal.style.display = 'none';
            backdrop.style.display = 'none';
        }
    }

    // --- Toast Notifications ---
    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('show');
        }, 100);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 500);
        }, 3000);
    }

    // --- Generic Event Listeners ---
    initEventListeners() {
        document.body.addEventListener('click', (event) => {
            // Close modals or offcanvas when clicking on close buttons or backdrops
            if (event.target.matches('[data-dismiss="modal"]')) {
                const modal = event.target.closest('.modal');
                if (modal) this.closeModal(modal.id);
            }
            if (event.target.matches('.modal-backdrop')) {
                document.querySelectorAll('.modal').forEach(m => this.closeModal(m.id));
            }
            if (event.target.matches('#btn-close-offcanvas') || event.target.matches('#btn-cancel-offcanvas')) {
                const offcanvas = event.target.closest('.offcanvas');
                if(offcanvas) this.closeOffcanvas(offcanvas.id);
            }
            if (event.target.matches('#offcanvas-backdrop')) {
                 document.querySelectorAll('.offcanvas').forEach(o => this.closeOffcanvas(o.id));
            }
        });
    }
}

// Instantiate the manager
const ui = new UIManager();
