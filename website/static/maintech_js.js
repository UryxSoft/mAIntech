/* ===========================
   MAINTECH - JavaScript
   Interactive Features
   =========================== */

// ===========================
// Navbar Scroll Effect
// ===========================
const navbar = document.querySelector('.navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
});

// ===========================
// Mobile Menu Toggle
// ===========================
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navMenu = document.querySelector('.nav-menu');
const navActions = document.querySelector('.nav-actions');

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        navActions.classList.toggle('active');
        mobileMenuBtn.classList.toggle('active');
    });
}

// ===========================
// Smooth Scroll for Navigation Links
// ===========================
const navLinks = document.querySelectorAll('.nav-link');

navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        
        if (href.startsWith('#')) {
            e.preventDefault();
            const targetId = href.substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
                
                // Update active link
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                
                // Close mobile menu if open
                if (window.innerWidth <= 768) {
                    navMenu.classList.remove('active');
                    navActions.classList.remove('active');
                    mobileMenuBtn.classList.remove('active');
                }
            }
        }
    });
});

// ===========================
// Intersection Observer for Animations
// ===========================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all feature cards, industry cards, and pricing cards
const animatedElements = document.querySelectorAll(
    '.feature-card, .industry-card, .pricing-card, .module-item'
);

animatedElements.forEach((el, index) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = `all 0.6s ease ${index * 0.1}s`;
    observer.observe(el);
});

// ===========================
// Gradient Orb Mouse Movement
// ===========================
const heroSection = document.querySelector('.hero');
const orbs = document.querySelectorAll('.gradient-orb');

if (heroSection && window.innerWidth > 768) {
    heroSection.addEventListener('mousemove', (e) => {
        const { clientX, clientY } = e;
        const { offsetWidth, offsetHeight } = heroSection;
        
        const xPos = (clientX / offsetWidth - 0.5) * 50;
        const yPos = (clientY / offsetHeight - 0.5) * 50;
        
        orbs.forEach((orb, index) => {
            const speed = (index + 1) * 0.3;
            orb.style.transform = `translate(${xPos * speed}px, ${yPos * speed}px)`;
        });
    });
}

// ===========================
// Stats Counter Animation
// ===========================
const stats = document.querySelectorAll('.stat h3');

const animateCounter = (element, target) => {
    let current = 0;
    const increment = target / 100;
    const duration = 2000;
    const stepTime = duration / 100;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, stepTime);
};

const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const statElement = entry.target;
            const targetText = statElement.textContent;
            const targetNumber = parseInt(targetText.replace(/\D/g, ''));
            
            if (targetNumber && !statElement.classList.contains('animated')) {
                statElement.classList.add('animated');
                animateCounter(statElement, targetNumber);
            }
        }
    });
}, { threshold: 0.5 });

stats.forEach(stat => {
    if (stat.textContent.match(/\d/)) {
        statsObserver.observe(stat);
    }
});

// ===========================
// Pricing Card Hover Effect
// ===========================
const pricingCards = document.querySelectorAll('.pricing-card');

pricingCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-10px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', function() {
        if (this.classList.contains('featured')) {
            this.style.transform = 'scale(1.05)';
        } else {
            this.style.transform = 'translateY(0) scale(1)';
        }
    });
});

// ===========================
// Feature Card Tilt Effect
// ===========================
const featureCards = document.querySelectorAll('.feature-card');

if (window.innerWidth > 768) {
    featureCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
        });
    });
}

// ===========================
// Typing Effect for Hero Badge
// ===========================
const heroBadge = document.querySelector('.hero-badge span:last-child');

if (heroBadge) {
    const originalText = heroBadge.textContent;
    heroBadge.textContent = '';
    
    let i = 0;
    const typeWriter = () => {
        if (i < originalText.length) {
            heroBadge.textContent += originalText.charAt(i);
            i++;
            setTimeout(typeWriter, 50);
        }
    };
    
    setTimeout(typeWriter, 500);
}

// ===========================
// CTA Button Ripple Effect
// ===========================
const ctaButtons = document.querySelectorAll('.btn-cta-primary, .btn-cta-secondary');

