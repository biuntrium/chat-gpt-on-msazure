import { createChatCompletion, defaultModel, defaultEndpoint, defaultVersion } from "./openai";
import { OpenAIMessage, Chat } from "./types";

const systemPrompt = `
Please read the following exchange and write a short, concise title describing the topic in the user's writing language. maybe japanease.
`.trim();

const userPrompt = (user: string, assistant: string) => `
Message: ${user}

Response: ${assistant}

Title:
`.trim();

export async function createTitle(
        chat: Chat,
        endpoint: string | undefined | null,
        model: string | undefined | null,
        version: string | undefined | null,
        apiKey: string | undefined | null,
        attempt = 0): Promise<string|null> {
    if (!apiKey) {
        return null;
    }
    if (!endpoint) {
        return null;
    }
    if (!model) {
        return null;
    }
    if (!version) {
        return null;
    }

    const nodes = Array.from(chat.messages.nodes.values());

    const firstUserMessage = nodes.find(m => m.role === 'user');
    const firstAssistantMessage = nodes.find(m => m.role === 'assistant');

    if (!firstUserMessage || !firstAssistantMessage) {
        return null;
    }

    const messages: OpenAIMessage[] = [
        {
            role: 'system',
            content: systemPrompt,
        },
        {
            role: 'user',
            content: userPrompt(firstUserMessage!.content, firstAssistantMessage!.content),
        },
    ];// ここ、REST形式にパースしないと正しく動かないかも

    // console.log(messages, defaultModel);

    let title = await createChatCompletion(messages as any, { temperature: 0.5, endpoint, model, version, apiKey , maxtoken: 400, pastMessagesIncluded: 5, top_p:1});

    if (!title?.length) {
        if (firstUserMessage.content.trim().length > 2 && firstUserMessage.content.trim().length < 250) {
            return firstUserMessage.content.trim();
        }

        if (attempt === 0) {
            return createTitle(chat, endpoint, model, version, apiKey, 1);
        }
    }

    // remove periods at the end of the title
    title = title.replace(/(\w)\.$/g, '$1');

    if (title.length > 250) {
        title = title.substring(0, 250) + '...';
    }

    return title;
}