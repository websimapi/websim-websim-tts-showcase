# Websim Text-to-Speech Showcase

This project demonstrates the comprehensive capabilities of Websim's Text-to-Speech (TTS) functionality. It allows you to explore different voices, create speech from custom text, and even clone your own voice.

## Features

### Standard Voice Selection
- Try out 16 different voice options across 8 languages
- Listen to sample phrases in each voice
- Compare male and female voices in each language

### Custom Text-to-Speech
- Enter any text and hear it spoken in the selected voice
- Visualize the audio output with a dynamic waveform display

### Voice Cloning
- Record a short sample of your own voice (5 seconds)
- Have the AI clone your voice characteristics
- Hear custom text spoken in a voice that mimics your own

## How It Works

This showcase uses the `websim.textToSpeech()` method from the Websim AI Inference capabilities. The method accepts:
- `text`: The text to convert to speech
- `voice`: The voice to use (format: "language-gender")
- `voice_sample`: Optional sample for voice cloning

## Technical Details

- Built with vanilla JavaScript (no frameworks)
- Uses the Web Audio API for audio visualization
- Uses MediaRecorder API for voice recording
- Fully responsive design that works on mobile and desktop devices

## Browser Compatibility

This demo works best in Chrome, Firefox, and Edge. Voice recording functionality requires microphone access permission from your browser.

---
Powered by Websim AI Inference