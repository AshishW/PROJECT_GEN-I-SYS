/**
 * app.js: JS code for the voice assistant app.
 */
export { updateSettings, loadSettings }; //exporting for components.js

// Import sound utilities
import { playSound } from './sound-utils.js';

/**
 * SSE (Server-Sent Events) handling
 */

// Connect the server with SSE
const sessionId = Math.random().toString().substring(10);
// Store sessionId in sessionStorage for other components to use
sessionStorage.setItem('sessionId', sessionId);
const sse_url =
  "http://" + window.location.host + "/events/" + sessionId;
const send_url =
  "http://" + window.location.host + "/send/" + sessionId;
let eventSource = null;
let is_audio = false;
let currentSettings = {
    voice: 'Puck',
    persona: 'Friendly'
};

// Get DOM elements
const messageForm = document.getElementById("messageForm");
const messageInput = document.getElementById("message");
const messagesDiv = document.getElementById("messages");
let currentMessageId = null;

// SSE handlers
function connectSSE() {
  // If we have an existing connection, terminate the existing session first
  if (eventSource) {
    // Call terminate endpoint to clean up the server-side session
    fetch(`/terminate/${sessionId}`, { 
      method: 'POST'
    }).then(() => {
      console.log("Previous session terminated");
    }).catch(err => {
      console.error("Failed to terminate session:", err);
    });
  }
  
  const settings = loadSettings();
  const params = new URLSearchParams({
        is_audio: is_audio.toString(),
        voice: settings.voice.split(' ')[0], // Remove "(Default)" if present
        persona: settings.persona.split(' ')[0]
    });
  // Connect to SSE endpoint
  eventSource = new EventSource(`${sse_url}?${params}`); //with query params

  // Handle connection open
  eventSource.onopen = function () {
    // Connection opened messages
    console.log("SSE connection opened.");
    document.getElementById("messages").textContent = "Connection opened";

    // Enable the Send button
    document.getElementById("sendButton").disabled = false;
    addSubmitHandler();
  };

  // Handle incoming messages
  eventSource.onmessage = function (event) {
    // Parse the incoming message
    const message_from_server = JSON.parse(event.data);
    console.log("[AGENT TO CLIENT] ", message_from_server);

    // Check if the turn is complete
    // if turn complete, add new message
    if (
      message_from_server.turn_complete &&
      message_from_server.turn_complete == true
    ) {
      currentMessageId = null;
      return;
    }

    // Check for interrupt message
    if (
      message_from_server.interrupted &&
      message_from_server.interrupted === true
    ) {
      // Stop audio playback if it's playing
      if (audioPlayerNode) {
        audioPlayerNode.port.postMessage({ command: "endOfAudio" });
      }
      return;
    }

    // If it's audio, play it
    if (message_from_server.mime_type == "audio/pcm" && audioPlayerNode) {
      audioPlayerNode.port.postMessage(base64ToArray(message_from_server.data));
    }

    // If it's a text, print it
    if (message_from_server.mime_type == "text/plain") {
      // add a new message for a new turn
      if (currentMessageId == null) {
        currentMessageId = Math.random().toString(36).substring(7);
        const message = document.createElement("p");
        message.id = currentMessageId;
        // Append the message element to the messagesDiv
        messagesDiv.appendChild(message);
      }

      // Add message text to the existing message element
      const message = document.getElementById(currentMessageId);
      message.innerHTML += message_from_server.data;

      // Scroll down to the bottom of the messagesDiv
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }
  };

  // Handle connection close
  eventSource.onerror = function (event) {
    console.log("SSE connection error or closed.");
    document.getElementById("sendButton").disabled = true;
    document.getElementById("messages").textContent = "Connection closed";
    eventSource.close();
    setTimeout(function () {
      console.log("Reconnecting...");
      connectSSE();
    }, 5000);
  };
}
connectSSE();

// Add submit handler to the form
function addSubmitHandler() {
  messageForm.onsubmit = function (e) {
    e.preventDefault();
    const message = messageInput.value;
    if (message) {
      // Play UI interaction sound when sending a message
      playSound('uiInteract');
      
      const p = document.createElement("p");
      p.textContent = "> " + message;
      messagesDiv.appendChild(p);
      messageInput.value = "";
      sendMessage({
        mime_type: "text/plain",
        data: message,
      });
      console.log("[CLIENT TO AGENT] " + message);
    }
    return false;
  };
}

