import { Hono } from "hono";
import { getAgentByName } from 'agents';
import { ChatAgent } from './agent';
import { API_RESPONSES } from './config';
import { Env, getAppController, registerSession, unregisterSession } from "./core-utils";
export function coreRoutes(app: Hono<{ Bindings: Env }>) {
    app.all('/api/chat/:sessionId/*', async (c) => {
        try {
            const sessionId = c.req.param('sessionId');
            const agent = await getAgentByName<Env, ChatAgent>(c.env.CHAT_AGENT, sessionId);
            const url = new URL(c.req.url);
            url.pathname = url.pathname.replace(`/api/chat/${sessionId}`, '');
            return agent.fetch(new Request(url.toString(), {
                method: c.req.method,
                headers: c.req.header(),
                body: c.req.method === 'GET' || c.req.method === 'DELETE' ? undefined : c.req.raw.body
            }));
        } catch (error) {
            return c.json({ success: false, error: API_RESPONSES.AGENT_ROUTING_FAILED }, { status: 500 });
        }
    });
}
export function userRoutes(app: Hono<{ Bindings: Env }>) {
    app.get('/api/documents', async (c) => {
        const controller = getAppController(c.env);
        const sessions = await controller.listSessions();
        return c.json({ success: true, data: sessions });
    });
    app.post('/api/documents', async (c) => {
        const { title } = await c.req.json().catch(() => ({}));
        const sessionId = crypto.randomUUID();
        const initialTitle = title || "Untitled Page";
        await registerSession(c.env, sessionId, initialTitle);
        // Initialize the agent immediately to set title
        const agent = await getAgentByName<Env, ChatAgent>(c.env.CHAT_AGENT, sessionId);
        await agent.fetch(new Request("http://local/document", {
            method: 'PUT',
            body: JSON.stringify({ title: initialTitle })
        }));
        return c.json({ success: true, data: { id: sessionId, title: initialTitle } });
    });
    app.get('/api/documents/:id', async (c) => {
        const id = c.req.param('id');
        const agent = await getAgentByName<Env, ChatAgent>(c.env.CHAT_AGENT, id);
        return agent.fetch(new Request("http://local/document"));
    });
    app.put('/api/documents/:id', async (c) => {
        const id = c.req.param('id');
        const body = await c.req.raw.blob();
        const agent = await getAgentByName<Env, ChatAgent>(c.env.CHAT_AGENT, id);
        return agent.fetch(new Request("http://local/document", {
            method: 'PUT',
            body
        }));
    });
    app.delete('/api/documents/:id', async (c) => {
        const id = c.req.param('id');
        const deleted = await unregisterSession(c.env, id);
        return c.json({ success: deleted });
    });
}