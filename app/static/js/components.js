/**
 * components.js
 * Sistema de Componentes Profesionales - Funcionalidad
 */

class AppComponents {
    constructor() {
        this.init();
    }

    init() {
        this.initAccordion();
        this.initAlerts();
        this.initCarousel();
        this.initCollapse();
        this.initDropdown();
        this.initModal();
        this.initOffcanvas();
        this.initTabs();
        this.initTooltips();
        this.initToasts();
        this.initPopovers();
    }

    // ==========================================================================
    // ACCORDION
    // ==========================================================================
    initAccordion() {
        document.querySelectorAll('.app-accordion__header').forEach(header => {
            header.addEventListener('click', () => {
                const item = header.closest('.app-accordion__item');
                const content = item.querySelector('.app-accordion__content');
                const isActive = item.classList.contains('app-accordion__item--active');

                // Close all items in this accordion
                const accordion = item.closest('.app-accordion');
                accordion.querySelectorAll('.app-accordion__item').forEach(i => {
                    if (i !== item) {
                        i.classList.remove('app-accordion__item--active');
                        const c = i.querySelector('.app-accordion__content');
                        c.style.maxHeight = '0';
                    }
                });

                // Toggle current item
                if (isActive) {
                    item.classList.remove('app-accordion__item--active');
                    content.style.maxHeight = '0';
                } else {
                    item.classList.add('app-accordion__item--active');
                    content.style.maxHeight = content.scrollHeight + 'px';
                }
            });
        });
    }

    // ==========================================================================
    // ALERTS
    // ==========================================================================
    initAlerts() {
        document.querySelectorAll('.app-alert__close').forEach(btn => {
            btn.addEventListener('click', () => {
                const alert = btn.closest('.app-alert');
                alert.style.opacity = '0';
                alert.style.transform = 'translateY(-10px)';
                setTimeout(() => alert.remove(), 300);
            });
        });
    }

    // ==========================================================================
    // CAROUSEL
    // ==========================================================================
    initCarousel() {
        document.querySelectorAll('.app-carousel').forEach(carousel => {
            const inner = carousel.querySelector('.app-carousel__inner');
            const items = carousel.querySelectorAll('.app-carousel__item');
            const indicators = carousel.querySelectorAll('.app-carousel__indicator');
            const prevBtn = carousel.querySelector('.app-carousel__btn--prev');
            const nextBtn = carousel.querySelector('.app-carousel__btn--next');
            
            let currentIndex = 0;
            const totalItems = items.length;

            const updateCarousel = (index) => {
                currentIndex = index;
                inner.style.transform = `translateX(-${currentIndex * 100}%)`;
                
                indicators.forEach((ind, i) => {
                    ind.classList.toggle('app-carousel__indicator--active', i === currentIndex);
                });
            };

            // Indicators
            indicators.forEach((indicator, index) => {
                indicator.addEventListener('click', () => updateCarousel(index));
            });

            // Navigation buttons
            if (prevBtn) {
                prevBtn.addEventListener('click', () => {
                    const newIndex = currentIndex === 0 ? totalItems - 1 : currentIndex - 1;
                    updateCarousel(newIndex);
                });
            }

            if (nextBtn) {
                nextBtn.addEventListener('click', () => {
                    const newIndex = currentIndex === totalItems - 1 ? 0 : currentIndex + 1;
                    updateCarousel(newIndex);
                });
            }

            // Auto-play (optional)
            setInterval(() => {
                const newIndex = currentIndex === totalItems - 1 ? 0 : currentIndex + 1;
                updateCarousel(newIndex);
            }, 5000);
        });
    }

    // ==========================================================================
    // COLLAPSE
    // ==========================================================================
    initCollapse() {
        document.querySelectorAll('[data-collapse-toggle]').forEach(btn => {
            btn.addEventListener('click', () => {
                const targetId = btn.getAttribute('data-collapse-toggle');
                const target = document.getElementById(targetId);
                
                if (target) {
                    target.classList.toggle('app-collapse--show');
                }
            });
        });
    }

    // ==========================================================================
    // DROPDOWN
    // ==========================================================================
    initDropdown() {
        document.querySelectorAll('.app-dropdown').forEach(dropdown => {
            const toggle = dropdown.querySelector('.app-dropdown__toggle');
            
            toggle.addEventListener('click', (e) => {
                e.stopPropagation();
                
                // Close other dropdowns
                document.querySelectorAll('.app-dropdown').forEach(d => {
                    if (d !== dropdown) {
                        d.classList.remove('app-dropdown--show');
                    }
                });
                
                dropdown.classList.toggle('app-dropdown--show');
            });
        });

        // Close dropdowns when clicking outside
        document.addEventListener('click', () => {
            document.querySelectorAll('.app-dropdown').forEach(d => {
                d.classList.remove('app-dropdown--show');
            });
        });
    }

