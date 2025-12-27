/**
 * forms.js
 * Sistema de Formularios Inteligentes y Modal Redimensionable
 */

class AppForms {
    constructor() {
        this.init();
    }

    init() {
        this.initFormValidation();
        this.initAutoComplete();
        this.initTagInput();
        this.initPasswordStrength();
        this.initCharCounter();
        this.initFileInput();
        this.initRangeSlider();
        this.initResizableModal();
    }

    // ==========================================================================
    // FORM VALIDATION
    // ==========================================================================
    initFormValidation() {
        document.querySelectorAll('[data-validate]').forEach(form => {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                
                let isValid = true;
                const formGroups = form.querySelectorAll('.app-form-group');
                
                formGroups.forEach(group => {
                    const input = group.querySelector('.app-input, .app-select, .app-textarea');
                    if (input) {
                        const validation = this.validateField(input);
                        if (!validation.isValid) {
                            isValid = false;
                            this.showError(group, validation.message);
                        } else {
                            this.clearError(group);
                        }
                    }
                });
                
                if (isValid) {
                    console.log('Form is valid, submitting...');
                    // Aquí iría la lógica de envío
                    this.showSuccessMessage(form);
                }
            });
        });

        // Real-time validation
        document.querySelectorAll('[data-validate-realtime]').forEach(input => {
            input.addEventListener('blur', () => {
                const group = input.closest('.app-form-group');
                const validation = this.validateField(input);
                
                if (!validation.isValid) {
                    this.showError(group, validation.message);
                } else {
                    this.clearError(group);
                }
            });
        });
    }

    validateField(input) {
        const value = input.value.trim();
        const type = input.getAttribute('type');
        const required = input.hasAttribute('required');
        const minLength = input.getAttribute('minlength');
        const maxLength = input.getAttribute('maxlength');
        const pattern = input.getAttribute('pattern');

        // Required check
        if (required && !value) {
            return { isValid: false, message: 'Este campo es requerido' };
        }

        // Min length
        if (minLength && value.length < parseInt(minLength)) {
            return { isValid: false, message: `Mínimo ${minLength} caracteres` };
        }

        // Max length
        if (maxLength && value.length > parseInt(maxLength)) {
            return { isValid: false, message: `Máximo ${maxLength} caracteres` };
        }

        // Email validation
        if (type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                return { isValid: false, message: 'Email inválido' };
            }
        }

        // URL validation
        if (type === 'url' && value) {
            try {
                new URL(value);
            } catch {
                return { isValid: false, message: 'URL inválida' };
            }
        }

        // Number validation
        if (type === 'number' && value) {
            const min = input.getAttribute('min');
            const max = input.getAttribute('max');
            const numValue = parseFloat(value);
            
            if (min && numValue < parseFloat(min)) {
                return { isValid: false, message: `Valor mínimo: ${min}` };
            }
            if (max && numValue > parseFloat(max)) {
                return { isValid: false, message: `Valor máximo: ${max}` };
            }
        }

        // Pattern validation
        if (pattern && value) {
            const regex = new RegExp(pattern);
            if (!regex.test(value)) {
                return { isValid: false, message: 'Formato inválido' };
            }
        }

        return { isValid: true, message: '' };
    }

    showError(group, message) {
        group.classList.add('app-form-group--error');
        
        let errorEl = group.querySelector('.app-form-error');
        if (!errorEl) {
            errorEl = document.createElement('span');
            errorEl.className = 'app-form-error';
            group.appendChild(errorEl);
        }
        errorEl.textContent = message;
    }

    clearError(group) {
        group.classList.remove('app-form-group--error');
        const errorEl = group.querySelector('.app-form-error');
        if (errorEl) {
            errorEl.remove();
        }
    }

    showSuccessMessage(form) {
        const existingMsg = form.querySelector('.app-form-success-message');
        if (existingMsg) existingMsg.remove();

        const successMsg = document.createElement('div');
        successMsg.className = 'app-alert app-alert--success app-form-success-message';
        successMsg.style.marginTop = '16px';
        successMsg.innerHTML = `
            <svg class="app-alert__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <div class="app-alert__content">
                <div class="app-alert__title">¡Formulario enviado con éxito!</div>
            </div>
        `;
        
        form.appendChild(successMsg);
        
        setTimeout(() => successMsg.remove(), 5000);
    }

    // ==========================================================================
    // AUTO-COMPLETE
    // ==========================================================================
    initAutoComplete() {
        document.querySelectorAll('[data-autocomplete]').forEach(input => {
            const dataSource = JSON.parse(input.getAttribute('data-autocomplete') || '[]');
            
            const wrapper = document.createElement('div');
            wrapper.className = 'app-autocomplete';
            input.parentNode.insertBefore(wrapper, input);
            wrapper.appendChild(input);
            
            const suggestions = document.createElement('div');
            suggestions.className = 'app-autocomplete__suggestions';
            wrapper.appendChild(suggestions);
            
            let currentFocus = -1;
            
            input.addEventListener('input', () => {
                const value = input.value.toLowerCase();
                suggestions.innerHTML = '';
                currentFocus = -1;
                
                if (!value) {
                    suggestions.classList.remove('app-autocomplete__suggestions--show');
                    return;
                }
                
                const matches = dataSource.filter(item => 
                    item.toLowerCase().includes(value)
                );
                
                if (matches.length === 0) {
                    suggestions.classList.remove('app-autocomplete__suggestions--show');
                    return;
                }
                
                matches.forEach((match, index) => {
                    const item = document.createElement('div');
                    item.className = 'app-autocomplete__item';
                    item.textContent = match;
                    item.addEventListener('click', () => {
                        input.value = match;
                        suggestions.classList.remove('app-autocomplete__suggestions--show');
                    });
                    suggestions.appendChild(item);
                });
                
                suggestions.classList.add('app-autocomplete__suggestions--show');
            });
            
            input.addEventListener('keydown', (e) => {
                const items = suggestions.querySelectorAll('.app-autocomplete__item');
                
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    currentFocus++;
                    if (currentFocus >= items.length) currentFocus = 0;
                    setActive(items, currentFocus);
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    currentFocus--;
                    if (currentFocus < 0) currentFocus = items.length - 1;
                    setActive(items, currentFocus);
                } else if (e.key === 'Enter') {
                    e.preventDefault();
                    if (currentFocus > -1 && items[currentFocus]) {
                        items[currentFocus].click();
                    }
                }
            });
            
            function setActive(items, index) {
                items.forEach(item => item.classList.remove('app-autocomplete__item--active'));
                if (items[index]) {
                    items[index].classList.add('app-autocomplete__item--active');
                }
            }
            
            document.addEventListener('click', (e) => {
                if (!wrapper.contains(e.target)) {
                    suggestions.classList.remove('app-autocomplete__suggestions--show');
                }
            });
        });
    }

    // ==========================================================================
    // TAG INPUT
    // ==========================================================================
    initTagInput() {
        document.querySelectorAll('[data-tag-input]').forEach(container => {
            const tags = [];
            const input = container.querySelector('.app-tag-input__field');
            
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    const value = input.value.trim();
                    
                    if (value && !tags.includes(value)) {
                        tags.push(value);
                        addTag(value);
                        input.value = '';
                    }
                } else if (e.key === 'Backspace' && !input.value && tags.length > 0) {
                    removeTag(tags.length - 1);
                }
            });
            
            function addTag(value) {
                const tag = document.createElement('span');
                tag.className = 'app-tag';
                tag.innerHTML = `
                    ${value}
                    <span class="app-tag__remove">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </span>
                `;
                
                tag.querySelector('.app-tag__remove').addEventListener('click', () => {
                    const index = tags.indexOf(value);
                    removeTag(index);
                });
                
                container.insertBefore(tag, input);
            }
            
            function removeTag(index) {
                const value = tags[index];
                tags.splice(index, 1);
                
                const tagElements = container.querySelectorAll('.app-tag');
                tagElements.forEach(el => {
                    if (el.textContent.trim().startsWith(value)) {
                        el.remove();
                    }
                });
            }
        });
    }

    // ==========================================================================
    // PASSWORD STRENGTH
    // ==========================================================================
    initPasswordStrength() {
        document.querySelectorAll('[data-password-strength]').forEach(input => {
            const container = input.closest('.app-form-group');
            
            const strengthMeter = document.createElement('div');
            strengthMeter.className = 'app-password-strength';
            strengthMeter.innerHTML = `
                <div class="app-password-strength__bar">
                    <div class="app-password-strength__fill"></div>
                </div>
                <div class="app-password-strength__text"></div>
            `;
            
            container.appendChild(strengthMeter);
            
            const fill = strengthMeter.querySelector('.app-password-strength__fill');
            const text = strengthMeter.querySelector('.app-password-strength__text');
            
            input.addEventListener('input', () => {
                const password = input.value;
                const strength = calculatePasswordStrength(password);
                
                fill.className = 'app-password-strength__fill';
                
                if (strength.score === 0) {
                    text.textContent = '';
                } else if (strength.score < 3) {
                    fill.classList.add('app-password-strength__fill--weak');
                    text.textContent = 'Contraseña débil';
                } else if (strength.score < 4) {
                    fill.classList.add('app-password-strength__fill--medium');
                    text.textContent = 'Contraseña media';
                } else {
                    fill.classList.add('app-password-strength__fill--strong');
                    text.textContent = 'Contraseña fuerte';
                }
            });
            
            function calculatePasswordStrength(password) {
                let score = 0;
                
                if (password.length >= 8) score++;
                if (password.length >= 12) score++;
                if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
                if (/\d/.test(password)) score++;
                if (/[^a-zA-Z\d]/.test(password)) score++;
                
                return { score };
            }
        });
    }

    // ==========================================================================
    // CHARACTER COUNTER
    // ==========================================================================
    initCharCounter() {
        document.querySelectorAll('[data-char-counter]').forEach(input => {
            const maxLength = parseInt(input.getAttribute('maxlength') || input.getAttribute('data-char-counter'));
            
            const counter = document.createElement('div');
            counter.className = 'app-char-counter';
            
            const container = input.closest('.app-form-group');
            container.appendChild(counter);
            
            const updateCounter = () => {
                const current = input.value.length;
                counter.textContent = `${current} / ${maxLength}`;
                
                if (current >= maxLength) {
                    counter.classList.add('app-char-counter--limit');
                } else {
                    counter.classList.remove('app-char-counter--limit');
                }
            };
            
            input.addEventListener('input', updateCounter);
            updateCounter();
        });
    }

    // ==========================================================================
    // FILE INPUT
    // ==========================================================================
    initFileInput() {
        document.querySelectorAll('.app-file-input').forEach(input => {
            const label = input.nextElementSibling;
            const container = input.closest('.app-form-group');
            
            input.addEventListener('change', () => {
                const files = Array.from(input.files);
                
                let preview = container.querySelector('.app-file-preview');
                if (!preview) {
                    preview = document.createElement('div');
                    preview.className = 'app-file-preview';
                    container.appendChild(preview);
                }
                
                if (files.length === 0) {
                    preview.textContent = 'No hay archivos seleccionados';
                } else if (files.length === 1) {
                    preview.textContent = `Archivo: ${files[0].name} (${formatFileSize(files[0].size)})`;
                } else {
                    preview.textContent = `${files.length} archivos seleccionados`;
                }
            });
            
            function formatFileSize(bytes) {
                if (bytes === 0) return '0 Bytes';
                const k = 1024;
                const sizes = ['Bytes', 'KB', 'MB', 'GB'];
                const i = Math.floor(Math.log(bytes) / Math.log(k));
                return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
            }
        });
    }

    // ==========================================================================
    // RANGE SLIDER
    // ==========================================================================
    initRangeSlider() {
        document.querySelectorAll('[data-range-value]').forEach(range => {
            const container = range.closest('.app-form-group');
            
            let valueDisplay = container.querySelector('.app-range-value');
            if (!valueDisplay) {
                valueDisplay = document.createElement('div');
                valueDisplay.className = 'app-range-value';
                range.parentNode.insertBefore(valueDisplay, range.nextSibling);
            }
            
            const updateValue = () => {
                valueDisplay.textContent = range.value;
            };
            
            range.addEventListener('input', updateValue);
            updateValue();
        });
    }

    // ==========================================================================
    // MODAL REDIMENSIONABLE
    // ==========================================================================
    initResizableModal() {
        document.querySelectorAll('.app-modal__dialog--resizable').forEach(dialog => {
            const modal = dialog.closest('.app-modal');
            
            // Agregar handle de redimensionamiento
            if (!dialog.querySelector('.app-modal__resize-handle')) {
                const resizeHandle = document.createElement('div');
                resizeHandle.className = 'app-modal__resize-handle';
                dialog.appendChild(resizeHandle);
                
                // Agregar controles de tamaño
                const sizeControls = document.createElement('div');
                sizeControls.className = 'app-modal__size-controls';
                sizeControls.innerHTML = `
                    <button class="app-modal__size-btn" data-size="small" title="Pequeño">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="6" y="6" width="12" height="12" rx="2"></rect>
                        </svg>
                    </button>
                    <button class="app-modal__size-btn" data-size="medium" title="Mediano">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="4" y="4" width="16" height="16" rx="2"></rect>
                        </svg>
                    </button>
                    <button class="app-modal__size-btn" data-size="large" title="Grande">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="2" y="2" width="20" height="20" rx="2"></rect>
                        </svg>
                    </button>
                    <button class="app-modal__size-btn" data-size="fullscreen" title="Pantalla completa">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
                        </svg>
                    </button>
                `;
                dialog.appendChild(sizeControls);
                
                // Event listeners para botones de tamaño
                sizeControls.querySelectorAll('.app-modal__size-btn').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const size = btn.getAttribute('data-size');
                        this.setModalSize(dialog, size);
                    });
                });
                
                // Funcionalidad de resize con handle
                let isResizing = false;
                let startX, startY, startWidth, startHeight;
                
                resizeHandle.addEventListener('mousedown', (e) => {
                    isResizing = true;
                    startX = e.clientX;
                    startY = e.clientY;
                    startWidth = parseInt(getComputedStyle(dialog).width, 10);
                    startHeight = parseInt(getComputedStyle(dialog).height, 10);
                    
                    e.preventDefault();
                });
                
                document.addEventListener('mousemove', (e) => {
                    if (!isResizing) return;
                    
                    const width = startWidth + (startX - e.clientX);
                    const height = startHeight + (startY - e.clientY);
                    
                    if (width >= 400) {
                        dialog.style.width = width + 'px';
                    }
                    if (height >= 300) {
                        dialog.style.height = height + 'px';
                    }
                });
                
                document.addEventListener('mouseup', () => {
                    isResizing = false;
                });
            }
        });
    }

    setModalSize(dialog, size) {
        dialog.classList.remove('app-modal__dialog--sm', 'app-modal__dialog--lg', 'app-modal__dialog--fullscreen');
        dialog.style.width = '';
        dialog.style.height = '';
        
        switch(size) {
            case 'small':
                dialog.style.width = '400px';
                dialog.style.height = '300px';
                break;
            case 'medium':
                dialog.style.width = '600px';
                dialog.style.height = '400px';
                break;
            case 'large':
                dialog.style.width = '900px';
                dialog.style.height = '600px';
                break;
            case 'fullscreen':
                dialog.classList.add('app-modal__dialog--fullscreen');
                break;
        }
    }
}

// Initialize forms when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.appForms = new AppForms();
});

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AppForms;
}
