// ============================================
// TALLER DE MOTOS LA ROCA - SISTEMA COMPLETO
// VERSIÓN RESPONSIVE CON SCROLL EN MODAL
// ============================================

// --- SISTEMA DE REGISTRO Y LOGIN (localStorage) ---

// Base de datos simulada en localStorage
const STORAGE_KEY = 'taller_la_roca_users';

// Inicializar usuarios por defecto si no existen
function initUsers() {
    if (!localStorage.getItem(STORAGE_KEY)) {
        const defaultUsers = [
            {
                id: 1,
                name: "Cliente Demo",
                email: "demo@larocamotos.com",
                password: "123456",
                phone: "77777777",
                address: "",
                bikeBrand: "",
                registeredAt: new Date().toISOString()
            }
        ];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultUsers));
    }
}

// Obtener todos los usuarios
function getUsers() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

// Guardar usuarios
function saveUsers(users) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

// Registrar nuevo usuario (con más campos)
function registerUser(name, email, password, phone, address, bikeBrand) {
    const users = getUsers();
    
    // Verificar si el email ya existe
    if (users.some(u => u.email === email)) {
        return { success: false, message: "Este correo ya está registrado. Inicia sesión." };
    }
    
    // Crear nuevo usuario
    const newUser = {
        id: Date.now(),
        name: name,
        email: email,
        password: password,
        phone: phone || "",
        address: address || "",
        bikeBrand: bikeBrand || "",
        registeredAt: new Date().toISOString()
    };
    
    users.push(newUser);
    saveUsers(users);
    
    return { success: true, message: "Registro exitoso. Ahora puedes iniciar sesión." };
}

// Iniciar sesión
function loginUser(email, password) {
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        // Guardar sesión actual
        const session = {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            address: user.address,
            bikeBrand: user.bikeBrand,
            loggedInAt: new Date().toISOString()
        };
        sessionStorage.setItem('currentSession', JSON.stringify(session));
        return { success: true, message: `¡Bienvenido ${user.name}!`, user: session };
    }
    
    return { success: false, message: "Correo o contraseña incorrectos." };
}

// Cerrar sesión
function logoutUser() {
    sessionStorage.removeItem('currentSession');
    return { success: true, message: "Sesión cerrada correctamente." };
}

// Verificar si hay sesión activa
function getCurrentSession() {
    const session = sessionStorage.getItem('currentSession');
    return session ? JSON.parse(session) : null;
}

// Actualizar interfaz según sesión
function updateUIForSession() {
    const session = getCurrentSession();
    const loginNavBtn = document.getElementById('btn-login-nav');
    
    if (session) {
        // Usuario logueado - mostrar info
        if (loginNavBtn && loginNavBtn.parentNode) {
            const userInfoDiv = document.createElement('div');
            userInfoDiv.className = 'user-info';
            userInfoDiv.innerHTML = `
                <span class="user-name">👤 ${session.name.split(' ')[0]}</span>
                <button class="btn-logout" id="btn-logout">Salir</button>
            `;
            loginNavBtn.parentNode.replaceChild(userInfoDiv, loginNavBtn);
            
            const logoutBtn = document.getElementById('btn-logout');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    logoutUser();
                    showNotification('Sesión cerrada', 'Has cerrado sesión correctamente.');
                    setTimeout(() => location.reload(), 1500);
                });
            }
        }
    } else {
        // Usuario no logueado - mostrar botón ingresar
        const existingUserInfo = document.querySelector('.user-info');
        if (existingUserInfo && existingUserInfo.parentNode) {
            const newLoginBtn = document.createElement('a');
            newLoginBtn.href = '#';
            newLoginBtn.id = 'btn-login-nav';
            newLoginBtn.className = 'btn-login-nav';
            newLoginBtn.textContent = 'Ingresar';
            existingUserInfo.parentNode.replaceChild(newLoginBtn, existingUserInfo);
            
            newLoginBtn.addEventListener('click', (e) => {
                e.preventDefault();
                openModal();
            });
        } else if (loginNavBtn) {
            loginNavBtn.addEventListener('click', (e) => {
                e.preventDefault();
                openModal();
            });
        }
    }
}

// --- MODALES ---

