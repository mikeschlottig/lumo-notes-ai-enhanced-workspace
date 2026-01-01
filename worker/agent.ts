import { Agent } from 'agents';
import type { Env } from './core-utils';
import type { ChatState } from './types';
import { ChatHandler } from './chat';
import { API_RESPONSES } from './config';
import { createMessage, createStreamResponse, createEncoder } from './utils';
export class ChatAgent extends Agent<Env, ChatState> {
  private chatHandler?: ChatHandler;
  initialState: ChatState = {
    messages: [],
    sessionId: crypto.randomUUID(),
    isProcessing: false,
    model: 'google-ai-studio/gemini-2.5-flash',
    documentContent: { type: 'doc', content: [] },
    title: 'Untitled',
    lastModified: Date.now()
  };
  async onStart(): Promise<void> {
    this.chatHandler = new ChatHandler(
      this.env.CF_AI_BASE_URL,
      this.env.CF_AI_API_KEY,
      this.state.model
    );
  }
  async onRequest(request: Request): Promise<Response> {
    try {
      const url = new URL(request.url);
      const method = request.method;
      if (method === 'GET' && url.pathname === '/document') {
        return Response.json({
          success: true,
          data: {
            content: this.state.documentContent,
            title: this.state.title,
            lastModified: this.state.lastModified
          }
        });
      }
      if (method === 'PUT' && url.pathname === '/document') {
        const { content, title } = await request.json();
        const nextState = { ...this.state, lastModified: Date.now() };
        if (content !== undefined) nextState.documentContent = content;
        if (title !== undefined) nextState.title = title;
        this.setState(nextState);
        if (title) {
          const controller = this.env.APP_CONTROLLER.get(this.env.APP_CONTROLLER.idFromName("controller"));
          await controller.updateSessionTitle(this.name, title);
        }
        return Response.json({ success: true });
      }
      if (method === 'GET' && url.pathname === '/messages') {
        return Response.json({ success: true, data: this.state });
      }
      if (method === 'POST' && url.pathname === '/chat') {
        return this.handleChatMessage(await request.json());
      }
      if (method === 'DELETE' && url.pathname === '/clear') {
        this.setState({ ...this.state, messages: [] });
        return Response.json({ success: true });
      }
      return Response.json({ success: false, error: API_RESPONSES.NOT_FOUND }, { status: 404 });
    } catch (error) {
      console.error('Request error:', error);
      return Response.json({ success: false, error: API_RESPONSES.INTERNAL_ERROR }, { status: 500 });
    }
  }
  private async handleChatMessage(body: { message: string; model?: string; stream?: boolean }): Promise<Response> {
    const { message, model, stream } = body;
    if (!message?.trim()) return Response.json({ success: false, error: API_RESPONSES.MISSING_MESSAGE }, { status: 400 });
    if (model && model !== this.state.model) {
      this.setState({ ...this.state, model });
      this.chatHandler?.updateModel(model);
    }
    const userMessage = createMessage('user', message.trim());
    const history = [...this.state.messages, userMessage];
    this.setState({ ...this.state, messages: history, isProcessing: true });
    try {
      if (stream) {
        const { readable, writable } = new TransformStream();
        const writer = writable.getWriter();
        const encoder = createEncoder();
        (async () => {
          try {
            const response = await this.chatHandler!.processMessage(
              message,
              history.slice(0, -1),
              this.state.documentContent,
              (chunk: string) => writer.write(encoder.encode(chunk))
            );
            const assistantMsg = createMessage('assistant', response.content, response.toolCalls);
            this.setState({ ...this.state, messages: [...history, assistantMsg], isProcessing: false });
          } finally {
            writer.close();
          }
        })();
        return createStreamResponse(readable);
      }
      const response = await this.chatHandler!.processMessage(message, history.slice(0, -1), this.state.documentContent);
      const assistantMsg = createMessage('assistant', response.content, response.toolCalls);
      this.setState({ ...this.state, messages: [...history, assistantMsg], isProcessing: false });
      return Response.json({ success: true, data: this.state });
    } catch (error) {
      this.setState({ ...this.state, isProcessing: false });
      return Response.json({ success: false, error: API_RESPONSES.PROCESSING_ERROR }, { status: 500 });
    }
  }
}