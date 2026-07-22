

const Auth = {
    init() {
        this.initLoginForm();
        this.initRegisterForm();
        this.initPasswordToggle();
        this.initPasswordStrength();
    },

    initLoginForm() {
        const form = document.getElementById('loginForm');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            this.clearErrors(form);

            const email = document.getElementById('loginEmail').value.trim();
            const password = document.getElementById('loginPassword').value;

            if (!this.validateLoginForm(email, password)) return;

            const btn = document.getElementById('loginBtn');
            App.showButtonLoading(btn, true);

            try {
                const data = await App.request('/auth/login', {
                    method: 'POST',
                    body: JSON.stringify({ email, password }),
                });

                localStorage.setItem('token', data.access_token);
                localStorage.setItem('user', JSON.stringify(data.user));
                window.location.href = 'dashboard.html';
            } catch (error) {
                App.showAlert(document.getElementById('loginAlert'), error.message);
            } finally {
                App.showButtonLoading(btn, false);
            }
        });
    },

    initRegisterForm() {
        const form = document.getElementById('registerForm');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            this.clearErrors(form);

            const name = document.getElementById('regName').value.trim();
            const email = document.getElementById('regEmail').value.trim();
            const password = document.getElementById('regPassword').value;
            const passwordConfirm = document.getElementById('regPasswordConfirm').value;
            const agreeTerms = document.getElementById('agreeTerms').checked;

            if (!this.validateRegisterForm(name, email, password, passwordConfirm, agreeTerms)) return;

            const btn = document.getElementById('registerBtn');
            App.showButtonLoading(btn, true);

            try {
                const data = await App.request('/auth/register', {
                    method: 'POST',
                    body: JSON.stringify({ name, email, password }),
                });

                localStorage.setItem('token', data.access_token);
                localStorage.setItem('user', JSON.stringify(data.user));
                window.location.href = 'dashboard.html';
            } catch (error) {
                App.showAlert(document.getElementById('registerAlert'), error.message);
            } finally {
                App.showButtonLoading(btn, false);
            }
        });
    },

    validateLoginForm(email, password) {
        let valid = true;

        if (!email) {
            this.showError('loginEmailError', 'Введите email');
            valid = false;
        } else if (!App.validateEmail(email)) {
            this.showError('loginEmailError', 'Некорректный email');
            valid = false;
        }

        if (!password) {
            this.showError('loginPasswordError', 'Введите пароль');
            valid = false;
        }

        return valid;
    },

    validateRegisterForm(name, email, password, passwordConfirm, agreeTerms) {
        let valid = true;

        if (!name || name.length < 2) {
            this.showError('regNameError', 'Введите имя (минимум 2 символа)');
            valid = false;
        }

        if (!email) {
            this.showError('regEmailError', 'Введите email');
            valid = false;
        } else if (!App.validateEmail(email)) {
            this.showError('regEmailError', 'Некорректный email');
            valid = false;
        }

        if (!password) {
            this.showError('regPasswordError', 'Введите пароль');
            valid = false;
        } else if (password.length < 8) {
            this.showError('regPasswordError', 'Пароль должен быть не менее 8 символов');
            valid = false;
        }

        if (password !== passwordConfirm) {
            this.showError('regPasswordConfirmError', 'Пароли не совпадают');
            valid = false;
        }

        if (!agreeTerms) {
            App.showAlert(document.getElementById('registerAlert'), 'Необходимо принять условия использования');
            valid = false;
        }

        return valid;
    },

    showError(elementId, message) {
        const el = document.getElementById(elementId);
        if (el) el.textContent = message;
    },

    clearErrors(form) {
        form.querySelectorAll('.form-error').forEach(el => el.textContent = '');
    },

    initPasswordToggle() {
        const toggles = [
            { btn: 'togglePassword', input: 'loginPassword' },
            { btn: 'toggleRegPassword', input: 'regPassword' },
        ];

        toggles.forEach(({ btn, input }) => {
            const toggleBtn = document.getElementById(btn);
            const inputEl = document.getElementById(input);
            if (!toggleBtn || !inputEl) return;

            toggleBtn.addEventListener('click', () => {
                const isPassword = inputEl.type === 'password';
                inputEl.type = isPassword ? 'text' : 'password';
                toggleBtn.style.color = isPassword ? 'var(--primary-light)' : '';
            });
        });
    },

    initPasswordStrength() {
        const input = document.getElementById('regPassword');
        const strengthEl = document.getElementById('passwordStrength');
        if (!input || !strengthEl) return;

        const bar = strengthEl.querySelector('.password-strength__bar span');
        const label = strengthEl.querySelector('.password-strength__label');

        const levels = [
            { width: '0%', color: '', text: '' },
            { width: '25%', color: '#ef4444', text: 'Слабый' },
            { width: '50%', color: '#f59e0b', text: 'Средний' },
            { width: '75%', color: '#06b6d4', text: 'Хороший' },
            { width: '100%', color: '#10b981', text: 'Надёжный' },
        ];

        input.addEventListener('input', () => {
            const score = App.getPasswordStrength(input.value);
            const level = levels[score];

            bar.style.width = level.width;
            bar.style.background = level.color;
            label.textContent = level.text;
            label.style.color = level.color;
        });
    },
};

document.addEventListener('DOMContentLoaded', () => Auth.init());