const loginModal = document.getElementById('loginModal');
const notificationModal = document.getElementById('notificationModal');

function openModal() {
    if (loginModal) {
        loginModal.style.display = 'block';
        // Asegurar que el scroll esté disponible
        const modalContent = loginModal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.scrollTop = 0;
        }
    }
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    if (loginModal) loginModal.style.display = 'none';
    if (notificationModal) notificationModal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

function showNotification(title, message) {
    const titleEl = document.getElementById('notificationTitle');
    const msgEl = document.getElementById('notificationMessage');
    if (titleEl) titleEl.textContent = title;
    if (msgEl) msgEl.textContent = message;
    if (notificationModal) notificationModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // Auto cerrar después de 3 segundos
    setTimeout(() => {
        if (notificationModal) notificationModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }, 3000);
}

// --- INICIALIZACIÓN DE FORMULARIOS MODALES ---

function initModals() {
    // Cerrar modales
    const closeBtns = document.querySelectorAll('.close-modal, .close-notification, .close-notification-btn');
    closeBtns.forEach(btn => {
        btn.addEventListener('click', closeModal);
    });
    
    // Clic fuera del modal
    window.addEventListener('click', (e) => {
        if (e.target === loginModal) closeModal();
        if (e.target === notificationModal) closeModal();
    });
    
    // Tabs en modal
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            // Cambiar clase activa en tabs
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Mostrar formulario correspondiente
            const loginPane = document.getElementById('loginForm');
            const registerPane = document.getElementById('registerForm');
            if (tab === 'login') {
                if (loginPane) loginPane.classList.add('active');
                if (registerPane) registerPane.classList.remove('active');
            } else {
                if (loginPane) loginPane.classList.remove('active');
                if (registerPane) registerPane.classList.add('active');
            }
        });
    });
    
    // Formulario de Registro
    const registerForm = document.getElementById('registerUserForm');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('regName')?.value.trim() || '';
            const email = document.getElementById('regEmail')?.value.trim() || '';
            const password = document.getElementById('regPassword')?.value || '';
            const confirmPassword = document.getElementById('regConfirmPassword')?.value || '';
            const phone = document.getElementById('regPhone')?.value.trim() || '';
            const address = document.getElementById('regAddress')?.value.trim() || '';
            const bikeBrand = document.getElementById('regBikeBrand')?.value.trim() || '';
            const msgEl = document.getElementById('registerMessage');
            
            if (!name || !email || !password) {
                if (msgEl) msgEl.textContent = 'Por favor completa todos los campos obligatorios.';
                return;
            }
            
            if (password !== confirmPassword) {
                if (msgEl) msgEl.textContent = 'Las contraseñas no coinciden.';
                return;
            }
            
            if (password.length < 6) {
                if (msgEl) msgEl.textContent = 'La contraseña debe tener al menos 6 caracteres.';
                return;
            }
            
            const result = registerUser(name, email, password, phone, address, bikeBrand);
            if (msgEl) {
                msgEl.textContent = result.message;
                msgEl.style.color = result.success ? '#4caf50' : '#e31b23';
            }
            
            if (result.success) {
                // Limpiar formulario
                registerForm.reset();
                // Cambiar a pestaña de login
                setTimeout(() => {
                    const loginTab = document.querySelector('.tab-btn[data-tab="login"]');
                    if (loginTab) loginTab.click();
                    if (msgEl) msgEl.textContent = '';
                }, 2000);
            }
        });
    }
    
    // Formulario de Login
    const loginForm = document.getElementById('loginUserForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail')?.value.trim() || '';
            const password = document.getElementById('loginPassword')?.value || '';
            const msgEl = document.getElementById('loginMessage');
            
            if (!email || !password) {
                if (msgEl) msgEl.textContent = 'Por favor ingresa correo y contraseña.';
                return;
            }
            
            const result = loginUser(email, password);
            if (msgEl) {
                msgEl.textContent = result.message;
                msgEl.style.color = result.success ? '#4caf50' : '#e31b23';
            }
            
            if (result.success) {
                showNotification('Bienvenido', result.message);
                setTimeout(() => {
                    closeModal();
                    location.reload();
                }, 1500);
            }
        });
    }
}

