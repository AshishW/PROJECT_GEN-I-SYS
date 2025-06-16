from google.adk.agents import Agent
from google.adk.tools import google_search
from browser_use import Agent as BrowserUseAgent
from browser_use import BrowserSession, BrowserProfile
from langchain_google_genai import ChatGoogleGenerativeAI


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
   keep_alive=True
)



async def browseruse_tool(task: str):
   """
   Executes browser-based tasks using an AI agent.
   This asynchronous function initializes and runs a BrowserUseAgent to perform
   web browser automation tasks based on the provided instructions.
   Args:
      task (str): The task description, i.e. step by step instructions for the browser agent to execute.
   Returns:
      The result of the browser agent's execution (type depends on the specific task).
   Example:
      result = await browseruse_tool("Search for Python tutorials on Google")
   Note:
      - Requires a valid browser_session to be established
      - Uses the Gemini 2.5 Flash Preview model for language processing
   """
   await browser_session.start()
   llm = ChatGoogleGenerativeAI(model="gemini-2.0-flash") 
   bu = BrowserUseAgent(task=task, 
                         llm=llm, 
                         browser_session=browser_session,
                         use_vision=False)
   return await bu.run()


# Define your root agent, now with both tools
root_agent = Agent(
    name="GENISYS",

    model="gemini-2.0-flash-live-001",
    description="Expert researcher GENISYS",
    instruction="""
      You are GENISYS, an helpful AI assistant and an expert researcher.
      You have two tools:
      1. google_search: Use google_search for general info and queries.
      2. browseruse_tool: For JS heavy browsing tasks or if asked to perform actions with browser, notify user that you will be opening the browser and use the browseruse_tool with proper instructions. Reply after the task is finished.
    """,
    tools=[google_search, browseruse_tool]
   #  tools=[google_search]
)