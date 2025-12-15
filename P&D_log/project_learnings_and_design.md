# Recruit-AI: Project Learnings, Prompt Iterations & Design Choices

## 📚 Project Learnings

### 1. Hybrid Architecture (Frontend + n8n + Supabase)
- **Learning**: Combining a React frontend with n8n as the backend logic layer and Supabase for data persistence creates a powerful, low-code/pro-code hybrid.
- **Benefit**: Drastically reduced backend boilerplate code. n8n handles the complex orchestration of API calls (LLMs, Email, Calendar) visually, while Supabase handles Auth and Data security.
- **Challenge**: Managing authentication between the frontend (Supabase Auth) and n8n webhooks required careful implementation of JWT validation or passing user IDs securely.

### 2. Multi-LLM Integration
- **Learning**: Different LLM providers (OpenAI, Gemini, Perplexity) have slightly different API structures and prompting nuances.
- **Solution**: We implemented a "Provider Adapter" pattern in the n8n workflow. A single configuration node normalizes the request format, and a parsing node handles the specific response structures (e.g., `choices[0].message.content` vs `candidates[0].content.parts[0].text`).
- **Takeaway**: Always build an abstraction layer when dealing with multiple AI providers to prevent vendor lock-in.

### 3. Data Persistence & Security
- **Learning**: Moving from LocalStorage (prototype) to a real database (Supabase) revealed the importance of Row Level Security (RLS).
- **Implementation**: We ensured that every table (`screenings`, `settings`, etc.) has RLS policies so users can only access their own data. This is critical for a multi-tenant application.

---

## 🔄 Prompt Iterations & Engineering

We went through several iterations to perfect the AI analysis prompt.

### Iteration 1: Basic Analysis (Too Vague)
> "Read this resume and job description and tell me if they match."
- **Result**: Output was unstructured text, varying in length and format. Hard to display in UI.

### Iteration 2: Structured Request (Better)
> "Analyze the match. Return a JSON with score and reason."
- **Result**: Better, but "reason" was often too brief or hallucinated details. JSON formatting often broke.

### Iteration 3: Role-Playing & Specific Schema (Current Production)
> "You are an expert Technical Recruiter with 10+ years of experience... Provide a comprehensive analysis and output ONLY a valid JSON object with this exact structure: { score, summary, recommendation, details: [{ criteria, status, reason }] }..."
- **Key Improvements**:
    - **Persona**: "Expert Recruiter" sets the tone.
    - **Strict Schema**: Defining the exact JSON structure prevents parsing errors.
    - **Scoring Guidelines**: Explicitly defining what "90-100" vs "60-70" means ensures consistency.
    - **Recommendation Logic**: Defining the threshold (65%) directly in the prompt helps the LLM make binary decisions.

### Iteration 4: Email Generation Prompts
- **Challenge**: Generic emails felt robotic.
- **Solution**: We injected specific variables (`${candidateName}`, `${score}`, `${position}`) into the prompt context to generate highly personalized drafts.

---

## 🎨 Design Choices

### 1. Glassmorphism UI Style
- **Choice**: We chose a "Glassmorphism" aesthetic (translucent backgrounds, blurs, gradients) over flat design.
- **Reason**: To give the application a modern, "futuristic" AI feel. It differentiates Recruit-AI from standard enterprise SaaS tools, making it feel more premium and innovative.
- **Implementation**: Heavy use of `backdrop-blur`, `bg-white/10`, and white borders in Tailwind CSS.

### 2. "No-Backend" Backend (n8n)
- **Choice**: Using n8n workflows instead of a dedicated Node.js/Python server.
- **Reason**: Speed of iteration. We can modify the AI logic, add new steps (like email sending), or switch providers by dragging nodes in a visual editor without redeploying the entire application.
- **Trade-off**: Slightly higher latency for the initial webhook call, but acceptable for an asynchronous screening process.

### 3. Supabase for "Everything Else"
- **Choice**: Using Supabase for Auth, Database, and Storage.
- **Reason**: It provides a unified ecosystem. We didn't want to manage separate Auth0 and Postgres instances. The client-side library (`@supabase/supabase-js`) made frontend integration seamless.

### 4. Client-Side Processing for Files
- **Choice**: Reading files (PDF/Doc) in the browser and sending text to the API, rather than uploading files to a server for processing.
- **Reason**: Privacy and Simplicity. We don't need to store the raw resume files permanently, only the extracted text and analysis results. This reduces storage costs and compliance risks.

### 5. Multi-Provider Strategy
- **Choice**: Allowing users to bring their own API keys (BYOK).
- **Reason**: Cost management. We don't have to act as a middleman for API billing. Power users can use GPT-4, while cost-conscious users can use Gemini or GPT-3.5.

---

## 🚀 Future Considerations

- **Queue System**: For bulk processing 100+ resumes, we might need a queue system (like Redis or Supabase Realtime) instead of direct synchronous webhook calls to avoid timeouts.
- **RAG Implementation**: Storing past successful hires in a vector database to help the AI learn "what a good candidate looks like" for this specific company.
