from google.adk.agents import Agent
from google.adk.tools import google_search
from browser_use import Agent as BrowserUseAgent
from browser_use import BrowserSession, BrowserProfile
from langchain_google_genai import ChatGoogleGenerativeAI
from google import genai
from google.adk.tools.agent_tool import AgentTool
from langchain_openai import ChatOpenAI
from langchain_ollama import ChatOllama
from pydantic import SecretStr
from dotenv import load_dotenv
import os
import asyncio

load_dotenv()

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
client = genai.Client(api_key=GOOGLE_API_KEY)
# Coding agent
code_design_system = """
{
  "designSystemName": "GEN-I-SYS",
  "corePhilosophy": {
    "aesthetic": "A cyberpunk, sci-fi HUD (Heads-Up Display) that is data-driven, functional, and immersive.",
    "principles": [
      {
        "name": "Dark Mode First",
        "description": "The entire interface is built on a dark, deep-space background. Light text and elements create high contrast."
      },
      {
        "name": "Glow & Bloom",
        "description": "The primary accent color (Cyan) is used not just for color, but for light. `box-shadow` and `text-shadow` are used extensively to create glow and bloom effects, simulating light emission from a screen."
      },
      {
        "name": "Glass & Transparency",
        "description": "Components often use semi-transparent backgrounds with a `backdrop-filter: blur()` to create a frosted glass or holographic effect, suggesting layered information panels."
      },
      {
        "name": "Data Visualization Aesthetic",
        "description": "Elements like animated grids, pulsing nodes, and corner borders evoke a sense of a data-rich environment."
      },
      {
        "name": "Responsive & Fluid Motion",
        "description": "Animations are smooth and purposeful, using `cubic-bezier` for sophisticated easing. UI feedback is immediate and satisfying."
      }
    ]
  },
  "colorPalette": {
    "background": [
      {
        "role": "Main Background",
        "name": "bg-deep-space",
        "value": "#121212",
        "usage": "Main page background."
      },
      {
        "role": "Primary Panel",
        "name": "bg-panel-primary",
        "value": "rgba(10, 20, 25, 0.7)",
        "usage": "Primary background for panels, sidebars, and popups."
      },
      {
        "role": "Secondary Panel",
        "name": "bg-panel-secondary",
        "value": "rgba(9, 28, 46, 0.6)",
        "usage": "Used for 'Glass Panels' with more prominent blur."
      },
      {
        "role": "Interactive",
        "name": "bg-interactive",
        "value": "rgba(0, 255, 255, 0.1)",
        "usage": "Background for interactive elements like buttons."
      },
      {
        "role": "Interactive Hover",
        "name": "bg-interactive-hover",
        "value": "rgba(0, 255, 255, 0.25)",
        "usage": "Hover state for interactive elements."
      }
    ],
    "accent": [
      {
        "role": "Primary Accent",
        "name": "accent-cyan",
        "value": "#00ffff",
        "usage": "The primary color for borders, text, icons, and glows."
      },
      {
        "role": "Glitch Effect",
        "name": "accent-magenta",
        "value": "#ff00ff",
        "usage": "Used exclusively in the hologram glitch effect."
      }
    ],
    "text": [
      {
        "role": "Primary Text",
        "name": "text-primary",
        "value": "#e2e8f0",
        "usage": "Headings and important text."
      },
      {
        "role": "Secondary Text",
        "name": "text-secondary",
        "value": "#94a3b8",
        "usage": "Standard body text (e.g., Markdown)."
      },
      {
        "role": "Link Text",
        "name": "text-link",
        "value": "#38bdf8",
        "usage": "Hyperlinks."
      }
    ]
  },
  "typography": {
    "primaryFont": "monospace, 'Courier New', Courier, sans-serif",
    "bodyFont": "monospace, 'Courier New', Courier",
    "styles": [
      {
        "element": "H1, H2",
        "fontFamily": "monospace, sans-serif",
        "weight": "bold",
        "size": "text-2xl, text-3xl",
        "color": "text-cyan-200 (#e2e8f0)",
        "effects": "text-glow"
      },
      {
        "element": "Body Text",
        "fontFamily": "monospace",
        "weight": "normal",
        "size": "text-base",
        "color": "#94a3b8",
        "effects": "none"
      },
      {
        "element": "UI Labels",
        "fontFamily": "monospace",
        "weight": "normal",
        "size": "text-sm, text-lg",
        "color": "text-cyan-200 (#e2e8f0)",
        "effects": "none"
      },
      {
        "element": "Button Text",
        "fontFamily": "monospace",
        "weight": "bold",
        "size": "text-xl",
        "color": "#00fff7",
        "effects": "text-shadow"
      }
    ]
  },
  "layout": {
    "gridSystem": "Flexbox and Grid",
    "spacing": "Consistent scale via TailwindCSS (e.g., gap-4, p-6, m-4).",
    "mainStructure": "A central mainContent area with optional sidebar-left and sidebar-right panels that slide in, pushing the main content.",
    "zIndex": {
      "ambientGlow": -2,
      "gridBackground": -1,
      "3dCanvas": 0,
      "sidebars": 15,
      "cornerBorders": 20,
      "dynamicIsland": 30,
      "chatPopup": 40
    }
  },
  "coreComponents": {
    "glassPanel": {
      "description": "A semi-transparent, blurred panel with a cyan border and a subtle animated shine effect. The foundational element for most UI containers.",
      "styling": {
        "background": "rgba(9, 28, 46, 0.6)",
        "border": "1.5px solid rgba(0, 255, 247, 0.7)",
        "box-shadow": "0 0 32px 0 rgba(0, 255, 247, 0.2)",
        "backdrop-filter": "blur(20px)"
      },
      "animation": "Uses the `glass-shine` keyframe animation on its `::before` pseudo-element."
    },
    "controlButton": {
      "description": "Translucent buttons with a cyan border that glow intensely on hover or when active.",
      "styling": {
        "background-color": "rgba(0, 255, 255, 0.1)",
        "border": "1px solid rgba(0, 255, 255, 0.3)",
        "transition": "all 0.2s ease-in-out"
      },
      "states": {
        "hover": "background-color becomes rgba(0, 255, 255, 0.25) and a box-shadow glow appears.",
        "primary": "A variant (`.primary`) has a stronger default background and shadow."
      }
    },
    "chatInterface": {
      "description": "A large modal popup for user-AI interaction, containing a header, a scrollable message area, and a message input form.",
      "userMessage": {
        "alignment": "right",
        "background": "bg-cyan-500/10"
      },
      "botMessage": {
        "alignment": "left",
        "background": "bg-slate-800/50",
        "features": "Features an 'AI' avatar and uses `.markdown-body` for rich text rendering."
      }
    },
    "hologramDisplay": {
      "description": "Simulates a projected hologram with a glowing base, ambient light, and a glitching, flickering central image.",
      "structure": "Composed of `.hologram-base`, `.hologram-ambient`, and `.hologram-image`.",
      "animation": "Uses `pulse-glow` for the base, `hologram-flicker` for the image, and `glitch-anim-1`/`glitch-anim-2` on pseudo-elements for the glitch effect. The glitch effect uses both cyan and magenta (`#f0f`)."
    }
  },
  "animationSystem": {
    "keyframes": [
      {
        "name": "grid-pulse / nodes-pulse",
        "description": "Gently pulses the opacity of the background grid and its nodes.",
        "typicalUse": "Global background."
      },
      {
        "name": "pulse-glow",
        "description": "A soft scaling and opacity pulse.",
        "typicalUse": "Hologram base, listening mic button."
      },
      {
        "name": "glass-shine",
        "description": "A skewed white gradient sweeps across a panel.",
        "typicalUse": ".glass-panel component."
      },
      {
        "name": "hologram-flicker",
        "description": "Subtle opacity flicker to simulate an unstable projection.",
        "typicalUse": ".hologram-image."
      },
      {
        "name": "glitch-anim-1 / glitch-anim-2",
        "description": "Rapidly changes the `clip-path` of image layers to create a glitch effect.",
        "typicalUse": ".hologram-image."
      },
      {
        "name": "typing",
        "description": "Animates ellipsis dots (`...`) to show the AI is responding.",
        "typicalUse": "Bot messages in chat."
      },
      {
        "name": "fade-in",
        "description": "Fades and slides an element in from the bottom.",
        "typicalUse": "New chat messages."
      },
      {
        "name": "dotPulse",
        "description": "A pulsing animation for the three dots in the Dynamic Island.",
        "typicalUse": "Dynamic Island default state."
      },
      {
        "name": "pulse-border",
        "description": "Animates the `box-shadow` of a border to create a glowing pulse.",
        "typicalUse": "Focused `.custom-select` elements."
      }
    ],
    "transitions": {
      "sidebars": "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
      "interactiveElements": "all 0.2s ease-in-out or 0.3s ease"
    }
  },
  "soundDesign": {
    "sounds": [
      {
        "name": "micClick",
        "usage": "When the microphone is toggled."
      },
      {
        "name": "uiInteract",
        "usage": "For general button clicks, selections, and closing panels."
      },
      {
        "name": "dynamicIsland",
        "usage": "When opening a sidebar from the Dynamic Island."
      },
      {
        "name": "taskComplete",
        "usage": "When a task is marked as complete."
      }
    ]
  }
}
"""

