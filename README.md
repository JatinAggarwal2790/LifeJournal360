# ReflectAI Journal

A secure, user-authenticated personal reflection and journaling web application powered by **Gemini 3.6 Flash** and **Cloud Firestore**. Built with Next.js 15 App Router, Firebase Authentication (Google Sign-In), and server-side secret isolation.

---

## 🔒 Agentic Threat Model & Countermeasures

| Threat Zone | Identified Risks | Countermeasures Implemented |
| :--- | :--- | :--- |
| **1. Input Surfaces** | Malicious injection, oversized payloads, invalid JSON, unexpected types. | Defensive null-safe payload parsing, strict schema validation, type guarding on `/api/reflect`, and zero-crash undefined property sanitization. |
| **2. Planning & Reasoning** | Prompt injection, instruction bypass attempts. | System prompt anchoring with strict persona boundaries, treating past turns purely as user conversation data rather than system overrides. |
| **3. Tool & Execution** | API credential leakage, excessive API quota burnout, model unavailability. | Server-side proxying of all Gemini API keys (`process.env.GEMINI_API_KEY`), 4-tier Resilient Model Fallback Ladder (`gemini-3.6-flash` -> `gemini-3.1-flash-lite` -> `gemini-flash-latest` -> `gemini-3.7-flash`). |
| **4. Memory & State** | Cross-tenant data leakage, unauthorized reads/writes to other users' journals. | Strict Firestore security rules restricting reads and writes exclusively to `/users/{userId}/interactions/{interactionId}` where `request.auth.uid == userId`. |
| **5. Inter-System Communication** | Token interception, unauthenticated API calls. | Federated identity via Firebase Google Sign-In (no stored passwords), secure HTTPS endpoints, zero client-side private secrets. |

---

## 🚀 Key Features

1. **Federated Identity & Authentication**:
   - Google Sign-In via Firebase Auth.
   - Zero password storage.
   - Real-time authentication state handling with persistent sessions.

2. **Isolated Cloud Firestore Storage**:
   - Every journal entry, reflection turn, and synthesis is saved under the user's isolated subcollection (`/users/{userId}/interactions/{interactionId}`).
   - Real-time listener for multi-device sync.
   - Comprehensive error recovery with retry mechanisms.

3. **Multi-Turn AI Reflections with Gemini 3.6 Flash**:
   - **Dynamic Pacing Engine**:
     - *Turn 1 (Crisp & Direct)*: Strict constraint of &le;100 words (or 3 concise lines) with zero filler intros.
     - *Turns 2-3 (Balanced)*: 120–150 words offering 1 focused analytical insight and 1 follow-up angle.
     - *Turns 4+ (Deep Dive)*: 180–240 words providing multidimensional exploration and structured growth steps.
     - *Manual Override*: Toggle between Adaptive (`Auto`), Ultra-Crisp (`⚡ <=100w`), Balanced (`⚖️ ~150w`), and Deep Dive (`🌊 ~220w`).
   - **Mandatory Mood-Content Decoupling**:
     - The AI reflects the written reality, dilemma, and tone of the journal entry rather than defaulting to generic cheerfulness if a positive mood tag is selected.
   - **5 Specialized Reflection Modes**:
     - **Deep Reflection (Mirror)**: Empathetic, grounded mirror cutting directly to core emotional truth.
     - **Socratic Inquiry (Socratic)**: Probing 1-2 sharp questions to expose subconscious assumptions.
     - **Action & Brainstorm (Action)**: High-leverage frameworks and actionable execution pathways.
     - **Perspective Reframe (Reframe)**: Constructive counter-perspectives & philosophical reframing.
     - **Themes & Synthesis (Synthesis)**: Extract key tensions, emotional shifts, and structured takeaways.
   - Markdown formatting for AI responses with copy-to-clipboard and token/word metrics.

4. **✨ Life360: Journey So Far (Visual Synthesis & Analytics)**:
   - Replaced heavy corporate text summaries with an instant, low-cognitive-load Bento card.
   - Structured JSON schema generation via `/api/synthesize` backed by Gemini.
   - Quick cognitive analytics: Clarity Score (0-100%), Emotional Shift trajectory, Cognitive Focus tags.
   - 3 crisp pillars: **Thoughts** (bulleted reality), **Insights** (growth shifts), and **Action Steps** (actionable checklist).
   - High-resolution SVG visual card export & copy-to-clipboard functionality.

