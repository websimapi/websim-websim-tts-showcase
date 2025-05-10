// Available voice options
const VOICES = [
    { id: 'en-male', label: 'English (Male)', sample: 'Hello! This is the English male voice.' },
    { id: 'en-female', label: 'English (Female)', sample: 'Hello! This is the English female voice.' },
    { id: 'es-male', label: 'Spanish (Male)', sample: '¡Hola! Esta es la voz masculina en español.' },
    { id: 'es-female', label: 'Spanish (Female)', sample: '¡Hola! Esta es la voz femenina en español.' },
    { id: 'fr-male', label: 'French (Male)', sample: 'Bonjour! C\'est la voix masculine française.' },
    { id: 'fr-female', label: 'French (Female)', sample: 'Bonjour! C\'est la voix féminine française.' },
    { id: 'de-male', label: 'German (Male)', sample: 'Hallo! Dies ist die deutsche männliche Stimme.' },
    { id: 'de-female', label: 'German (Female)', sample: 'Hallo! Dies ist die deutsche weibliche Stimme.' },
    { id: 'it-male', label: 'Italian (Male)', sample: 'Ciao! Questa è la voce maschile italiana.' },
    { id: 'it-female', label: 'Italian (Female)', sample: 'Ciao! Questa è la voce femminile italiana.' },
    { id: 'pt-male', label: 'Portuguese (Male)', sample: 'Olá! Esta é a voz masculina em português.' },
    { id: 'pt-female', label: 'Portuguese (Female)', sample: 'Olá! Esta é a voz feminina em português.' },
    { id: 'ru-male', label: 'Russian (Male)', sample: 'Привет! Это мужской голос на русском языке.' },
    { id: 'ru-female', label: 'Russian (Female)', sample: 'Привет! Это женский голос на русском языке.' },
    { id: 'zh-male', label: 'Chinese (Male)', sample: '你好！这是中文男声。' },
    { id: 'zh-female', label: 'Chinese (Female)', sample: '你好！这是中文女声。' }
];

// DOM Elements
const elements = {
    voiceGrid: document.querySelector('.voice-grid'),
    voiceSelect: document.getElementById('voice-select'),
    customTextInput: document.getElementById('custom-text-input'),
    speakButton: document.getElementById('speak-button'),
    loadingIndicator: document.getElementById('loading-indicator'),
    mainAudio: document.getElementById('main-audio'),
    audioVisualizer: document.getElementById('audio-visualizer'),
    recordButton: document.getElementById('record-button'),
    recordingTimer: document.getElementById('recording-timer'),
    recordingTimerValue: document.querySelector('#recording-timer span'),
    sampleContainer: document.getElementById('sample-container'),
    sampleAudio: document.getElementById('sample-audio'),
    cloneTextInput: document.getElementById('clone-text-input'),
    cloneButton: document.getElementById('clone-button'),
    cloneResult: document.getElementById('clone-result'),
    cloneAudio: document.getElementById('clone-audio')
};

// State
let state = {
    selectedVoice: 'en-female',
    isRecording: false,
    recorder: null,
    audioContext: null,
    analyser: null,
    mediaStream: null,
    recordedBlob: null,
    animationFrame: null
};

// Initialize the application
function init() {
    populateVoiceGrid();
    populateVoiceSelect();
    setupEventListeners();
    setupAudioContext();
}

// Populate the voice grid with sample cards
function populateVoiceGrid() {
    VOICES.forEach(voice => {
        const card = document.createElement('div');
        card.className = 'voice-card';
        card.dataset.voice = voice.id;
        if (voice.id === state.selectedVoice) {
            card.classList.add('active');
        }
        
        card.innerHTML = `
            <div class="voice-name">${voice.label}</div>
            <button class="play-sample">▶ Play</button>
        `;
        
        elements.voiceGrid.appendChild(card);
    });
}

// Populate the voice selection dropdown
function populateVoiceSelect() {
    VOICES.forEach(voice => {
        const option = document.createElement('option');
        option.value = voice.id;
        option.textContent = voice.label;
        if (voice.id === state.selectedVoice) {
            option.selected = true;
        }
        elements.voiceSelect.appendChild(option);
    });
}