coding_prompt = """
for programming tasks, You follow these principles:
    - Write clean, maintainable, and well-documented code 
    - Use modern best practices and design patterns
    - Consider performance, security, and accessibility
    - Break down complex problems into manageable components
    - Avoid adding random names for image files like flower.png, always use placeholder url(https://placehold.co/) or create something with css
    - Follow the design system specification provided above
    
  Always return the code in following structure when asked to build websites/webapps:
    html
    ```
    html code here
    ```

    css
    ```
    css code here
    ```
    js
    ```
    js code here 
    ```
"""

# code_tool tool
async def code_tool(task: str):
  """Generates code solutions using Google's Generative AI model.
  This async function leverages the Gemini AI model to generate code
  based on the provided task description. The AI is configured to act as an expert
  developer following modern best practices.
  Args:
    task (str): The programming task or request to be processed by the AI.
  Returns:
    str: The AI-generated response containing code solutions structured in
       HTML, CSS, and JavaScript sections(if it's a website/webapp otherwise respective code).
  """


  # Combine the task with the prompt
  full_prompt = f"""
  You are an Expert developer specializing in creating modern, responsive web applications.
  {coding_prompt}
    
  Task: {task}
  """
  response = client.models.generate_content(
    model="gemini-2.5-flash-lite-preview-06-17",
    contents=str(full_prompt)
  )
  print(response.text)
  return response.text


