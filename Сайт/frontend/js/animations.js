

const Animations = {
    init() {
        this.initScrollReveal();
        this.initCounters();
        this.initScoreRings();
        this.initTiltEffect();
    },

    initScrollReveal() {
        const elements = document.querySelectorAll('[data-animate]');
        if (!elements.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        elements.forEach(el => observer.observe(el));
    },

    initCounters() {
        const counters = document.querySelectorAll('[data-count]');
        if (!counters.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(el => observer.observe(el));
    },

    animateCounter(element) {
        const target = parseInt(element.dataset.count);
        const duration = 2000;
        const startTime = performance.now();

        const easeOutExpo = (t) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t);

        const update = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = easeOutExpo(progress);
            const current = Math.round(easedProgress * target);

            element.textContent = current.toLocaleString('ru-RU');

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        };

        requestAnimationFrame(update);
    },

    initScoreRings() {
        const rings = document.querySelectorAll('.score-ring__fill');
        if (!rings.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateScoreRing(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        rings.forEach(ring => observer.observe(ring));
    },

    animateScoreRing(ring) {
        const score = parseInt(ring.dataset.score) || 0;
        const circumference = 2 * Math.PI * 52;
        const offset = circumference - (score / 100) * circumference;

        ring.style.strokeDasharray = circumference;
        ring.style.strokeDashoffset = circumference;

        requestAnimationFrame(() => {
            ring.style.strokeDashoffset = offset;
        });
    },

    initTiltEffect() {
        const cards = document.querySelectorAll('.feature-card, .pricing-card');
        if (!cards.length) return;

        cards.forEach(card => {
            card.style.transition = 'none';

            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = (y - centerY) / 30;
                const rotateY = (centerX - x) / 30;

                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transition = 'transform 0.3s ease';
                card.style.transform = '';
            });
        });
    },

    animateScoreRingTo(element, score) {
        const circumference = 2 * Math.PI * 52;
        const offset = circumference - (score / 100) * circumference;

        element.style.strokeDasharray = circumference;
        element.style.strokeDashoffset = circumference;

        requestAnimationFrame(() => {
            element.style.strokeDashoffset = offset;
        });
    },

    animateValue(element, target, suffix = '') {
        const duration = 1000;
        const startTime = performance.now();

        const update = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const current = Math.round(progress * target);
            element.textContent = current + suffix;

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        };

        requestAnimationFrame(update);
    }
};

document.addEventListener('DOMContentLoaded', () => Animations.init());

