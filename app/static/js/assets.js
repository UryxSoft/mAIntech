// static/js/assets.js

class AssetManager {
    constructor(uiManager) {
        this.ui = uiManager;
        this.grid = null;
        this.filepond = null;
        this.currentAssetId = null; // Para saber si estamos creando o editando
        this.init();
    }

    init() {
        this.initGrid();
        this.initEventListeners();
        this.initFilePond();
        this.loadAssets();
    }

    // ... (initGrid, debounce, getCriticalityClass, etc. se mantienen igual)
    initGrid() {
        const Grid = tui.Grid;
        this.grid = new Grid({
            el: document.getElementById('asset-grid'),
            scrollX: false,
            scrollY: true,
            minBodyHeight: 400,
            rowHeaders: ['checkbox'],
            columns: [
                {
                    header: 'Código',
                    name: 'unique_code',
                    sortingType: 'asc',
                    sortable: true
                },
                {
                    header: 'Nombre del Activo',
                    name: 'name',
                    sortable: true,
                    resizable: true
                },
                {
                    header: 'Categoría',
                    name: 'category_name',
                    sortable: true
                },
                {
                    header: 'Ubicación',
                    name: 'location_name',
                    sortable: true
                },
                {
                    header: 'Criticidad',
                    name: 'criticality',
                    sortable: true,
                    formatter: ({ value }) => {
                        const classMap = {
                            low: 'badge-success',
                            medium: 'badge-warning',
                            high: 'badge-danger',
                            critical: 'badge-danger',
                        };
                        return `<span class="badge ${classMap[value] || 'badge-secondary'}">${value}</span>`;
                    }
                },
                {
                    header: 'Acciones',
                    name: 'actions',
                    width: 150,
                    renderer: {
                        type: this.renderActionsCell.bind(this)
                    }
                }
            ],
            bodyHeight: 'fitToParent',
            showDummyRows: true
        });

        this.grid.on('click', (ev) => {
            const action = ev.target.dataset.action;
            if (action) {
                const rowKey = ev.rowKey;
                const asset = this.grid.getRow(rowKey);
                this.handleAction(action, asset);
            }
        });
    }

    initEventListeners() {
        document.getElementById('btn-create-asset').addEventListener('click', () => this.openCreateForm());
        document.getElementById('btn-save-asset').addEventListener('click', () => this.saveAsset());

        document.getElementById('search-input').addEventListener('input', this.debounce((e) => this.loadAssets(), 300));
        document.getElementById('filter-category').addEventListener('change', () => this.loadAssets());
        document.getElementById('filter-location').addEventListener('change', () => this.loadAssets());
        document.getElementById('filter-criticality').addEventListener('change', () => this.loadAssets());
    }

    initFilePond() {
        FilePond.registerPlugin(FilePondPluginFileValidateType, FilePondPluginFileValidateSize);
        this.filepond = FilePond.create(document.querySelector('.filepond-input'), {
            allowMultiple: true,
            maxFileSize: '10MB',
            acceptedFileTypes: ['image/png', 'image/jpeg', 'application/pdf'],
            server: {
                // Aquí configurarías el endpoint de subida de archivos
                // url: `/api/assets/${this.currentAssetId}/documents`,
                process: (fieldName, file, metadata, load, error, progress, abort) => {
                    // Por ahora, simulamos la subida
                    console.log("Simulando subida de archivo:", file.name);
                    load(file.name); // Notifica a FilePond que la subida fue "exitosa"
                }
            }
        });
    }

    // ... (loadAssets, debounce, showSkeleton, renderActionsCell se mantienen igual)

    handleAction(action, asset) {
        this.currentAssetId = asset.id;
        switch (action) {
            case 'view':
                this.viewAsset(asset);
                break;
            case 'edit':
                this.openEditForm(asset);
                break;
            case 'move':
                this.openMoveModal(asset);
                break;
            case 'delete':
                this.confirmDelete(asset);
                break;
        }
    }

    openCreateForm() {
        this.currentAssetId = null;
        document.getElementById('asset-form').reset();
        document.getElementById('offcanvas-title').textContent = 'Crear Nuevo Activo';
        this.filepond.removeFiles();
        this.ui.openOffcanvas('asset-offcanvas');
    }

    async openEditForm(asset) {
        try {
            const response = await fetch(`/api/assets/${asset.id}`);
            if (!response.ok) throw new Error('Activo no encontrado');
            const assetData = await response.json();

            // Rellenar el formulario
            Object.keys(assetData).forEach(key => {
                const field = document.getElementById(key);
                if (field) {
                    field.value = assetData[key];
                }
            });

            document.getElementById('offcanvas-title').textContent = 'Editar Activo';
            this.filepond.removeFiles(); // Aquí cargarías los archivos existentes
            this.ui.openOffcanvas('asset-offcanvas');

        } catch (error) {
            this.ui.showToast(error.message, 'error');
        }
    }

    async saveAsset() {
        const form = document.getElementById('asset-form');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        const assetId = this.currentAssetId;

        const method = assetId ? 'PUT' : 'POST';
        const url = assetId ? `/api/assets/${assetId}` : '/api/assets/';

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al guardar');
            }

            this.ui.showToast(`Activo ${assetId ? 'actualizado' : 'creado'} con éxito.`);
            this.ui.closeOffcanvas('asset-offcanvas');
            this.loadAssets();

        } catch (error) {
            this.ui.showToast(error.message, 'error');
        }
    }

    confirmDelete(asset) {
        document.getElementById('delete-asset-name').textContent = asset.name;
        this.ui.openModal('delete-asset-modal');

        // Usamos .onclick para reemplazar cualquier listener anterior
        document.getElementById('btn-confirm-delete').onclick = async () => {
            try {
                const response = await fetch(`/api/assets/${asset.id}`, { method: 'DELETE' });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message);
                }
                this.ui.showToast('Activo eliminado con éxito.');
                this.ui.closeModal('delete-asset-modal');
                this.loadAssets();
            } catch (error) {
                this.ui.showToast(error.message, 'error');
            }
        };
    }

    viewAsset(asset) {
        // Llenar datos del modal de detalle
        document.getElementById('detail-asset-name').textContent = asset.name;
        // ... Llenar el resto de los campos

        // Generar QR
        const qrContainer = document.getElementById('qr-code-container');
        qrContainer.innerHTML = ''; // Limpiar QR anterior
        new QRCode(qrContainer, {
            text: `ASSET_ID:${asset.id}`,
            width: 128,
            height: 128
        });

        this.ui.openModal('view-qr-modal'); // Suponiendo que el detalle está en un modal
    }

}

// Entry point
document.addEventListener('DOMContentLoaded', () => {
    // Asumiendo que ui.js ya ha instanciado `ui` globalmente.
    const assetManager = new AssetManager(ui);
});
