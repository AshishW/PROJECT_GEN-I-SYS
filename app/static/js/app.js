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
let codeGenBuffer = '';
let currentSettings = {
    voice: 'Puck',
    persona: 'Friendly'
};

// Get DOM elements
const messageForm = document.getElementById("messageForm");
const messageInput = document.getElementById("message");
const messagesDiv = document.getElementById("messages");
let currentMessageId = null;

// Move template references to document ready and store them
let userMessageTemplate;
let botMessageTemplate;
let htmlEditor, cssEditor, jsEditor;

document.addEventListener('DOMContentLoaded', () => {
    // Get templates
    userMessageTemplate = document.getElementById('user-message-template');
    botMessageTemplate = document.getElementById('bot-message-template');

    // Initialize chat popup handlers
    const toggleChatPopupButton = document.getElementById('toggleChatPopupButton');
    const chatPopupOverlay = document.getElementById('chatPopupOverlay');
    
    if (toggleChatPopupButton && chatPopupOverlay) {
        toggleChatPopupButton.addEventListener('click', () => {
            chatPopupOverlay.classList.remove('hidden');
            playSound('uiInteract');
        });
    }

    // Add submit handler to form if it exists
    if (messageForm) {
        addSubmitHandler();
    }

    // Initialize CodeMirror editors
    htmlEditor = CodeMirror(document.getElementById('html-editor'), {
        mode: 'htmlmixed',
        theme: 'dracula',
        lineNumbers: true,
        autoCloseTags: true
    });

    cssEditor = CodeMirror(document.getElementById('css-editor'), {
        mode: 'css',
        theme: 'dracula',
        lineNumbers: true
    });

    jsEditor = CodeMirror(document.getElementById('js-editor'), {
        mode: 'javascript',
        theme: 'dracula',
        lineNumbers: true
    });

    // Handle editor tab switching
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', () => {
            // Toggle active state
            document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
            button.classList.add('active');
            
            // Show corresponding editor using 'hidden' class
            const tab = button.dataset.tab;
            document.getElementById('html-editor').classList.add('hidden');
            document.getElementById('css-editor').classList.add('hidden');
            document.getElementById('js-editor').classList.add('hidden');
            document.getElementById(`${tab}-editor`).classList.remove('hidden');

            // Refresh CodeMirror to fix rendering issues when switching tabs
            if (tab === 'html') htmlEditor.refresh();
            if (tab === 'css') cssEditor.refresh();
            if (tab === 'js') jsEditor.refresh();
        });
    });
});

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

    // Check for interrupt message first, this is high priority
    if (message_from_server.interrupted && message_from_server.interrupted === true) {
      if (audioPlayerNode) {
        audioPlayerNode.port.postMessage({ command: "endOfAudio" });
      }
      return;
    }

    // If it's audio, play it, regardless of mode
    if (message_from_server.mime_type == "audio/pcm" && audioPlayerNode) {
      audioPlayerNode.port.postMessage(base64ToArray(message_from_server.data));
      return; // Audio handled, no further processing needed for this chunk
    }

    // If in code generation mode, buffer the response until the turn is complete
    if (isCodeGenMode) {
        // On the first data chunk, create a "Generating..." message
        if (currentMessageId === null && message_from_server.data) {
            try {
                const botMessageElement = botMessageTemplate.content.cloneNode(true);
                const messageText = botMessageElement.querySelector('.typing-animation');
                if (!messageText) throw new Error('Message text element not found in bot template');

                currentMessageId = `codegen-${Math.random().toString(36).substring(7)}`;
                messageText.id = currentMessageId;
                messageText.textContent = 'Generating code...';
                messagesDiv.appendChild(botMessageElement);
                messagesDiv.scrollTop = messagesDiv.scrollHeight;
            } catch (error) {
                console.error('Error creating code-gen placeholder:', error);
                currentMessageId = null;
            }
        }

        if (message_from_server.data) {
            codeGenBuffer += message_from_server.data;
        }

        if (message_from_server.turn_complete && message_from_server.turn_complete === true) {
            const finalMessage = document.getElementById(currentMessageId);
            try {
                const extractedCode = extractCode(codeGenBuffer);

                // Check if any code was actually found
                const hasCode = extractedCode.html || extractedCode.css || extractedCode.js;

                if (hasCode) {
                    // Show code message and button
                    if (finalMessage) {
                        const messageContainer = finalMessage.parentElement;
                        finalMessage.classList.remove('typing-animation');
                        finalMessage.textContent = "I've generated the code for you. Click the button to view and run it.";

                        const viewCodeBtn = document.createElement('button');
                        viewCodeBtn.className = 'view-code-btn';
                        viewCodeBtn.innerHTML = `
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                      d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
                            </svg>
                            View Code
                        `;
                        viewCodeBtn.addEventListener('click', () => {
                            openCodeEditor(extractedCode);
                            runGeneratedCode(extractedCode);
                        });
                        messageContainer.appendChild(viewCodeBtn);
                        messagesDiv.scrollTop = messagesDiv.scrollHeight;
                    }
                } else {
                    // No code found, show as normal AI message (markdown)
                    if (finalMessage) {
                        finalMessage.classList.remove('typing-animation');
                        finalMessage.innerHTML = marked.parse(codeGenBuffer);
                    }
                }
            } catch (error) {
                if (finalMessage) {
                    finalMessage.textContent = 'Sorry, there was an error processing the response.';
                }
                console.error('Error handling code-gen response:', error);
            }
            // Reset buffer and state
            codeGenBuffer = '';
            currentMessageId = null;
        }
        return; // Stop further processing for code-gen messages
    }

    if (message_from_server.turn_complete && message_from_server.turn_complete == true) {
        currentMessageId = null;
        // Remove typing animation and format markdown when turn completes
        const lastMessage = document.querySelector('.typing-animation');
        if (lastMessage) {
            lastMessage.classList.remove('typing-animation');
            // Convert accumulated text to markdown
            lastMessage.innerHTML = marked.parse(lastMessage.textContent);
        }
        return;
    }

    // Handle text messages
    if (message_from_server.mime_type == "text/plain") {
        if (currentMessageId == null) {
            try {
                // Create new bot message using template
                const botMessageElement = botMessageTemplate.content.cloneNode(true);
                const messageText = botMessageElement.querySelector('.typing-animation');
                
                if (!messageText) {
                    throw new Error('Message text element not found in bot template');
                }

                currentMessageId = Math.random().toString(36).substring(7);
                messageText.id = currentMessageId;
                messageText.textContent = message_from_server.data;
                // Add View Code button if this is a code generation response
                if (message_from_server.code) {
                    const viewCodeBtn = document.createElement('button');
                    viewCodeBtn.className = 'view-code-btn';
                    viewCodeBtn.innerHTML = `
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                  d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
                        </svg>
                        View Code
                    `;
                    viewCodeBtn.addEventListener('click', () => openCodeEditor(message_from_server.code));
                    botMessageElement.querySelector('.message').appendChild(viewCodeBtn);
                }
                messagesDiv.appendChild(botMessageElement);
            } catch (error) {
                console.error('Error creating bot message:', error);
            }
        } else {
            // Append to existing message
            const messageText = document.getElementById(currentMessageId);
            if (messageText) {
                messageText.textContent += message_from_server.data;
            }
        }
        
        // Scroll to bottom
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    // Check for interrupt message
    if (message_from_server.interrupted && message_from_server.interrupted === true) {
      if (audioPlayerNode) {
        audioPlayerNode.port.postMessage({ command: "endOfAudio" });
      }
      return;
    }

    // If it's audio, play it
    if (message_from_server.mime_type == "audio/pcm" && audioPlayerNode) {
      audioPlayerNode.port.postMessage(base64ToArray(message_from_server.data));
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

// Update the addSubmitHandler function
function addSubmitHandler() {
    messageForm.onsubmit = function (e) {
        e.preventDefault();
        const message = messageInput.value;
        if (message) {
            try {
                if (!userMessageTemplate) {
                    throw new Error('User message template not initialized');
                }

                // Clone the template
                const userMessageElement = userMessageTemplate.content.cloneNode(true);
                const messageText = userMessageElement.querySelector('.text-cyan-100');
                
                if (!messageText) {
                    throw new Error('Message text element not found in template');
                }

                // Set the message text and append
                messageText.textContent = message;
                messagesDiv.appendChild(userMessageElement);
                messageInput.value = "";
                
                // Send to server
                sendMessage({
                  mime_type: "text/plain",
                  data: message,
                });
                
                // Scroll to bottom
                messagesDiv.scrollTop = messagesDiv.scrollHeight;
                
            } catch (error) {
                console.error('Error creating message:', error);
            }
        }
        return false;
    };
}

// Code generation mode
let isCodeGenMode = false;
const codeGenToggle = document.getElementById('codeGenToggle');
const codeEditorOverlay = document.getElementById('codeEditorOverlay');
let currentGeneratedCode = {html: '', css: '', js: ''};

codeGenToggle.addEventListener('click', () => {
    isCodeGenMode = !isCodeGenMode;
    codeGenToggle.classList.toggle('active');
    // Play toggle sound
    playSound('uiInteract');
});

// the sendMessage function to include code_gen flag
async function sendMessage(message) {
    try {
        const response = await fetch(send_url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...message,
                code_gen: isCodeGenMode
            })
        });
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

// Helper function to extract code from a markdown-formatted string
function extractCode(text) {
    const code = {
        html: '',
        css: '',
        js: '',
        cdnScripts: [],
        cdnStyles: [],
        headExtras: []
    };

    // Regex to find code blocks for html, css, and javascript
    const htmlRegex = /```html\s*([\s\S]*?)```/i;
    const cssRegex = /```css\s*([\s\S]*?)```/i;
    const jsRegex = /```(?:javascript|js)\s*([\s\S]*?)```/i;

    const htmlMatch = text.match(htmlRegex);
    if (htmlMatch && htmlMatch[1]) {
        let html = htmlMatch[1].trim();

        // Extract <head> content if present
        const headRegex = /<head[^>]*>([\s\S]*?)<\/head>/i;
        const headMatch = html.match(headRegex);
        let headContent = headMatch ? headMatch[1] : '';

        // Extract CDN <link> tags (ignore local files like style.css)
        const linkTagRegex = /<link\s+[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["'][^>]*>/gi;
        let linkMatch;
        while ((linkMatch = linkTagRegex.exec(headContent)) !== null) {
            const href = linkMatch[1];
            // Only include if it's a CDN or external (http/https), not local files
            if (/^https?:\/\//i.test(href)) {
                code.cdnStyles.push(href);
            }
        }

        // Extract <script src="..."> tags (ignore local files like script.js)
        const scriptSrcRegex = /<script\s+[^>]*src=["']([^"']+)["'][^>]*><\/script>/gi;
        let scriptMatch;
        while ((scriptMatch = scriptSrcRegex.exec(headContent)) !== null) {
            const src = scriptMatch[1];
            if (/^https?:\/\//i.test(src)) {
                code.cdnScripts.push(src);
            }
        }

        // Extract <link rel="preconnect"> and similar head extras (for fonts, etc)
        const headExtraRegex = /<link\s+[^>]*rel=["'](?:preconnect|dns-prefetch)["'][^>]*>/gi;
        let extraMatch;
        while ((extraMatch = headExtraRegex.exec(headContent)) !== null) {
            code.headExtras.push(extraMatch[0]);
        }

        // Remove all <link> and <script src> tags from html
        html = html.replace(linkTagRegex, '');
        html = html.replace(scriptSrcRegex, '');

        // Remove <link rel="preconnect"> and similar from html
        html = html.replace(headExtraRegex, '');

        // Extract <style>...</style> blocks and append to CSS
        const styleTagRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
        let styleMatch;
        while ((styleMatch = styleTagRegex.exec(html)) !== null) {
            code.css += '\n' + styleMatch[1].trim();
        }
        html = html.replace(styleTagRegex, '');

        // Extract <script>...</script> blocks and append to JS
        const scriptTagBlockRegex = /<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/gi;
        let scriptBlockMatch;
        while ((scriptBlockMatch = scriptTagBlockRegex.exec(html)) !== null) {
            code.js += '\n' + scriptBlockMatch[1].trim();
        }
        html = html.replace(scriptTagBlockRegex, '');

        // Extract body content if present, else use all
        const bodyRegex = /<body[^>]*>([\s\S]*?)<\/body>/i;
        const bodyMatch = html.match(bodyRegex);
        if (bodyMatch && bodyMatch[1]) {
            code.html = bodyMatch[1].trim();
        } else {
            // If no <body>, try to remove <html> and <head> and use the rest
            html = html.replace(/<html[^>]*>/gi, '')
                       .replace(/<\/html>/gi, '')
                       .replace(/<head[^>]*>[\s\S]*?<\/head>/gi, '');
            code.html = html.trim();
        }
    }

    // CSS code block
    const cssMatch = text.match(cssRegex);
    if (cssMatch && cssMatch[1]) {
        code.css += '\n' + cssMatch[1].trim();
    }

    // JS code block
    const jsMatch = text.match(jsRegex);
    if (jsMatch && jsMatch[1]) {
        code.js += '\n' + jsMatch[1].trim();
    }

    // Clean up whitespace
    code.html = code.html.trim();
    code.css = code.css.trim();
    code.js = code.js.trim();

    // Remove duplicates from cdnScripts, cdnStyles, headExtras
    code.cdnScripts = [...new Set(code.cdnScripts)];
    code.cdnStyles = [...new Set(code.cdnStyles)];
    code.headExtras = [...new Set(code.headExtras)];

    return code;
}

// Helper function to run the generated code in the iframe
function runGeneratedCode(code) {
    const iframe = document.getElementById('code-output-frame');
    // Build external styles and scripts
    const externalStyles = (code.cdnStyles || []).map(href =>
        `<link rel="stylesheet" href="${href}">`
    ).join('\n');
    const externalScripts = (code.cdnScripts || []).map(src =>
        `<script src="${src}"></script>`
    ).join('\n');
    const headExtras = (code.headExtras || []).join('\n');

    const content = `
        <!DOCTYPE html>
        <html>
        <head>
            ${headExtras}
            ${externalStyles}
            <style>${code.css || ''}</style>
        </head>
        <body>
            ${code.html || ''}
            <script>${code.js || ''}</script>
            ${externalScripts}
        </body>
        </html>
    `;
    iframe.srcdoc = content;
}

// Run code button handler
document.getElementById('runCodeBtn').addEventListener('click', () => {
    const code = {
        html: htmlEditor.getValue(),
        css: cssEditor.getValue(),
        js: jsEditor.getValue()
    };
    runGeneratedCode(code);
    playSound('uiInteract');
});

function openCodeEditor(code) {
    // Set code in editors
    htmlEditor.setValue(code.html || '');
    cssEditor.setValue(code.css || '');
    jsEditor.setValue(code.js || '');

    // Show HTML tab by default
    document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
    document.querySelector('.tab-button[data-tab="html"]').classList.add('active');
    document.getElementById('html-editor').classList.remove('hidden');
    document.getElementById('css-editor').classList.add('hidden');
    document.getElementById('js-editor').classList.add('hidden');

    // Refresh editors to fix rendering issues
    htmlEditor.refresh();
    cssEditor.refresh();
    jsEditor.refresh();

    // Show the code editor modal
    codeEditorOverlay.classList.remove('hidden');
    playSound('uiInteract');
}

// Close button handler for code editor modal
const closeCodeEditorBtn = document.getElementById('closeCodeEditorBtn');
if (closeCodeEditorBtn) {
    closeCodeEditorBtn.addEventListener('click', () => {
        codeEditorOverlay.classList.add('hidden');
        // Clear the code output iframe so new output can load properly
        document.getElementById('code-output-frame').srcdoc = '';
        playSound('uiInteract');
    });
}