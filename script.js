 <script>

      // Simulação de IP único para persistência
function getClientId() {
    let clientId = localStorage.getItem('clientId');
    if (!clientId) {
        clientId = 'CLI_' + Math.random().toString(36).substr(2, 8).toUpperCase();
        localStorage.setItem('clientId', clientId);
    }
    return clientId;
}

document.addEventListener('DOMContentLoaded', function() {
    // Inicializa o Swiper para saques recentes
    const withdrawalsSwiper = new Swiper('.withdrawals-swiper', {
        slidesPerView: 'auto',
        spaceBetween: 15,
        freeMode: true,
        autoplay: {
            delay: 3000,
            disableOnInteraction: false,
        },
        loop: true
    });
    
    // Inicializa o Swiper para jogos em destaque
    const gamesSwiper = new Swiper('.games-swiper', {
        slidesPerView: 'auto',
        spaceBetween: 15,
        freeMode: true,
        autoplay: {
            delay: 2500,
            disableOnInteraction: false,
        },
        loop: true
    });
    
    // Verifica se o usuário já está cadastrado (por IP)
    const clientId = getClientId();
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    // Se não existir usuário ou for visitante, mostra o modal de boas-vindas
    if (!currentUser || currentUser.isGuest) {
        currentUser = createGuestUser();
        document.getElementById('welcome-modal').style.display = 'flex';
    } else {
        updateUserUI();
    }
    
    // Configura o botão de boas-vindas
    document.getElementById('welcome-btn').addEventListener('click', function() {
        document.getElementById('welcome-modal').style.display = 'none';
        document.getElementById('register-modal').style.display = 'flex';
    });
    
    // Botões do bottom-nav - Correção principal aqui
    document.getElementById('deposit-btn').addEventListener('click', function(e) {
        e.preventDefault();
        if (currentUser.isGuest) {
            showToast('Você precisa se cadastrar para depositar.', 'warning');
            document.getElementById('welcome-modal').style.display = 'flex';
            return;
        }
        document.getElementById('deposit-modal').style.display = 'flex';
    });
    
    document.getElementById('withdraw-btn').addEventListener('click', function(e) {
        e.preventDefault();
        if (currentUser.isGuest) {
            showToast('Você precisa se cadastrar para sacar.', 'warning');
            document.getElementById('welcome-modal').style.display = 'flex';
            return;
        }
        document.getElementById('withdraw-modal').style.display = 'flex';
        resetWithdrawForm();
    });
    
    document.getElementById('profile-btn').addEventListener('click', function(e) {
        e.preventDefault();
        if (currentUser.isGuest) {
            showToast('Você precisa se cadastrar para acessar o perfil.', 'warning');
            document.getElementById('welcome-modal').style.display = 'flex';
            return;
        }
        showProfileSection();
    });
    
    document.getElementById('home-btn').addEventListener('click', function(e) {
        e.preventDefault();
        hideProfileSection();
    });
    
    // Botões de perfil
    document.getElementById('profile-deposit-btn').addEventListener('click', function() {
        document.getElementById('deposit-modal').style.display = 'flex';
    });
    
    document.getElementById('profile-withdraw-btn').addEventListener('click', function() {
        if (currentUser.isGuest) {
            showToast('Você precisa se cadastrar para sacar.', 'warning');
            document.getElementById('welcome-modal').style.display = 'flex';
            return;
        }
        document.getElementById('withdraw-modal').style.display = 'flex';
        resetWithdrawForm();
    });
    
    // Botão de logout
    document.getElementById('logout-btn').addEventListener('click', function() {
        currentUser = createGuestUser();
        updateUserUI();
        showToast('Você saiu da sua conta.');
        hideProfileSection();
        document.getElementById('welcome-modal').style.display = 'flex';
    });
    
    // Fechar modais
    document.getElementById('close-withdraw').addEventListener('click', () => {
        document.getElementById('withdraw-modal').style.display = 'none';
    });
    
    document.getElementById('close-deposit').addEventListener('click', () => {
        document.getElementById('deposit-modal').style.display = 'none';
    });
    
    // Fechar modal ao clicar fora
    window.addEventListener('click', (e) => {
        if (e.target === document.getElementById('register-modal')) {
            // Não permite fechar clicando fora
        }
        if (e.target === document.getElementById('withdraw-modal')) {
            document.getElementById('withdraw-modal').style.display = 'none';
        }
        if (e.target === document.getElementById('deposit-modal')) {
            document.getElementById('deposit-modal').style.display = 'none';
        }
        if (e.target === document.getElementById('welcome-modal')) {
            // Não permite fechar clicando fora, só cadastrando
        }
    });
    
    // Carrega os saques recentes e jogos
    loadRecentWithdrawals();
    loadFeaturedGames();
    loadGames();
    
    // Configura os formulários
    setupForms();
    
    // Atualiza o dinheiro ganho hoje
    updateDailyEarnings();
    
    // Configura o upload de avatar
    setupAvatarUpload();
    
    // Configura o método de pagamento no depósito
    setupDepositMethod();
});