    // ==========================================================================
    // MODAL
    // ==========================================================================
    initModal() {
        // Open modal
        document.querySelectorAll('[data-modal-open]').forEach(btn => {
            btn.addEventListener('click', () => {
                const targetId = btn.getAttribute('data-modal-open');
                const modal = document.getElementById(targetId);
                if (modal) {
                    modal.classList.add('app-modal--show');
                    document.body.style.overflow = 'hidden';
                }
            });
        });

        // Close modal
        document.querySelectorAll('[data-modal-close]').forEach(btn => {
            btn.addEventListener('click', () => {
                const modal = btn.closest('.app-modal');
                if (modal) {
                    modal.classList.remove('app-modal--show');
                    document.body.style.overflow = '';
                }
            });
        });

        // Close on backdrop click
        document.querySelectorAll('.app-modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('app-modal--show');
                    document.body.style.overflow = '';
                }
            });
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.querySelectorAll('.app-modal--show').forEach(modal => {
                    modal.classList.remove('app-modal--show');
                    document.body.style.overflow = '';
                });
            }
        });
    }

    // ==========================================================================
    // OFFCANVAS
    // ==========================================================================
    initOffcanvas() {
        // Open offcanvas
        document.querySelectorAll('[data-offcanvas-open]').forEach(btn => {
            btn.addEventListener('click', () => {
                const targetId = btn.getAttribute('data-offcanvas-open');
                const offcanvas = document.getElementById(targetId);
                const backdrop = document.getElementById(targetId + '-backdrop');
                
                if (offcanvas) {
                    offcanvas.classList.add('app-offcanvas--show');
                    if (backdrop) {
                        backdrop.classList.add('app-offcanvas-backdrop--show');
                    }
                    document.body.style.overflow = 'hidden';
                }
            });
        });

        // Close offcanvas
        document.querySelectorAll('[data-offcanvas-close]').forEach(btn => {
            btn.addEventListener('click', () => {
                const offcanvas = btn.closest('.app-offcanvas');
                const offcanvasId = offcanvas.id;
                const backdrop = document.getElementById(offcanvasId + '-backdrop');
                
                if (offcanvas) {
                    offcanvas.classList.remove('app-offcanvas--show');
                    if (backdrop) {
                        backdrop.classList.remove('app-offcanvas-backdrop--show');
                    }
                    document.body.style.overflow = '';
                }
            });
        });

        // Close on backdrop click
        document.querySelectorAll('.app-offcanvas-backdrop').forEach(backdrop => {
            backdrop.addEventListener('click', () => {
                const offcanvasId = backdrop.id.replace('-backdrop', '');
                const offcanvas = document.getElementById(offcanvasId);
                
                if (offcanvas) {
                    offcanvas.classList.remove('app-offcanvas--show');
                    backdrop.classList.remove('app-offcanvas-backdrop--show');
                    document.body.style.overflow = '';
                }
            });
        });
    }

    // ==========================================================================
    // TABS
    // ==========================================================================
    initTabs() {
        document.querySelectorAll('[data-tab-target]').forEach(tab => {
            tab.addEventListener('click', () => {
                const targetId = tab.getAttribute('data-tab-target');
                const tabGroup = tab.closest('.app-nav-tabs, .app-nav-pills');
                const contentContainer = document.querySelector('[data-tab-content]');

                // Remove active class from all tabs in group
                tabGroup.querySelectorAll('[data-tab-target]').forEach(t => {
                    t.classList.remove('app-nav-tabs__item--active', 'app-nav-pills__item--active');
                });

                // Add active class to clicked tab
                tab.classList.add(tabGroup.classList.contains('app-nav-tabs') ? 'app-nav-tabs__item--active' : 'app-nav-pills__item--active');

                // Hide all panes
                if (contentContainer) {
                    contentContainer.querySelectorAll('.app-tab-pane').forEach(pane => {
                        pane.classList.remove('app-tab-pane--active');
                    });

                    // Show target pane
                    const targetPane = document.getElementById(targetId);
                    if (targetPane) {
                        targetPane.classList.add('app-tab-pane--active');
                    }
                }
            });
        });
    }

    // ==========================================================================
    // TOOLTIPS
    // ==========================================================================
    initTooltips() {
        document.querySelectorAll('[data-tooltip]').forEach(element => {
            const tooltipText = element.getAttribute('data-tooltip');
            const position = element.getAttribute('data-tooltip-position') || 'top';

            // Create tooltip element
            const tooltip = document.createElement('div');
            tooltip.className = `app-tooltip app-tooltip--${position}`;
            tooltip.innerHTML = `
                ${tooltipText}
                <span class="app-tooltip__arrow"></span>
            `;
            document.body.appendChild(tooltip);

            const showTooltip = () => {
                const rect = element.getBoundingClientRect();
                let top, left;

                switch (position) {
                    case 'top':
                        top = rect.top - tooltip.offsetHeight - 10;
                        left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2);
                        break;
                    case 'bottom':
                        top = rect.bottom + 10;
                        left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2);
                        break;
                    case 'left':
                        top = rect.top + (rect.height / 2) - (tooltip.offsetHeight / 2);
                        left = rect.left - tooltip.offsetWidth - 10;
                        break;
                    case 'right':
                        top = rect.top + (rect.height / 2) - (tooltip.offsetHeight / 2);
                        left = rect.right + 10;
                        break;
                }

                tooltip.style.top = `${top}px`;
                tooltip.style.left = `${left}px`;
                tooltip.classList.add('app-tooltip--show');
            };

            const hideTooltip = () => {
                tooltip.classList.remove('app-tooltip--show');
            };

            element.addEventListener('mouseenter', showTooltip);
            element.addEventListener('mouseleave', hideTooltip);
            element.addEventListener('focus', showTooltip);
            element.addEventListener('blur', hideTooltip);
        });
    }

    // ==========================================================================
    // TOASTS
    // ==========================================================================
    initToasts() {
        // Ensure toast container exists
        if (!document.querySelector('.app-toast-container')) {
            const container = document.createElement('div');
            container.className = 'app-toast-container app-toast-container--top-right';
            document.body.appendChild(container);
        }
    }

    static showToast(options = {}) {
        const {
            title = 'Notification',
            message = '',
            type = 'info', // success, danger, warning, info
            duration = 5000,
            position = 'top-right'
        } = options;

        const container = document.querySelector('.app-toast-container') || (() => {
            const c = document.createElement('div');
            c.className = `app-toast-container app-toast-container--${position}`;
            document.body.appendChild(c);
            return c;
        })();

        const icons = {
            success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>',
            danger: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>',
            warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
            info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>'
        };

        const toast = document.createElement('div');
        toast.className = `app-toast app-toast--${type}`;
        toast.innerHTML = `
            <div class="app-toast__icon">${icons[type]}</div>
            <div class="app-toast__content">
                <div class="app-toast__title">${title}</div>
                ${message ? `<div class="app-toast__message">${message}</div>` : ''}
            </div>
            <button class="app-toast__close">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        `;

        container.appendChild(toast);

        // Show toast
        setTimeout(() => toast.classList.add('app-toast--show'), 10);

        // Close button
        toast.querySelector('.app-toast__close').addEventListener('click', () => {
            toast.classList.remove('app-toast--show');
            setTimeout(() => toast.remove(), 300);
        });

        // Auto remove
        if (duration > 0) {
            setTimeout(() => {
                toast.classList.remove('app-toast--show');
                setTimeout(() => toast.remove(), 300);
            }, duration);
        }

        return toast;
    }

    // ==========================================================================
    // POPOVERS
    // ==========================================================================
    initPopovers() {
        document.querySelectorAll('[data-popover]').forEach(element => {
            const content = element.getAttribute('data-popover');
            const title = element.getAttribute('data-popover-title');
            const position = element.getAttribute('data-popover-position') || 'top';

            const popover = document.createElement('div');
            popover.className = `app-popover app-popover--${position}`;
            popover.innerHTML = `
                ${title ? `<div class="app-popover__title">${title}</div>` : ''}
                <div class="app-popover__content">${content}</div>
                <div class="app-popover__arrow"></div>
            `;
            document.body.appendChild(popover);

            const togglePopover = () => {
                const isShowing = popover.classList.contains('app-popover--show');
                
                // Hide all popovers
                document.querySelectorAll('.app-popover').forEach(p => {
                    p.classList.remove('app-popover--show');
                });

                if (!isShowing) {
                    const rect = element.getBoundingClientRect();
                    let top, left;

                    switch (position) {
                        case 'top':
                            top = rect.top - popover.offsetHeight - 10;
                            left = rect.left + (rect.width / 2) - (popover.offsetWidth / 2);
                            break;
                        case 'bottom':
                            top = rect.bottom + 10;
                            left = rect.left + (rect.width / 2) - (popover.offsetWidth / 2);
                            break;
                    }

                    popover.style.top = `${top}px`;
                    popover.style.left = `${left}px`;
                    popover.classList.add('app-popover--show');
                }
            };

            element.addEventListener('click', (e) => {
                e.stopPropagation();
                togglePopover();
            });
        });

        // Close popovers on outside click
        document.addEventListener('click', () => {
            document.querySelectorAll('.app-popover').forEach(p => {
                p.classList.remove('app-popover--show');
            });
        });
    }
}

// Initialize components when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.appComponents = new AppComponents();
});

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AppComponents;
}
