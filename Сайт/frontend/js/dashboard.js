

const Dashboard = {
    currentStep: 1,
    totalSteps: 3,

    init() {
        this.checkAuth();
        this.initTabs();
        this.initSidebar();
        this.initAnalysisForm();
        this.initChat();
        this.initProfile();
        this.initLogout();
        this.initClearHistory();
        this.loadUserData();
    },

    checkAuth() {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = 'login.html';
        }
    },

    loadUserData() {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const initial = (user.name || 'П')[0].toUpperCase();

        document.getElementById('userAvatar').textContent = initial;
        document.getElementById('profileAvatar').textContent = initial;
        document.getElementById('profileName').textContent = user.name || 'Пользователь';
        document.getElementById('profileEmail').textContent = user.email || '';
        document.getElementById('profileNameInput').value = user.name || '';
        document.getElementById('profilePhone').value = user.phone || '';
        document.getElementById('profileCity').value = user.city || '';
        document.getElementById('profileBirthdate').value = user.birthdate || '';

        const badge = document.getElementById('trialBadge');
        if (badge) {
            if (user.trial_active) {
                badge.textContent = 'Пробный период активен';
                badge.classList.remove('trial-badge--expired');
            } else {
                badge.textContent = 'Пробный период истёк';
                badge.classList.add('trial-badge--expired');
            }
        }
    },

    initTabs() {
        const links = document.querySelectorAll('.sidebar__link[data-tab]');
        const titles = {
            overview: 'Обзор',
            analysis: 'Новый анализ',
            history: 'История',
            assistant: 'ИИ-ассистент',
            profile: 'Профиль',
        };

        links.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const tab = link.dataset.tab;
                this.switchTab(tab);
            });
        });

        document.querySelectorAll('[data-tab]').forEach(btn => {
            if (btn.classList.contains('sidebar__link')) return;
            btn.addEventListener('click', () => {
                this.switchTab(btn.dataset.tab);
            });
        });
    },

    switchTab(tab) {
        document.querySelectorAll('.sidebar__link').forEach(l => l.classList.remove('sidebar__link--active'));
        document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('tab-content--active'));

        const activeLink = document.querySelector(`.sidebar__link[data-tab="${tab}"]`);
        const activeTab = document.getElementById(`tab-${tab}`);

        if (activeLink) activeLink.classList.add('sidebar__link--active');
        if (activeTab) activeTab.classList.add('tab-content--active');

        const titles = {
            overview: 'Обзор',
            analysis: 'Новый анализ',
            history: 'История',
            assistant: 'ИИ-ассистент',
            profile: 'Профиль',
        };
        document.getElementById('pageTitle').textContent = titles[tab] || 'Обзор';

        this.closeSidebar();
    },

    initSidebar() {
        const menuBtn = document.getElementById('menuBtn');
        const sidebar = document.getElementById('sidebar');

        if (menuBtn) {
            menuBtn.addEventListener('click', () => {
                sidebar.classList.toggle('sidebar--open');
            });
        }

        document.addEventListener('click', (e) => {
            if (sidebar.classList.contains('sidebar--open') &&
                !sidebar.contains(e.target) &&
                !menuBtn.contains(e.target)) {
                this.closeSidebar();
            }
        });
    },

    closeSidebar() {
        document.getElementById('sidebar').classList.remove('sidebar--open');
    },

    initAnalysisForm() {
        const form = document.getElementById('analysisForm');
        if (!form) return;

        form.querySelectorAll('[data-next-step]').forEach(btn => {
            btn.addEventListener('click', () => this.nextStep());
        });

        form.querySelectorAll('[data-prev-step]').forEach(btn => {
            btn.addEventListener('click', () => this.prevStep());
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitAnalysis();
        });

        const newBtn = document.getElementById('newAnalysisBtn');
        if (newBtn) {
            newBtn.addEventListener('click', () => {
                document.getElementById('analysisResult').hidden = true;
                form.style.display = '';
                this.currentStep = 1;
                this.showStep(1);
            });
        }
    },

    showStep(step) {
        document.querySelectorAll('.analysis-form__step').forEach(s => {
            s.classList.remove('analysis-form__step--active');
        });
        const target = document.querySelector(`.analysis-form__step[data-step="${step}"]`);
        if (target) target.classList.add('analysis-form__step--active');
    },

    nextStep() {
        if (this.currentStep < this.totalSteps) {
            this.currentStep++;
            this.showStep(this.currentStep);
        }
    },

    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.showStep(this.currentStep);
        }
    },

    async submitAnalysis() {
        const btn = document.getElementById('submitAnalysis');
        App.showButtonLoading(btn, true);

        const loanType = document.getElementById('typeOfLoan').value;
        const payload = {
            age: parseInt(document.getElementById('age').value),
            annual_income: parseFloat(document.getElementById('annualIncome').value) || 0,
            monthly_inhand_salary: parseFloat(document.getElementById('monthlyInhandSalary').value) || 0,
            credit_history_age: parseFloat(document.getElementById('creditHistoryAge').value) || 0,
            total_emi_per_month: parseFloat(document.getElementById('totalEmiPerMonth').value) || 0,
            num_bank_accounts: parseInt(document.getElementById('numBankAccounts').value) || 0,
            num_credit_card: parseInt(document.getElementById('numCreditCard').value) || 0,
            interest_rate: parseFloat(document.getElementById('interestRate').value) || 0,
            num_of_loan: parseInt(document.getElementById('numOfLoan').value) || 0,
            delay_from_due_date: parseFloat(document.getElementById('delayFromDueDate').value) || 0,
            num_of_delayed_payment: parseInt(document.getElementById('numOfDelayedPayment').value) || 0,
            changed_credit_limit: parseFloat(document.getElementById('changedCreditLimit').value) || 0,
            num_credit_inquiries: parseInt(document.getElementById('numCreditInquiries').value) || 0,
            outstanding_debt: parseFloat(document.getElementById('outstandingDebt').value) || 0,
            credit_utilization_ratio: parseFloat(document.getElementById('creditUtilizationRatio').value) || 0,
            amount_invested_monthly: parseFloat(document.getElementById('amountInvestedMonthly').value) || 0,
            monthly_balance: parseFloat(document.getElementById('monthlyBalance').value) || 0,
            occupation: document.getElementById('occupation').value,
            credit_mix: document.getElementById('creditMix').value,
            payment_of_min_amount: document.getElementById('paymentOfMinAmount').value,
            payment_behaviour: document.getElementById('paymentBehaviour').value,
            type_of_loan: loanType ? [loanType] : [],
        };

        try {
            const data = await App.request('/analysis/predict', {
                method: 'POST',
                body: JSON.stringify(payload),
            });

            this.showResult(data);
            this.addToHistory(data, payload);
        } catch (error) {
            if (error.message.includes('Пробный период истёк')) {
                alert('Пробный период истёк. Оформите подписку для продолжения.');
            } else {
                alert(error.message);
            }
        } finally {
            App.showButtonLoading(btn, false);
        }
    },

    showResult(data) {
        const form = document.getElementById('analysisForm');
        const result = document.getElementById('analysisResult');

        form.style.display = 'none';
        result.hidden = false;

        document.getElementById('resultScore').textContent = data.credit_score;
        document.getElementById('resultProbability').textContent = data.approval_probability + '%';
        document.getElementById('resultAmount').textContent = App.formatCurrency(data.recommended_amount);
        document.getElementById('resultDebtRatio').textContent = data.debt_ratio + '%';

        const verdict = document.getElementById('resultVerdict');
        if (data.credit_score >= 70) {
            verdict.textContent = 'Высокая вероятность одобрения';
            verdict.style.color = 'var(--success)';
        } else if (data.credit_score >= 40) {
            verdict.textContent = 'Средняя вероятность одобрения';
            verdict.style.color = 'var(--warning)';
        } else {
            verdict.textContent = 'Низкая вероятность одобрения';
            verdict.style.color = 'var(--danger)';
        }

        const ring = document.getElementById('resultScoreRing');
        Animations.animateScoreRingTo(ring, data.credit_score);

        const mlSection = document.getElementById('resultML');
        if (data.ml_prediction && data.ml_probabilities) {
            mlSection.hidden = false;
            const labelEl = document.getElementById('mlLabel');
            const labelMap = { Poor: 'Низкий', Standard: 'Средний', Good: 'Высокий' };
            const colorMap = { Poor: 'var(--danger)', Standard: 'var(--warning)', Good: 'var(--success)' };
            labelEl.textContent = labelMap[data.ml_prediction] || data.ml_prediction;
            labelEl.style.background = colorMap[data.ml_prediction] || 'var(--accent)';

            const probs = data.ml_probabilities;
            document.getElementById('mlProbs').innerHTML = `
                <div class="ml-prob-bar">
                    <span class="ml-prob-bar__label">Poor</span>
                    <div class="ml-prob-bar__track"><div class="ml-prob-bar__fill ml-prob-bar__fill--poor" style="width:${probs.poor}%"></div></div>
                    <span class="ml-prob-bar__value">${probs.poor}%</span>
                </div>
                <div class="ml-prob-bar">
                    <span class="ml-prob-bar__label">Standard</span>
                    <div class="ml-prob-bar__track"><div class="ml-prob-bar__fill ml-prob-bar__fill--standard" style="width:${probs.standard}%"></div></div>
                    <span class="ml-prob-bar__value">${probs.standard}%</span>
                </div>
                <div class="ml-prob-bar">
                    <span class="ml-prob-bar__label">Good</span>
                    <div class="ml-prob-bar__track"><div class="ml-prob-bar__fill ml-prob-bar__fill--good" style="width:${probs.good}%"></div></div>
                    <span class="ml-prob-bar__value">${probs.good}%</span>
                </div>
            `;
        } else {
            mlSection.hidden = true;
        }

        const recsEl = document.getElementById('resultRecommendations');
        if (data.recommendations && data.recommendations.length) {
            recsEl.innerHTML = '<h4>Рекомендации</h4><ul>' +
                data.recommendations.map(r => `<li>${r}</li>`).join('') +
                '</ul>';
        }

        document.getElementById('creditScore').textContent = data.credit_score;
        document.getElementById('approvalProbability').textContent = data.approval_probability + '%';
        document.getElementById('recommendedAmount').textContent = App.formatCurrency(data.recommended_amount);
    },

    addToHistory(data, payload) {
        const history = JSON.parse(localStorage.getItem('analysisHistory') || '[]');
        history.unshift({
            date: new Date().toLocaleDateString('ru-RU'),
            score: data.credit_score,
            probability: data.approval_probability,
            amount: data.recommended_amount,
        });
        localStorage.setItem('analysisHistory', JSON.stringify(history));
        this.renderHistory();
    },

    initClearHistory() {
        const btn = document.getElementById('clearHistoryBtn');
        if (!btn) return;
        btn.addEventListener('click', () => {
            if (confirm('Очистить всю историю анализов?')) {
                localStorage.removeItem('analysisHistory');
                this.renderHistory();
            }
        });
    },

    renderHistory() {
        const history = JSON.parse(localStorage.getItem('analysisHistory') || '[]');
        const list = document.getElementById('historyList');
        if (!list) return;

        if (!history.length) {
            list.innerHTML = `<div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <p>Пока нет проведённых анализов</p>
            </div>`;
            return;
        }

        list.innerHTML = history.map(item => `
            <div class="overview-card">
                <div class="overview-card__icon overview-card__icon--score">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                </div>
                <div class="overview-card__info">
                    <span class="overview-card__value">${item.score} / 100</span>
                    <span class="overview-card__label">${item.date} — Вероятность: ${item.probability}%</span>
                </div>
            </div>
        `).join('');
    },

    initChat() {
        const form = document.getElementById('chatForm');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const input = document.getElementById('chatInput');
            const message = input.value.trim();
            if (!message) return;

            this.addChatMessage(message, 'user');
            input.value = '';

            const typingEl = this.addTypingIndicator();

            try {
                const data = await App.request('/chat/message', {
                    method: 'POST',
                    body: JSON.stringify({ message }),
                });

                typingEl.remove();
                this.addChatMessage(data.response, 'bot');
            } catch (error) {
                typingEl.remove();
                this.addChatMessage('Извините, произошла ошибка. Попробуйте позже.', 'bot');
            }
        });
    },

    addChatMessage(text, sender) {
        const container = document.getElementById('chatMessages');
        const div = document.createElement('div');
        div.className = `chat-message chat-message--${sender}`;
        div.innerHTML = `
            <div class="chat-message__avatar">${sender === 'bot' ? 'AI' : 'Вы'}</div>
            <div class="chat-message__bubble">${this.escapeHtml(text)}</div>
        `;
        container.appendChild(div);
        container.scrollTop = container.scrollHeight;
    },

    addTypingIndicator() {
        const container = document.getElementById('chatMessages');
        const div = document.createElement('div');
        div.className = 'chat-message chat-message--bot';
        div.innerHTML = `
            <div class="chat-message__avatar">AI</div>
            <div class="chat-message__bubble">
                <div class="typing-indicator"><span></span><span></span><span></span></div>
            </div>
        `;
        container.appendChild(div);
        container.scrollTop = container.scrollHeight;
        return div;
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    initProfile() {
        const form = document.getElementById('profileForm');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const payload = {
                name: document.getElementById('profileNameInput').value.trim(),
                phone: document.getElementById('profilePhone').value.trim(),
                city: document.getElementById('profileCity').value.trim(),
                birthdate: document.getElementById('profileBirthdate').value,
            };

            try {
                const data = await App.request('/users/me', {
                    method: 'PUT',
                    body: JSON.stringify(payload),
                });

                const user = JSON.parse(localStorage.getItem('user') || '{}');
                user.name = payload.name;
                user.phone = payload.phone;
                user.city = payload.city;
                user.birthdate = payload.birthdate;
                localStorage.setItem('user', JSON.stringify(user));
                this.loadUserData();

                alert('Профиль обновлён');
            } catch (error) {
                alert(error.message);
            }
        });
    },

    initLogout() {
        const btn = document.getElementById('logoutBtn');
        if (!btn) return;

        btn.addEventListener('click', () => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = 'login.html';
        });
    },
};

document.addEventListener('DOMContentLoaded', () => {
    Dashboard.init();
    Dashboard.renderHistory();
});

