document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const elements = {
        landingPage: document.getElementById('landing-page'),
        chatInterface: document.getElementById('chat-interface'),
        startBtn: document.getElementById('start-btn'),
        backBtn: document.getElementById('back-btn'),
        chatMessages: document.getElementById('chat-messages'),
        userInput: document.getElementById('user-input'),
        sendBtn: document.getElementById('send-btn'),
        typingIndicator: document.getElementById('typing-indicator')
    };

    // Configuration
    const config = {
        apiKey: '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',
        apiUrl: 'https://api.groq.com/openai/v1/chat/completions',
        model: 'llama3-70b-8192',
        maxHistory: 10
    };

    const VIBEZ_PROMPT = `You are VibeZ, a next-gen AI chatbot that communicates *exclusively* in Gen Z slang... [your full prompt here]`;

    // State
    const state = {
        conversation: [
            {
                role: "system",
                content: VIBEZ_PROMPT
            }
        ],
        isTyping: false
    };

    // Initialize
    initParticles();
    setupEventListeners();

    function initParticles() {
        if (typeof particlesJS !== 'undefined') {
            particlesJS('particles-js', {
                particles: {
                    number: { value: 80, density: { enable: true, value_area: 800 }},
                    color: { value: "#6c5ce7" },
                    shape: { type: "circle" },
                    opacity: { value: 0.5 },
                    size: { value: 3 },
                    line_linked: { enable: true, distance: 150, color: "#6c5ce7", opacity: 0.4, width: 1 },
                    move: { enable: true, speed: 2 }
                }
            });
        }
    }

    function setupEventListeners() {
        elements.startBtn.addEventListener('click', showChatInterface);
        elements.backBtn.addEventListener('click', showLandingPage);
        elements.sendBtn.addEventListener('click', processMessage);
        elements.userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') processMessage();
        });
    }

    function showChatInterface() {
        elements.landingPage.classList.add('hidden');
        elements.chatInterface.classList.remove('hidden');
        elements.chatInterface.classList.add('show');
        elements.userInput.focus();
        
        if (state.conversation.length === 1) {
            const welcomeMsg = "Yo fam! ✨ VibeZ here, ready to spill the tea and keep it 💯! What's the vibe today? 🔥";
            addMessage('assistant', welcomeMsg);
            state.conversation.push({
                role: "assistant",
                content: welcomeMsg
            });
        }
    }

    function showLandingPage() {
        elements.chatInterface.classList.remove('show');
        elements.chatInterface.classList.add('hidden');
        elements.landingPage.classList.remove('hidden');
    }

    async function processMessage() {
        if (state.isTyping) return;
        
        const message = elements.userInput.value.trim();
        if (!message) return;

        addMessage('user', message);
        elements.userInput.value = '';
        state.isTyping = true;
        elements.typingIndicator.classList.remove('hidden');

        try {
            state.conversation.push({
                role: "user",
                content: message
            });

            const response = await fetch(config.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${config.apiKey}`
                },
                body: JSON.stringify({
                    messages: state.conversation,
                    model: config.model,
                    temperature: 0.7,
                    max_tokens: 1024
                })
            });

            if (!response.ok) throw new Error(`API error: ${response.status}`);
            
            const data = await response.json();
            const botResponse = data.choices[0].message.content;
            
            addMessage('assistant', botResponse);
            state.conversation.push({
                role: "assistant",
                content: botResponse
            });

            if (state.conversation.length > config.maxHistory + 1) {
                state.conversation = [
                    state.conversation[0],
                    ...state.conversation.slice(-config.maxHistory)
                ];
            }
        } catch (error) {
            addMessage('assistant', "Oopsie! 💀 My brain glitched. Try again?");
            console.error('API Error:', error);
        } finally {
            state.isTyping = false;
            elements.typingIndicator.classList.add('hidden');
        }
    }

    function addMessage(role, content) {
        const container = document.createElement('div');
        container.className = `message-container ${role}-message-container`;
        
        const bubble = document.createElement('div');
        bubble.className = `message-bubble ${role}-message`;
        bubble.innerHTML = content.replace(/\*([^*]+)\*/g, '<strong>$1</strong>');
        container.appendChild(bubble);
        
        if (role === 'assistant') {
            const copyBtn = document.createElement('button');
            copyBtn.className = 'copy-btn';
            copyBtn.innerHTML = '<i class="far fa-copy"></i>';
            copyBtn.onclick = () => {
                navigator.clipboard.writeText(content)
                    .then(() => {
                        copyBtn.innerHTML = '<i class="fas fa-check"></i>';
                        setTimeout(() => {
                            copyBtn.innerHTML = '<i class="far fa-copy"></i>';
                        }, 2000);
                    });
            };
            container.appendChild(copyBtn);
        }
        
        elements.chatMessages.appendChild(container);
        scrollToBottom();
    }

    function scrollToBottom() {
        elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
    }
});