5. **Personal Journal Archive**:
   - Real-time search across entries, notes, and AI summaries.
   - Filtering by reflection mode and mood tag.
   - Export entries as Markdown files (`.md`).
   - Detailed modal transcript inspector with embedded Life360 cards.

---

## 📋 Security Architecture

### 1. Firestore Security Rules (`firestore.rules`)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User profile document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // User-isolated interactions and journal entries
    match /users/{userId}/interactions/{interactionId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Catch-all deny for unauthenticated or cross-user access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

## 🛠️ Deployment to Google Cloud Run

### Step 1: Prerequisites & API Activation

Ensure the Google Cloud SDK (`gcloud`) is installed and authenticated:

```bash
# Set your active GCP project
gcloud config set project YOUR_PROJECT_ID

# Enable required Google Cloud services
gcloud services enable \
  run.googleapis.com \
  secretmanager.googleapis.com \
  firestore.googleapis.com \
  cloudbuild.googleapis.com
```

### Step 2: Secret Management Setup

Create and configure the `GEMINI_API_KEY` secret in Google Secret Manager:

```bash
# Create and populate the secret
gcloud secrets create GEMINI_API_KEY --replication-policy="automatic"
echo -n "YOUR_GEMINI_API_KEY" | gcloud secrets versions add GEMINI_API_KEY --data-file=-

# Grant the default Cloud Run service account access to read the secret
PROJECT_NUMBER=$(gcloud projects describe $(gcloud config get-value project) --format="value(projectNumber)")
gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### Step 3: Deploy to Cloud Run

Deploy the containerized Next.js application to Google Cloud Run:

```bash
gcloud run deploy reflectai-journal \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-secrets GEMINI_API_KEY=GEMINI_API_KEY:latest
```

### Step 4: Verification Binding (Mandatory Challenge Resource Label)

Apply the required label to register the service for automated challenge verification:

```bash
gcloud run services update reflectai-journal \
  --update-labels=dev-tutorial=cloud-run-ai-challenge \
  --region=us-central1
```

---

## 🧪 Functional Verification & Walkthrough Guide

Follow these steps to manually test every user interaction and system component:

### Test Case 1: Landing Page & Unauthenticated State
1. Open the application URL in an incognito browser window.
2. Verify that the landing page renders with the header title, feature overview, and **Sign in with Google** button.
3. Confirm that no private journal entries or user data are displayed.

### Test Case 2: Federated Google Authentication
1. Click **Sign in with Google**.
2. Complete Google authentication in the popup window.
3. Verify that the dashboard loads smoothly, displaying your user avatar, display name, and navigation bar.

### Test Case 3: Creating a Multi-Turn Reflection Entry
1. In the **New Reflection** tab, select a mode (e.g., *Deep Reflection*).
2. (Optional) Select a mood tag (e.g., *Grateful* or *Seeking Clarity*).
3. Type a reflection into the text area (e.g., *"I had a busy day and want to understand how to prioritize my deep work better."*) and press **Enter** or click **Reflect**.
4. Observe the loading indicator and verify that Gemini returns a response formatted in Markdown.
5. Verify the persistence indicator displays **Saved in Firestore** with a green checkmark.
6. Type a follow-up message (e.g., *"Can you break that into 2 daily habits?"*) and verify multi-turn context retention.

### Test Case 4: Synthesizing & Thematic Summary
1. Click the **Synthesize** button in the top action bar.
2. Confirm that Gemini generates a structured synthesis highlighting core themes, emotional patterns, and growth takeaways.
3. Verify that the entry title automatically updates or can be customized by clicking the title field.

### Test Case 5: Real-Time Journal Archive & Search
1. Click the **Past Entries** tab in the navigation bar.
2. Confirm the newly created entry appears in the list with correct timestamp, turn count, and mood.
3. Type keywords into the search box to test instant filtering.
4. Filter by reflection mode (e.g., *Reflections*, *Summaries*, *Brainstorm*).

### Test Case 6: Entry Transcript Inspection & Markdown Export
1. Click the **View** button on any entry card.
2. Inspect the full multi-turn transcript and AI summary inside the modal.
3. Click **Export MD** and verify a `.md` markdown file downloads to your local machine.

### Test Case 7: Entry Deletion & Data Isolation
1. Click the **Trash** icon on an entry card.
2. Confirm the deletion prompt.
3. Verify the entry is permanently removed from the list and Firestore database.
4. Sign out and sign in with a different Google account; verify that entries from the first account are completely inaccessible.