// Set up event listeners
function setupEventListeners() {
    // Voice grid card clicks
    elements.voiceGrid.addEventListener('click', async e => {
        const card = e.target.closest('.voice-card');
        if (!card) return;
        
        const voice = card.dataset.voice;
        const playButton = e.target.closest('.play-sample');
        
        if (playButton) {
            // Play the sample for this voice
            const voiceData = VOICES.find(v => v.id === voice);
            if (voiceData) {
                await generateAndPlaySpeech(voiceData.sample, voice);
            }
        } else {
            // Select this voice
            document.querySelectorAll('.voice-card.active').forEach(el => {
                el.classList.remove('active');
            });
            card.classList.add('active');
            state.selectedVoice = voice;
            elements.voiceSelect.value = voice;
        }
    });
    
    // Voice selection change
    elements.voiceSelect.addEventListener('change', e => {
        state.selectedVoice = e.target.value;
        document.querySelectorAll('.voice-card.active').forEach(el => {
            el.classList.remove('active');
        });
        const activeCard = document.querySelector(`.voice-card[data-voice="${state.selectedVoice}"]`);
        if (activeCard) {
            activeCard.classList.add('active');
        }
    });
    
    // Speak button click
    elements.speakButton.addEventListener('click', async () => {
        const text = elements.customTextInput.value.trim();
        if (text) {
            await generateAndPlaySpeech(text, state.selectedVoice);
        }
    });
    
    // Record button click
    elements.recordButton.addEventListener('click', () => {
        if (state.isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    });
    
    // Clone button click
    elements.cloneButton.addEventListener('click', async () => {
        const text = elements.cloneTextInput.value.trim();
        if (text && state.recordedBlob) {
            await cloneVoice(text);
        }
    });
}

// Generate speech using the TTS API and play it
async function generateAndPlaySpeech(text, voice) {
    try {
        elements.loadingIndicator.classList.remove('hidden');
        elements.speakButton.disabled = true;
        
        const result = await websim.textToSpeech({
            text: text,
            voice: voice
        });
        
        elements.mainAudio.src = result.url;
        elements.mainAudio.play();
        visualizeAudio();
    } catch (error) {
        console.error('Error generating speech:', error);
        alert('Failed to generate speech. Please try again.');
    } finally {
        elements.loadingIndicator.classList.add('hidden');
        elements.speakButton.disabled = false;
    }
}

// Set up the audio context for visualization
function setupAudioContext() {
    try {
        state.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        state.analyser = state.audioContext.createAnalyser();
        state.analyser.fftSize = 256;
        
        const audioSource = state.audioContext.createMediaElementSource(elements.mainAudio);
        audioSource.connect(state.analyser);
        state.analyser.connect(state.audioContext.destination);
    } catch (error) {
        console.error('Audio context could not be created:', error);
    }
}

// Visualize the audio output
function visualizeAudio() {
    const canvas = elements.audioVisualizer;
    const canvasContext = canvas.getContext('2d');
    
    // Set canvas dimensions
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    const bufferLength = state.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);
    
    function draw() {
        state.animationFrame = requestAnimationFrame(draw);
        
        state.analyser.getByteFrequencyData(dataArray);
        
        canvasContext.fillStyle = '#f8fafc';
        canvasContext.fillRect(0, 0, canvas.width, canvas.height);
        
        const barWidth = (canvas.width / bufferLength) * 2.5;
        let barHeight;
        let x = 0;
        
        for (let i = 0; i < bufferLength; i++) {
            barHeight = dataArray[i] / 2;
            
            const gradient = canvasContext.createLinearGradient(
                0, canvas.height - barHeight, 0, canvas.height
            );
            gradient.addColorStop(0, '#2563eb');
            gradient.addColorStop(1, '#bfdbfe');
            
            canvasContext.fillStyle = gradient;
            canvasContext.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
            
            x += barWidth + 1;
        }
    }
    
    if (state.animationFrame) {
        cancelAnimationFrame(state.animationFrame);
    }
    
    draw();
}

// Start recording audio for voice cloning
async function startRecording() {
    try {
        state.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        state.recorder = new MediaRecorder(state.mediaStream);
        
        const chunks = [];
        
        state.recorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
                chunks.push(e.data);
            }
        };
        
        state.recorder.onstop = () => {
            state.recordedBlob = new Blob(chunks, { type: 'audio/wav' });
            const audioURL = URL.createObjectURL(state.recordedBlob);
            elements.sampleAudio.src = audioURL;
            elements.sampleContainer.classList.remove('hidden');
            elements.cloneButton.disabled = false;
            
            // Reset UI
            elements.recordButton.textContent = 'Record Sample (5s)';
            elements.recordButton.classList.remove('recording');
            elements.recordingTimer.classList.add('hidden');
        };
        
        // Start recording
        state.recorder.start();
        state.isRecording = true;
        
        // Update UI
        elements.recordButton.textContent = 'Stop Recording';
        elements.recordButton.classList.add('recording');
        elements.recordingTimer.classList.remove('hidden');
        
        // Set a timer for 5 seconds
        let timeLeft = 5;
        elements.recordingTimerValue.textContent = timeLeft;
        
        const timerInterval = setInterval(() => {
            timeLeft--;
            elements.recordingTimerValue.textContent = timeLeft;
            
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                if (state.isRecording) {
                    stopRecording();
                }
            }
        }, 1000);
        
    } catch (error) {
        console.error('Error starting recording:', error);
        alert('Failed to access microphone. Please make sure you have granted permission.');
    }
}

// Stop recording audio
function stopRecording() {
    if (state.recorder && state.isRecording) {
        state.recorder.stop();
        state.isRecording = false;
        
        if (state.mediaStream) {
            state.mediaStream.getTracks().forEach(track => track.stop());
        }
    }
}

// Clone voice using the recorded sample
async function cloneVoice(text) {
    try {
        elements.cloneButton.disabled = true;
        elements.cloneButton.textContent = 'Generating...';
        
        // Convert Blob to File
        const sampleFile = new File([state.recordedBlob], 'voice_sample.wav', {
            type: 'audio/wav'
        });
        
        // Create a temporary URL for the sample file
        const sampleURL = URL.createObjectURL(sampleFile);
        
        // Call TTS with voice sample
        const result = await websim.textToSpeech({
            text: text,
            voice_sample: sampleURL
        });
        
        // Display the result
        elements.cloneAudio.src = result.url;
        elements.cloneResult.classList.remove('hidden');
        elements.cloneAudio.play();
        
    } catch (error) {
        console.error('Error cloning voice:', error);
        alert('Failed to clone voice. Please try again.');
    } finally {
        elements.cloneButton.disabled = false;
        elements.cloneButton.textContent = 'Generate Cloned Speech';
    }
}

// Initialize the app when the document is loaded
document.addEventListener('DOMContentLoaded', init);