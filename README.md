
# Project IDE v1.0.0

## Created By

- **Elton Boehnen**
- **Email**: boehnenelton2024@gmail.com
- **GitHub**: [github.com/boehnenelton](https://github.com/boehnenelton)

---

## About This Application

Welcome to Project IDE!

This is a responsive web application designed for seamless interaction with the Gemini API for advanced code generation. It features:

- A **dual-panel staging area** to build and refine prompts with persistent context.
- A **multi-tab Monaco editor** for a complete development experience.
- A **robust project explorer** to manage your files and folders.
- A dedicated **document editor** with markdown support for project notes and documentation.
- **AI Profile Management** to switch between different AI personas and specializations.
- **Interaction History** to review and reuse past conversations with the AI.
- A **Downloads Manager** to save, version, and import your generated files directly back into your project.

This application is designed to create a fluid and powerful workflow, bridging the gap between AI-assisted coding and traditional development.

---

## Quickstart Workflow

Follow these steps to get started with the core workflow:

1.  **Set API Key**: Before you start, navigate to the **Gemini API** page and enter your Google Gemini API key.

2.  **Go to Staging**: Navigate to the **Staging** page using the sidebar. This is your command center for interacting with the AI.

3.  **Send a Query**: Choose an AI Profile, write your request in the "Prompt" editor (e.g., "create a simple React button component"), and click **Send to Gemini**.

4.  **Go to Downloads**: Once the AI responds, navigate to the **Downloads** page. You will see your newly generated file listed.

5.  **Import or Iterate**:
    *   **To Use the File**: Click the **Import** button to add the file directly into your project under the `downloads/` folder. It will open in the Editor, ready for use.
    *   **To Update the File**: Click the **Stage** button. This sends the file back to the Staging page's context. You can then write a new prompt to request changes (e.g., "add a red border to this button").

6.  **Download Your Project**: Once you are happy with your project, navigate back to the **Editor** page and click the **Download Project** button to save a ZIP file of all your work.