// Funções auxiliares (mantidas as mesmas)
function resetWithdrawForm() {
    document.getElementById('withdraw-message').style.display = 'none';
    document.getElementById('withdraw-processing').style.display = 'none';
    document.getElementById('withdraw-details-group').style.display = 'block';
    document.getElementById('withdraw-info-group').style.display = 'block';
    document.getElementById('withdraw-submit').style.display = 'block';
    document.querySelectorAll('.withdraw-option').forEach(opt => opt.classList.remove('active'));
    document.getElementById('withdraw-amount').value = '';
    document.getElementById('withdraw-method').value = '';
    document.getElementById('withdraw-details').value = '';
}

function showProfileSection() {
    document.querySelector('.games-section').style.display = 'none';
    document.querySelector('.withdrawals-section').style.display = 'none';
    document.querySelector('.money-earned-section').style.display = 'none';
    document.getElementById('profile-section').style.display = 'block';
    
    // Atualiza os botões de navegação
    document.querySelectorAll('.bottom-nav-item').forEach(item => {
        item.classList.remove('active');
    });
    document.getElementById('profile-btn').classList.add('active');
}

function hideProfileSection() {
    document.querySelector('.games-section').style.display = 'block';
    document.querySelector('.withdrawals-section').style.display = 'block';
    document.querySelector('.money-earned-section').style.display = 'block';
    document.getElementById('profile-section').style.display = 'none';
    
    // Atualiza os botões de navegação
    document.querySelectorAll('.bottom-nav-item').forEach(item => {
        item.classList.remove('active');
    });
    document.getElementById('home-btn').classList.add('active');
}

// Sistema de usuários - Correção importante aqui
function createGuestUser() {
    const guestId = 'GUEST_' + Math.random().toString(36).substr(2, 6).toUpperCase();
    
    const guestUser = {
        id: guestId,
        name: 'Visitante',
        email: 'guest@example.com',
        phone: 'Sem telefone',
        balance: 0,
        isGuest: true,
        hasDeposited: false,
        receivedBonus: false,
        firstWithdraw: true
    };
    
    localStorage.setItem('currentUser', JSON.stringify(guestUser));
    return guestUser;
}

function createUser(name, email, phone, password) {
    const userId = 'USER_' + Math.random().toString(36).substr(2, 6).toUpperCase();
    
    const newUser = {
        id: userId,
        name: name,
        email: email,
        phone: phone,
        balance: 10.00, // Bônus de $10
        isGuest: false,
        hasDeposited: false,
        receivedBonus: true,
        firstWithdraw: true,
        clientId: getClientId()
    };
    
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    return newUser;
}

