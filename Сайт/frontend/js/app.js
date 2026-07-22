
const API_BASE = 'http://localhost:8000/api';

const App = {
    init() {
        this.initHeader();
        this.initBurger();
        this.initFAQ();
        this.initParticles();
        this.initSmoothScroll();
    },

    initHeader() {
        const header = document.getElementById('header');
        if (!header) return;

        const onScroll = () => {
            header.classList.toggle('header--scrolled', window.scrollY > 50);
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    },

    initBurger() {
        const burger = document.getElementById('navBurger');
        const menu = document.getElementById('navMenu');
        if (!burger || !menu) return;

        burger.addEventListener('click', () => {
            menu.classList.toggle('nav__menu--open');
            burger.classList.toggle('nav__burger--active');
        });

        menu.querySelectorAll('.nav__link').forEach(link => {
            link.addEventListener('click', () => {
                menu.classList.remove('nav__menu--open');
                burger.classList.remove('nav__burger--active');
            });
        });
    },

    initFAQ() {
        const items = document.querySelectorAll('.faq-item');
        items.forEach(item => {
            const question = item.querySelector('.faq-item__question');
            const answer = item.querySelector('.faq-item__answer');

            question.addEventListener('click', () => {
                const isActive = item.classList.contains('faq-item--active');

                items.forEach(i => {
                    i.classList.remove('faq-item--active');
                    i.querySelector('.faq-item__answer').style.maxHeight = null;
                });

                if (!isActive) {
                    item.classList.add('faq-item--active');
                    answer.style.maxHeight = answer.scrollHeight + 'px';
                }
            });
        });
    },

    initParticles() {
        const container = document.getElementById('particles');
        if (!container) return;

        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';
            particle.style.animationDuration = (5 + Math.random() * 10) + 's';
            particle.style.animationDelay = Math.random() * 5 + 's';
            particle.style.width = (2 + Math.random() * 4) + 'px';
            particle.style.height = particle.style.width;
            container.appendChild(particle);
        }
    },

    initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    },

    async request(endpoint, options = {}) {
        const token = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
            ...options.headers,
        };

        try {
            const response = await fetch(`${API_BASE}${endpoint}`, {
                ...options,
                headers,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || 'Ошибка запроса');
            }

            return data;
        } catch (error) {
            if (error.message === 'Failed to fetch') {
                throw new Error('Сервер недоступен. Попробуйте позже.');
            }
            throw error;
        }
    },

    formatCurrency(amount) {
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            maximumFractionDigits: 0,
        }).format(amount);
    },

    showButtonLoading(btn, loading) {
        const text = btn.querySelector('.btn__text');
        const loader = btn.querySelector('.btn__loader');
        if (text) text.hidden = loading;
        if (loader) loader.hidden = !loading;
        btn.disabled = loading;
    },

    showAlert(container, message, type = 'error') {
        if (!container) return;
        container.textContent = message;
        container.className = `auth-form__alert auth-form__alert--${type}`;
        container.hidden = false;

        setTimeout(() => {
            container.hidden = true;
        }, 5000);
    },

    validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },

    getPasswordStrength(password) {
        let score = 0;
        if (password.length >= 8) score++;
        if (password.length >= 12) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;
        return Math.min(score, 4);
    }
};

document.addEventListener('DOMContentLoaded', () => App.init());