// --- BOTONES Y ACCIONES ---

function initButtons() {
    // Botones "Solicitar" de servicios
    const cardBtns = document.querySelectorAll('.card-btn');
    cardBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const session = getCurrentSession();
            if (!session) {
                showNotification('Acceso requerido', 'Debes iniciar sesión para solicitar un servicio.');
                openModal();
                return;
            }
            const card = btn.closest('.card');
            const serviceName = card?.querySelector('h4')?.textContent || 'servicio';
            showNotification('Solicitud enviada', `${session.name}, hemos recibido tu solicitud para "${serviceName}". Te contactaremos pronto.`);
        });
    });
    
    // Botón "Agendar cita"
    const agendarBtns = document.querySelectorAll('.btn-agendar');
    agendarBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const session = getCurrentSession();
            if (!session) {
                showNotification('Acceso requerido', 'Debes iniciar sesión para agendar una cita.');
                openModal();
                return;
            }
            showNotification('Cita agendada', `${session.name}, tu solicitud de cita ha sido registrada. En breve te confirmaremos el horario.`);
        });
    });
    
    // Botón WhatsApp
    const whatsappBtn = document.getElementById('whatsappBtn');
    if (whatsappBtn) {
        whatsappBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const session = getCurrentSession();
            const phone = '59177777777';
            let message = 'Hola, vengo de la página web de LA ROCA MOTOS. Necesito información sobre sus servicios.';
            if (session) {
                message = `Hola, soy ${session.name}. Vengo de la página web de LA ROCA MOTOS y necesito información sobre sus servicios.`;
            }
            window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
        });
    }
    
    // Navegación suave y activación de enlaces
    const navLinks = document.querySelectorAll('.nav-link, .footer-links a, .btn-outline');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });
    
    // Marcas interactivas
    const marcasItems = document.querySelectorAll('.marcas li');
    marcasItems.forEach(item => {
        item.addEventListener('click', () => {
            const marca = item.textContent;
            showNotification('Consulta de marca', `Tenemos especialistas en motos ${marca}. Contáctanos para más información.`);
        });
    });
    
    // Imágenes de galería
    const galleryItems = document.querySelectorAll('.galeria-item');
    galleryItems.forEach(item => {
        item.addEventListener('click', () => {
            showNotification('Galería', '¿Te gustaría tener tu moto en nuestro taller? ¡Agenda una cita!');
        });
    });
    
    // Tarjetas de contacto
    const contactCards = document.querySelectorAll('.contact-card');
    contactCards.forEach(card => {
        card.addEventListener('click', () => {
            const title = card.querySelector('h4')?.textContent || '';
            if (title === 'Teléfono') {
                window.location.href = 'tel:+59177777777';
            } else if (title === 'Email') {
                window.location.href = 'mailto:info@larocamotos.com';
            } else {
                showNotification('Contacto', `Para más información, comunícate con nosotros por ${title}.`);
            }
        });
    });
}

// --- SCROLL ANIMATIONS Y ACTIVE MENU ---

function initScrollEffects() {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');
    
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.clientHeight;
            if (window.pageYOffset >= sectionTop && window.pageYOffset < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');
            if (href === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
    
    // Animación de cards al hacer scroll
    const cards = document.querySelectorAll('.card');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });
    
    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'all 0.5s ease';
        observer.observe(card);
    });
}

// --- MENÚ MÓVIL ---
function initMobileMenu() {
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('nav ul');
    
    if (mobileBtn && nav) {
        mobileBtn.addEventListener('click', () => {
            nav.classList.toggle('show');
            mobileBtn.classList.toggle('active');
        });
    }
}

// --- INICIALIZACIÓN COMPLETA ---

document.addEventListener('DOMContentLoaded', () => {
    initUsers();
    updateUIForSession();
    initModals();
    initButtons();
    initScrollEffects();
    initMobileMenu();
    
    // Pequeña bienvenida en consola
    console.log('🏍️ Taller de Motos LA ROCA - Sistema de Gestión de Servicios Mecánicos');
    console.log('🎨 Colores: Rojo y Negro | Sistema de Login funcional con localStorage');
    console.log('📱 Totalmente responsive | Modal con scroll para registro');
});