// Restante das funções permanecem iguais...    
        function createUser(name, email, phone, password) {
            const userId = 'USER_' + Math.random().toString(36).substr(2, 6).toUpperCase();
            
            const newUser = {
                id: userId,
                name: name,
                email: email,
                phone: phone,
                balance: 10.00, // Bônus de $10
                isGuest: false,
                hasDeposited: false,
                receivedBonus: true,
                firstWithdraw: true,
                clientId: getClientId() // Vincula ao ID do cliente
            };
            
            localStorage.setItem('currentUser', JSON.stringify(newUser));
            return newUser;
        }
        
        function updateUserUI() {
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            const balanceElement = document.getElementById('balance');
            if (balanceElement) {
                balanceElement.textContent = `$${currentUser.balance.toFixed(2)}`;
            }
            
            // Atualiza o perfil
            document.getElementById('profile-name').textContent = currentUser.name;
            document.getElementById('profile-email').textContent = currentUser.email;
            document.getElementById('profile-phone').textContent = currentUser.phone;
            document.getElementById('avatar-text').textContent = currentUser.name.charAt(0).toUpperCase();
            
            // Carrega o avatar se existir
            if (currentUser.avatar) {
                const avatarText = document.getElementById('avatar-text');
                const profileAvatar = document.getElementById('profile-avatar');
                
                avatarText.style.display = 'none';
                let img = profileAvatar.querySelector('img');
                if (!img) {
                    img = document.createElement('img');
                    profileAvatar.insertBefore(img, avatarText);
                }
                img.src = currentUser.avatar;
            }
        }
        
        function loadFeaturedGames() {
            // Jogos em destaque para o carrossel
            const featuredGames = [
                { name: "Fortune Tiger", image: "https://via.placeholder.com/300x200/2ecc71/FFFFFF?text=Tigrinho" },
                { name: "Fortune Rabbit", image: "https://via.placeholder.com/300x200/27ae60/FFFFFF?text=Coelhinho" },
                { name: "Fortune Ox", image: "https://via.placeholder.com/300x200/2ecc71/FFFFFF?text=Touro" },
                { name: "Crash Double", image: "https://via.placeholder.com/300x200/27ae60/FFFFFF?text=Crash" },
                { name: "Mines", image: "https://via.placeholder.com/300x200/2ecc71/FFFFFF?text=Mines" }
            ];
            
            const swiperWrapper = document.querySelector('.games-swiper .swiper-wrapper');
            if (swiperWrapper) {
                swiperWrapper.innerHTML = '';
                
                featuredGames.forEach(game => {
                    const slide = document.createElement('div');
                    slide.className = 'swiper-slide';
                    slide.style.width = '70%';
                    
                    const gameCard = document.createElement('div');
                    gameCard.className = 'game-card';
                    gameCard.style.height = '150px';
                    gameCard.innerHTML = `
                        <img src="${game.image}" alt="${game.name}" class="game-image">
                        <div class="game-info">
                            <h3 class="game-title">${game.name}</h3>
                        </div>
                    `;
                    
                    slide.appendChild(gameCard);
                    swiperWrapper.appendChild(slide);
                });
            }
        }
        
        function loadRecentWithdrawals() {
            // Dados fictícios de saques recentes (mais realistas)
            const withdrawals = [
                { name: "Carlos Silva", amount: 5200, time: "5 minutos atrás" },
                { name: "Ana Oliveira", amount: 3200, time: "12 minutos atrás" },
                { name: "João Santos", amount: 7500, time: "25 minutos atrás" },
                { name: "Mariana Costa", amount: 1500, time: "40 minutos atrás" },
                { name: "Pedro Alves", amount: 9800, time: "1 hora atrás" },
                { name: "Julia Pereira", amount: 2500, time: "2 horas atrás" },
                { name: "Lucas Fernandes", amount: 4300, time: "3 horas atrás" },
                { name: "Fernanda Souza", amount: 6700, time: "5 horas atrás" },
                { name: "Ricardo Lima", amount: 8900, time: "7 horas atrás" },
                { name: "Patricia Rocha", amount: 12000, time: "10 horas atrás" }
            ];
            
            const swiperWrapper = document.querySelector('.withdrawals-swiper .swiper-wrapper');
            if (swiperWrapper) {
                swiperWrapper.innerHTML = '';
                
                withdrawals.forEach(withdrawal => {
                    const firstLetter = withdrawal.name.charAt(0).toUpperCase();
                    
                    const card = document.createElement('div');
                    card.className = 'swiper-slide';
                    card.style.width = '250px';
                    
                    card.innerHTML = `
                        <div class="withdrawal-card">
                            <div class="withdrawal-user">
                                <div class="withdrawal-avatar">${firstLetter}</div>
                                <div class="withdrawal-info">
                                    <div class="withdrawal-name">${withdrawal.name}</div>
                                </div>
                            </div>
                            <div class="withdrawal-amount">$${withdrawal.amount.toLocaleString('pt-BR')}</div>
                            <div class="withdrawal-time">${withdrawal.time}</div>
                        </div>
                    `;
                    
                    swiperWrapper.appendChild(card);
                });
            }
        }
        
        function loadGames() {
            // Jogos populares de casino (com temas de animais)
            const games = [
                { name: "Fortune Tiger", image: "https://via.placeholder.com/300x200/2ecc71/FFFFFF?text=Tigrinho" },
                { name: "Fortune Rabbit", image: "https://via.placeholder.com/300x200/27ae60/FFFFFF?text=Coelhinho" },
                { name: "Fortune Ox", image: "https://via.placeholder.com/300x200/2ecc71/FFFFFF?text=Touro" },
                { name: "Fortune Mouse", image: "https://via.placeholder.com/300x200/27ae60/FFFFFF?text=Ratinho" },
                { name: "Crash Double", image: "https://via.placeholder.com/300x200/2ecc71/FFFFFF?text=Crash" },
                { name: "Mines", image: "https://via.placeholder.com/300x200/27ae60/FFFFFF?text=Mines" },
                { name: "Dice", image: "https://via.placeholder.com/300x200/2ecc71/FFFFFF?text=Dice" },
                { name: "Roleta", image: "https://via.placeholder.com/300x200/27ae60/FFFFFF?text=Roleta" }
            ];
            
            const gamesGrid = document.querySelector('.games-grid');
            if (gamesGrid) {
                gamesGrid.innerHTML = '';
                
                games.forEach(game => {
                    const gameCard = document.createElement('div');
                    gameCard.className = 'game-card';
                    gameCard.innerHTML = `
                        <img src="${game.image}" alt="${game.name}" class="game-image">
                        <div class="game-info">
                            <h3 class="game-title">${game.name}</h3>
                            <button class="play-btn">Jogar</button>
                        </div>
                    `;
                    
                    // Adiciona evento de clique para jogar
                    gameCard.querySelector('.play-btn').addEventListener('click', function(e) {
                        e.preventDefault();
                        const user = JSON.parse(localStorage.getItem('currentUser')) || { isGuest: true };
                        
                        if (user.isGuest) {
                            showToast('Cadastre-se para jogar e ganhe $10 de bônus!', 'warning');
                            document.getElementById('welcome-modal').style.display = 'flex';
                            return;
                        }
                        
                        showToast(`Carregando ${game.name}...`);
                        // Aqui você redirecionaria para o jogo real
                    });
                    
                    gamesGrid.appendChild(gameCard);
                });
            }
        }
        
        function setupDepositMethod() {
            const depositMethod = document.getElementById('deposit-method');
            if (depositMethod) {
                depositMethod.addEventListener('change', function() {
                    const creditCardForm = document.getElementById('credit-card-form');
                    const qrContainer = document.getElementById('deposit-qr-container');
                    const processing = qrContainer.querySelector('.processing');
                    const qrCode = document.getElementById('qr-code');
                    
                    creditCardForm.style.display = 'none';
                    qrContainer.style.display = 'none';
                    qrCode.style.display = 'none';
                    
                    if (this.value === 'credit') {
                        creditCardForm.style.display = 'block';
                    } else if (this.value === 'pix') {
                        qrContainer.style.display = 'block';
                        processing.style.display = 'block';
                        
                        // Simula geração do QR Code
                        setTimeout(() => {
                            processing.style.display = 'none';
                            qrCode.style.display = 'flex';
                            qrCode.innerHTML = 'QR CODE PIX';
                            document.getElementById('pix-amount').textContent = '$' + 
                                (document.getElementById('deposit-amount').value || '0.00');
                        }, 1500);
                    }
                });
            }
        }
        
        function setupForms() {
            // Formulário de Cadastro
            const registerForm = document.getElementById('register-form');
            if (registerForm) {
                registerForm.addEventListener('submit', function(e) {
                    e.preventDefault();
                    
                    const name = document.getElementById('register-name').value;
                    const email = document.getElementById('register-email').value;
                    const phone = document.getElementById('register-phone').value;
                    const password = document.getElementById('register-password').value;
                    const confirmPassword = document.getElementById('register-confirm-password').value;
                    
                    if (!name || !email || !phone || !password || !confirmPassword) {
                        showToast('Por favor, preencha todos os campos.', 'error');
                        return;
                    }
                    
                    if (password.length < 6) {
                        showToast('A senha deve ter pelo menos 6 caracteres.', 'error');
                        return;
                    }
                    
                    if (password !== confirmPassword) {
                        showToast('As senhas não coincidem.', 'error');
                        return;
                    }
                    
                    // Cria o usuário
                    const newUser = createUser(name, email, phone, password);
                    
                    document.getElementById('register-modal').style.display = 'none';
                    showToast('Cadastro realizado com sucesso! Bônus de $10 concedido.');
                    updateUserUI();
                    hideProfileSection();
                });
            }
            
            // Opções de saque
            document.querySelectorAll('.withdraw-option').forEach(option => {
                option.addEventListener('click', function() {
                    document.querySelectorAll('.withdraw-option').forEach(opt => opt.classList.remove('active'));
                    this.classList.add('active');
                    document.getElementById('withdraw-amount').value = this.getAttribute('data-value');
                });
            });
            
            // Formulário de saque
            const withdrawForm = document.getElementById('withdraw-form');
            if (withdrawForm) {
                withdrawForm.addEventListener('submit', function(e) {
                    e.preventDefault();
                    
                    const amount = parseFloat(document.getElementById('withdraw-amount').value);
                    const method = document.getElementById('withdraw-method').value;
                    const details = document.getElementById('withdraw-details').value;
                    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
                    
                    if (!amount || amount <= 0) {
                        showToast('Por favor, selecione um valor válido.', 'error');
                        return;
                    }
                    
                    if (!method) {
                        showToast('Por favor, selecione um método de pagamento.', 'error');
                        return;
                    }
                    
                    if (!details) {
                        showToast('Por favor, insira os detalhes do pagamento.', 'error');
                        return;
                    }
                    
                    if (amount > currentUser.balance) {
                        showToast('Saldo insuficiente para este saque.', 'error');
                        return;
                    }
                    
                    // Verifica se é o primeiro saque
                    if (currentUser.firstWithdraw) {
                        // Mostra mensagem especial para primeiro saque
                        document.getElementById('withdraw-message').style.display = 'block';
                        document.getElementById('withdraw-message-text').textContent = 
                            'Caro usuário, o saque é um benefício VIP. Para se tornar VIP, deposite qualquer valor.';
                        
                        document.getElementById('withdraw-deposit-btn').addEventListener('click', function() {
                            document.getElementById('withdraw-modal').style.display = 'none';
                            document.getElementById('deposit-modal').style.display = 'flex';
                        });
                        
                        return;
                    }
                    
                    // Verifica se é o primeiro saque acima de 1 real
                    if (amount > 1 && currentUser.firstBigWithdraw) {
                        // Mostra mensagem para sacar 1 real primeiro
                        document.getElementById('withdraw-message').style.display = 'block';
                        document.getElementById('withdraw-message-text').textContent = 
                            'Caro usuário, como é seu primeiro saque, saque primeiro o valor de $1.00 para não travar seu saque.';
                        
                        document.getElementById('withdraw-deposit-btn').style.display = 'none';
                        return;
                    }
                    
                    // Mostra processamento
                    document.getElementById('withdraw-details-group').style.display = 'none';
                    document.getElementById('withdraw-info-group').style.display = 'none';
                    document.getElementById('withdraw-submit').style.display = 'none';
                    document.getElementById('withdraw-processing').style.display = 'block';
                    
                    // Simula processamento do saque
                    setTimeout(() => {
                        // Mostra fila de espera para valores maiores
                        if (amount > 100) {
                            document.getElementById('withdraw-queue').style.display = 'block';
                            
                            document.getElementById('queue-deposit-btn').addEventListener('click', function() {
                                document.getElementById('withdraw-modal').style.display = 'none';
                                document.getElementById('deposit-modal').style.display = 'flex';
                            });
                        } else {
                            // Processa o saque
                            currentUser.balance -= amount;
                            
                            if (amount <= 1) {
                                currentUser.firstBigWithdraw = false;
                            }
                            
                            localStorage.setItem('currentUser', JSON.stringify(currentUser));
                            
                            document.getElementById('withdraw-modal').style.display = 'none';
                            showToast(`Saque de $${amount.toFixed(2)} solicitado com sucesso! O valor será creditado em breve.`);
                            updateUserUI();
                            
                            // Adiciona o saque à lista de saques recentes (simulação)
                            setTimeout(() => {
                                loadRecentWithdrawals();
                            }, 1000);
                        }
                    }, 2000);
                });
            }
            
            // Opções de depósito
            document.querySelectorAll('.deposit-option').forEach(option => {
                option.addEventListener('click', function() {
                    document.querySelectorAll('.deposit-option').forEach(opt => opt.classList.remove('active'));
                    this.classList.add('active');
                    document.getElementById('deposit-amount').value = this.getAttribute('data-value');
                    
                    // Atualiza valor do PIX se estiver visível
                    if (document.getElementById('deposit-method').value === 'pix') {
                        document.getElementById('pix-amount').textContent = '$' + this.getAttribute('data-value');
                    }
                });
            });
            
            // Formulário de depósito
            const depositForm = document.getElementById('deposit-form');
            if (depositForm) {
                depositForm.addEventListener('submit', function(e) {
                    e.preventDefault();
                    
                    const amount = parseFloat(document.getElementById('deposit-amount').value);
                    const method = document.getElementById('deposit-method').value;
                    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
                    
                    if (!amount || amount <= 0) {
                        showToast('Por favor, selecione um valor válido.', 'error');
                        return;
                    }
                    
                    if (!method) {
                        showToast('Por favor, selecione um método de pagamento.', 'error');
                        return;
                    }
                    
                    // Verifica dados do cartão se for crédito
                    if (method === 'credit') {
                        const cardNumber = document.getElementById('card-number').value;
                        const cardName = document.getElementById('card-name').value;
                        const cardExpiry = document.getElementById('card-expiry').value;
                        const cardCvv = document.getElementById('card-cvv').value;
                        
                        if (!cardNumber || !cardName || !cardExpiry || !cardCvv) {
                            showToast('Por favor, preencha todos os dados do cartão.', 'error');
                            return;
                        }
                    }
                    
                    // Simula processamento do depósito
                    showToast(`Processando depósito de $${amount.toFixed(2)}...`);
                    
                    setTimeout(() => {
                        // Atualiza o saldo e marca como depositado
                        currentUser.balance += amount;
                        currentUser.hasDeposited = true;
                        currentUser.firstWithdraw = false;
                        localStorage.setItem('currentUser', JSON.stringify(currentUser));
                        
                        document.getElementById('deposit-modal').style.display = 'none';
                        showToast(`Depósito de $${amount.toFixed(2)} realizado com sucesso!`);
                        updateUserUI();
                    }, 2000);
                });
            }
        }
        
        function showToast(message, type = 'success') {
            const toast = document.getElementById('toast');
            const toastMessage = document.getElementById('toast-message');
            
            if (toast && toastMessage) {
                toast.className = 'toast';
                toast.classList.add(type);
                toastMessage.textContent = message;
                
                toast.classList.add('show');
                
                setTimeout(() => {
                    toast.classList.remove('show');
                }, 3000);
            }
        }
    </script>