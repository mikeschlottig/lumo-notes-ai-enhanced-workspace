# Cloudflare AI Chat App

[![[cloudflarebutton]]](https://deploy.workers.cloudflare.com)

A production-ready full-stack AI chat application powered by Cloudflare Workers and Durable Objects. Features multi-session conversations, real-time streaming responses, tool calling (web search, weather, and extensible MCP tools), and a modern responsive UI built with React, Tailwind CSS, and shadcn/ui.

## ✨ Key Features

- **Multi-Session Chat**: Create, manage, switch, and delete chat sessions with automatic title generation and activity tracking.
- **Streaming Responses**: Real-time AI message streaming for natural conversation flow.
- **Tool Calling**: Built-in tools for web search (SerpAPI), weather, URL fetching, and extensible Model Context Protocol (MCP) integration.
- **AI Model Flexibility**: Switch between models like Gemini 2.5 Flash/Pro via Cloudflare AI Gateway.
- **Persistent State**: Cloudflare Durable Objects for chat history and session management.
- **Modern UI**: Responsive design with shadcn/ui components, dark/light themes, and Tailwind CSS animations.
- **Session APIs**: Full CRUD for sessions including listing, stats, and bulk deletion.
- **Error Handling & Observability**: Comprehensive logging, client error reporting, and Cloudflare Observability integration.
- **Type-Safe**: Full TypeScript with proper types for Workers and frontend.

## 🛠️ Technology Stack

- **Backend**: Cloudflare Workers, Hono, Durable Objects (`ChatAgent`, `AppController`), OpenAI SDK
- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, shadcn/ui, TanStack Query, React Router
- **AI**: Cloudflare AI Gateway, Gemini models, SerpAPI, MCP SDK
- **Utilities**: Lucide icons, Sonner toasts, Framer Motion, Zustand
- **Dev Tools**: Bun, Wrangler, ESLint, TypeScript

## 🚀 Quick Start

### Prerequisites

- [Bun](https://bun.sh/) (recommended package manager)
- [Cloudflare Account](https://dash.cloudflare.com/) with Workers enabled
- Cloudflare AI Gateway setup (for AI models)
- Optional: SerpAPI key (for web search), Cloudflare API key/token

### Installation

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd <project-name>
   ```

2. Install dependencies:
   ```bash
   bun install
   ```

3. Configure environment variables in `wrangler.jsonc`:
   ```json
   "vars": {
     "CF_AI_BASE_URL": "https://gateway.ai.cloudflare.com/v1/{account_id}/{gateway_id}/openai",
     "CF_AI_API_KEY": "{your-api-key}",
     "SERPAPI_KEY": "{your-serpapi-key}",
     "OPENROUTER_API_KEY": "{optional}"
   }
   ```

4. Generate Worker types:
   ```bash
   bun run cf-typegen
   ```

### Development

1. Start the development server:
   ```bash
   bun dev
   ```
   - Frontend: http://localhost:3000 (Vite dev server)
   - Backend: Automatically handled by Wrangler/Vite proxy

2. Open http://localhost:3000 in your browser.

### Build for Production

```bash
bun run build
```

## 📱 Usage

- **New Chat**: Automatically creates a session on first message.
- **Switch Sessions**: Use the session manager to list/create/delete chats.
- **Streaming**: Messages stream in real-time with tool execution.
- **Tools**: Ask for weather (`get_weather`), search (`web_search`), or MCP tools.
- **Model Switch**: Select different AI models via UI (updates per session).
- **APIs**:
  - `GET /api/sessions` - List sessions
  - `POST /api/sessions` - Create session
  - `DELETE /api/sessions/:id` - Delete session
  - `PUT /api/sessions/:id/title` - Update title
  - Chat via `/api/chat/:sessionId/*` (proxied to Durable Object)

## ☁️ Deployment

Deploy to Cloudflare Workers in one command:

```bash
bun run deploy
```

This builds the frontend assets and deploys the Worker with SPA routing.

### Custom Deployment

1. Update `wrangler.jsonc` with your bindings and vars.
2. Run:
   ```bash
   bun run build
   wrangler deploy
   ```
3. Bind Durable Object namespaces in Wrangler dashboard.
4. Assets are automatically served from KV (via `assets` config).

[![[cloudflarebutton]]](https://deploy.workers.cloudflare.com)

**Note**: Update `wrangler.jsonc` migrations for production. Ensure AI Gateway and API keys are set as Worker variables/secrets.

## 🔧 Extending the App

### Backend (Worker)
- Add routes in `worker/userRoutes.ts`.
- Extend tools in `worker/tools.ts`.
- Customize `worker/chat.ts` for new AI providers.
- Modify `worker/agent.ts` for custom state/handlers.

### Frontend
- Edit `src/pages/HomePage.tsx` (current chat UI).
- Use shadcn/ui components from `src/components/ui/*`.
- Hooks in `src/hooks/*`, utils in `src/lib/*`.
- Add routes in `src/main.tsx`.

### MCP Tools
- Add servers in `worker/mcp-client.ts`:
  ```typescript
  const MCP_SERVERS: MCPServerConfig[] = [
    { name: 'my-server', sseUrl: 'https://your-mcp-server/sse' }
  ];
  ```

## 🐛 Troubleshooting

- **AI Gateway errors**: Verify `CF_AI_BASE_URL` and API key.
- **No SerpAPI**: Web search falls back to Google links.
- **Type errors**: Run `bun run cf-typegen`.
- **Build issues**: Ensure Bun >=1.0 and Node.js compat flag.
- **Client errors**: Reported to `/api/client-errors`.

## 📄 License

MIT License. See [LICENSE](LICENSE) for details.

## 🤝 Contributing

1. Fork & clone.
2. `bun install`.
3. Create feature branch.
4. `bun dev` & test.
5. PR to `main`.

Built with ❤️ for Cloudflare Workers. Questions? Open an issue!