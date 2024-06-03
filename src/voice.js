const sdk = require("microsoft-cognitiveservices-speech-sdk");
const fs = require('fs');
const play = require('play-sound')();

// Set your Azure subscription key and service region
const subscriptionKey = "6f78e68a9ef543988c4866e30d46bbae";
const serviceRegion = "japaneast";

// Set the speech synthesis config
const speechConfig = sdk.SpeechConfig.fromSubscription(subscriptionKey, serviceRegion);

// Set the synthesis voice and output format
const synthesisVoice = sdk.VoiceList.getDefaultVoice("en-US", sdk.VoiceType.Neural);
const synthesisOptions = {
    language: 'en-US',
    voice: synthesisVoice,
    format: sdk.AudioOutputFormat.Raw16Khz16BitMonoPcm
};

// Create the speech synthesizer
const synthesizer = new sdk.SpeechSynthesizer(speechConfig, null);

// Text to be synthesized
const text = "This is a test.";

// Synthesize the text
synthesizer.speakTextAsync(text, result => {
    if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
        console.log("Speech synthesized successfully.");
        // Play synthesized audio
        play.buffer(result.audioData);
    } else {
        console.error(`Error: ${result.errorDetails}`);
    }
});