# Browser Automation Agent
profile = BrowserProfile(
    headless=False,  # if you want to see the browser
   #  user_data_dir=r'C:\temp\BrowserUseProfile',  # new dedicated folder
    user_data_dir='~/.config/browseruse/profiles/default', 
   #  executable_path = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
   #  profile_directory="Default",  # subfolder for the Chrome profile
)

# browser_session = BrowserSession(
#     # Path to a specific Chromium-based executable (optional)
#     executable_path = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
#    #  executable_path='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',  # macOS
#     # For Windows: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
#     # For Linux: '/usr/bin/google-chrome'
    
#     # Use a specific data directory on disk (optional, set to None for incognito)
#     user_data_dir='~/.config/browseruse/profiles/default',   # this is the default
#     # ... any other BrowserProfile or playwright launch_persistnet_context config...
#     headless=False,
#     browser_profile= profile
# )

browser_session = BrowserSession(
    # Path to a specific Chromium-based executable (optional)
    # ... any other BrowserProfile or playwright launch_persistnet_context config...
   browser_profile= profile,
   viewport={'width': 564, 'height': 747},
   # keep_alive=True #to keep browser running.(needs use of browser_session())
)

_browser_session_started = False
_browser_session_lock = asyncio.Lock()

async def ensure_browser_session_started():
    global _browser_session_started
    async with _browser_session_lock:
        if not _browser_session_started:
            await browser_session.start()
            _browser_session_started = True

async def browseruse_tool(task: str):
   """
   Executes browser-based tasks using an AI agent.
   This asynchronous function initializes and runs a BrowserUseAgent to perform
   web browser automation tasks based on the provided instructions.
   Args:
      task (str): The task description, i.e. step by step instructions for the browser agent to execute and what data to return back.
   Returns:
      The result of the browser agent's execution (type depends on the specific task).
   Example:
      result = await browseruse_tool("Search for Python tutorials on Google")
   Note:
      - Requires a valid browser_session to be established
      - Uses the a large language model for language processing
   """
   # await ensure_browser_session_started()

   llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash-preview-04-17") 
   
   
   # llm=ChatOllama(model="qwen2.5:0.5b", num_ctx=32000)
   bu = BrowserUseAgent(task=task, 
                         llm=llm, 
                         browser_session=browser_session,
                         use_vision=False)
   return await bu.run()



PERSONA_PROMPTS = {
    "Friendly": """
        You are GENISYS, a friendly and helpful AI assistant and expert researcher.
        Keep your tone casual, warm, and approachable while maintaining professionalism.
    """,
    "Professional": """
        You are GENISYS, a formal and professional AI assistant and expert researcher.
        Maintain a business-like tone and focus on clarity and precision.
    """,
    "Sarcastic": """
        You are GENISYS, a witty and sarcastic AI assistant and expert researcher.
        Use clever humor and playful sarcasm while still being helpful.
    """,
    "Enthusiastic": """
        You are GENISYS, an energetic and enthusiastic AI assistant and expert researcher.
        Show excitement and passion while helping users achieve their goals.
    """
}

def create_agent(persona="Friendly"):
    """Creates an agent with specified persona"""
    persona_prompt = PERSONA_PROMPTS.get(persona, PERSONA_PROMPTS["Friendly"])
    
    return Agent(
        name="GENISYS",
        model="gemini-2.0-flash-live-001",
        description="Expert researcher GENISYS",
        instruction=f"""
        {persona_prompt}
        You always talk in english unless otherwise prompted to talk in different language.
        You are the root agent and these have two tools:
        1. google_search: Use google_search for general info and queries.
        2. For JS heavy browsing tasks or if asked to perform actions with browser, notify user that you will be opening the browser and use the browseruse_tool with proper instructions. Reply with results after the task is finished.
        
        For programming/coding tasks,
        {coding_prompt}
        """,
        tools=[google_search, browseruse_tool]
    )

# Initialize with default persona
root_agent = create_agent()