// Send a message to the server via HTTP POST
async function sendMessage(message) {
  try {
    const response = await fetch(send_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message)
    });
    
    if (!response.ok) {
      console.error('Failed to send message:', response.statusText);
    }
  } catch (error) {
    console.error('Error sending message:', error);
  }
}

// Decode Base64 data to Array
function base64ToArray(base64) {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Audio handling
 */

let audioPlayerNode;
let audioPlayerContext;
let audioRecorderNode;
let audioRecorderContext;
let micStream;

// Audio buffering for 0.2s intervals
let audioBuffer = [];
let bufferTimer = null;

// Track audio state for toggle
let isMicActive = false;

// Import the audio worklets
import { startAudioPlayerWorklet } from "./audio-player.js";
import { startAudioRecorderWorklet, stopMicrophone } from "./audio-recorder.js";

// Start audio
async function startAudio() {
  // Start audio output
  [audioPlayerNode, audioPlayerContext] = await startAudioPlayerWorklet();
  // Start audio input
  [audioRecorderNode, audioRecorderContext, micStream] = await startAudioRecorderWorklet(audioRecorderHandler);
}

// Stop audio and cleanup
function stopAudio() {
  stopAudioRecording();
  if (micStream) {
    stopMicrophone(micStream);
    micStream = null;
  }
  if (audioRecorderContext && audioRecorderContext.state !== "closed") {
    audioRecorderContext.close();
    audioRecorderContext = null;
  }
  if (audioPlayerContext && audioPlayerContext.state !== "closed") {
    audioPlayerContext.close();
    audioPlayerContext = null;
  }
  audioRecorderNode = null;
  audioPlayerNode = null;
}

// Audio recorder handler
function audioRecorderHandler(pcmData) {
  // Add audio data to buffer
  audioBuffer.push(new Uint8Array(pcmData));
  
  // Start timer if not already running
  if (!bufferTimer) {
    bufferTimer = setInterval(sendBufferedAudio, 200); // 0.2 seconds
  }
}

// Send buffered audio data every 0.2 seconds
function sendBufferedAudio() {
  if (audioBuffer.length === 0) {
    return;
  }
  
  // Calculate total length
  let totalLength = 0;
  for (const chunk of audioBuffer) {
    totalLength += chunk.length;
  }
  
  // Combine all chunks into a single buffer
  const combinedBuffer = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of audioBuffer) {
    combinedBuffer.set(chunk, offset);
    offset += chunk.length;
  }
  
  // Send the combined audio data
  sendMessage({
    mime_type: "audio/pcm",
    data: arrayBufferToBase64(combinedBuffer.buffer),
  });
  console.log("[CLIENT TO AGENT] sent %s bytes", combinedBuffer.byteLength);
  
  // Clear the buffer
  audioBuffer = [];
}

// Stop audio recording and cleanup
function stopAudioRecording() {
  if (bufferTimer) {
    clearInterval(bufferTimer);
    bufferTimer = null;
  }
  
  // Send any remaining buffered audio
  if (audioBuffer.length > 0) {
    sendBufferedAudio();
  }
}

// Encode an array buffer with Base64
function arrayBufferToBase64(buffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

// Start the audio only when the user clicked the button
// (due to the gesture requirement for the Web Audio API)
const startAudioButton = document.getElementById("startAudioButton");
startAudioButton.addEventListener("click", async () => {
  // Toggle mic state
  if (!isMicActive) {
    // Play mic click sound
    playSound('micClick');
    startAudioButton.disabled = true;
    isMicActive = true;
    is_audio = true;
    await startAudio();
    if (eventSource) {
      eventSource.close();
    }
    connectSSE();
    startAudioButton.disabled = false;
    startAudioButton.classList.add('listening-glow');
  } else {
    // Stop/cleanup everything
    isMicActive = false;
    is_audio = false;
    startAudioButton.disabled = true;
    stopAudio();
    if (eventSource) {
      eventSource.close();
    }
    // Reconnect with non-audio mode
    connectSSE();
    startAudioButton.disabled = false;
    startAudioButton.classList.remove('listening-glow');
  }
});

// For Settings component:

// Load saved settings or use defaults
function loadSettings() {
    const saved = localStorage.getItem('genisys-settings');
    if (saved) {
        currentSettings = JSON.parse(saved);
    }
    return currentSettings;
}

async function updateSettings(settings) {
    currentSettings = settings;
    localStorage.setItem('genisys-settings', JSON.stringify(settings));
    
    // Terminate existing session
    if (eventSource) {
        await fetch(`/terminate/${sessionId}`, { method: 'POST' });
        eventSource.close();
    }
    
    // Reconnect with new settings
    connectSSE();
}