ctaButtons.forEach(button => {
    button.addEventListener('click', function(e) {
        const x = e.clientX - e.target.offsetLeft;
        const y = e.clientY - e.target.offsetTop;
        
        const ripple = document.createElement('span');
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');
        
        this.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
});

// Add ripple styles dynamically
const style = document.createElement('style');
style.textContent = `
    .btn-cta-primary, .btn-cta-secondary {
        position: relative;
        overflow: hidden;
    }
    
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.5);
        transform: scale(0);
        animation: ripple-animation 0.6s ease-out;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ===========================
// Active Section Highlight
// ===========================
const sections = document.querySelectorAll('section[id]');

const highlightNav = () => {
    const scrollY = window.pageYOffset;
    
    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');
        
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
};

window.addEventListener('scroll', highlightNav);

// ===========================
// Dashboard Mockup Animation
// ===========================
const dashboardMockup = document.querySelector('.dashboard-mockup');

if (dashboardMockup) {
    const mockupObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                dashboardMockup.style.animation = 'slideInRight 0.8s ease forwards';
            }
        });
    }, { threshold: 0.3 });
    
    mockupObserver.observe(dashboardMockup);
}

// Add dashboard animation
const dashboardStyle = document.createElement('style');
dashboardStyle.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(50px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
`;
document.head.appendChild(dashboardStyle);

// ===========================
// Parallax Effect for Sections
// ===========================
const parallaxSections = document.querySelectorAll('.hero, .cta');

window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    
    parallaxSections.forEach(section => {
        const offset = section.offsetTop;
        const speed = 0.5;
        
        if (scrolled > offset - window.innerHeight && scrolled < offset + section.offsetHeight) {
            const yPos = (scrolled - offset) * speed;
            const orbs = section.querySelectorAll('.gradient-orb');
            
            orbs.forEach((orb, index) => {
                orb.style.transform = `translateY(${yPos * (index + 1) * 0.3}px)`;
            });
        }
    });
});

// ===========================
// Form Validation (for future contact form)
// ===========================
const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

// ===========================
// Cookie Consent (Optional)
// ===========================
const showCookieConsent = () => {
    const consent = localStorage.getItem('cookieConsent');
    
    if (!consent) {
        const banner = document.createElement('div');
        banner.className = 'cookie-banner';
        banner.innerHTML = `
            <div class="cookie-content">
                <p>Usamos cookies para mejorar tu experiencia. Al continuar navegando, aceptas nuestro uso de cookies.</p>
                <button class="btn-accept-cookies">Aceptar</button>
            </div>
        `;
        document.body.appendChild(banner);
        
        const acceptBtn = banner.querySelector('.btn-accept-cookies');
        acceptBtn.addEventListener('click', () => {
            localStorage.setItem('cookieConsent', 'true');
            banner.remove();
        });
    }
};

// Add cookie banner styles
const cookieStyle = document.createElement('style');
cookieStyle.textContent = `
    .cookie-banner {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: rgba(26, 26, 36, 0.98);
        backdrop-filter: blur(20px);
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        padding: 1.5rem;
        z-index: 9999;
        animation: slideUp 0.3s ease;
    }
    
    .cookie-content {
        max-width: 1280px;
        margin: 0 auto;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 2rem;
    }
    
    .cookie-content p {
        color: var(--text-secondary);
        margin: 0;
    }
    
    .btn-accept-cookies {
        padding: 0.75rem 1.5rem;
        background: var(--accent-gradient);
        color: white;
        border: none;
        border-radius: 0.5rem;
        font-weight: 600;
        cursor: pointer;
        white-space: nowrap;
        transition: transform 0.15s ease;
    }
    
    .btn-accept-cookies:hover {
        transform: translateY(-2px);
    }
    
    @keyframes slideUp {
        from {
            transform: translateY(100%);
        }
        to {
            transform: translateY(0);
        }
    }
    
    @media (max-width: 768px) {
        .cookie-content {
            flex-direction: column;
            text-align: center;
        }
    }
`;
document.head.appendChild(cookieStyle);

// Uncomment to enable cookie consent
// showCookieConsent();

// ===========================
// Initialize on Page Load
// ===========================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 MAINTECH Website Loaded');
    
    // Add loading animation
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
});

// ===========================
// Performance Optimization
// ===========================
// Debounce function for scroll events
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// Apply debounce to scroll-heavy functions
window.addEventListener('scroll', debounce(() => {
    highlightNav();
}, 100));

console.log('✨ MAINTECH - Powered by AI');