import EventEmitter from "events";
import { Configuration, OpenAIApi } from "openai";
import SSE from "./sse";
import { OpenAIMessage, Parameters } from "./types";
import axios from 'axios';
import {CoreBPE} from './tokenizer/bpe';
import GPT3Tokenizer from 'gpt3-tokenizer';

export const defaultSystemPrompt = `
You are ChatGPT, a large language model trained by OpenAI.
Knowledge cutoff: 2021-09
Current date and time: {{ datetime }}
`.trim();

export const defaultEndpoint = 'YOUR_RESOURCE_NAME';
export const defaultModel = 'YOUR_DEPLOYMENT_NAME';
export const defaultVersion = '2022-12-01';


export interface OpenAIResponseChunk {
    id?: string;
    done: boolean;
    choices?: {
        text: string;
        index: number;
        finish_reason: string | null;
    }[];
    model?: string;
}

function parseResponseChunk(buffer: any): OpenAIResponseChunk {
    const chunk = buffer.toString().replace('data: ', '').trim();

    if (chunk === '[DONE]') {
        return {
            done: true,
        };
    }

    const parsed = JSON.parse(chunk);

    return {
        id: parsed.id,
        done: false,
        choices: parsed.choices,
        model: parsed.model,
    };
}

function getElementsAfterNthFromEnd<T>(arr: T[], num: number): T[] {
    const n = num * 2
    return arr.slice(-n);
}

// TODO: 入力トークン数の推定
function estimateTokenCountUsingBPE(text: string, bpeInstance: CoreBPE): number {
    const allowedSpecial = new Set<string>(); // 特殊トークンを許可する場合はここで指定
    const encodedTokens = bpeInstance.encode(text, allowedSpecial);
    return encodedTokens.length;
  }

export async function createChatCompletion(messages: OpenAIMessage[], parameters: Parameters): Promise<string> {
    if (!parameters.apiKey) {
        throw new Error('No API key provided');
    }

    const configuration = new Configuration({
        apiKey: parameters.apiKey,
    });

    const openai = new OpenAIApi(configuration);
    // これいらないかも
    openai["basePath"] = `https://${parameters.endpoint}.openai.azure.com/openai/deployments/${parameters.model}/completions?api-version=${parameters.version}`

    const apiUrl = `https://${parameters.endpoint}.openai.azure.com/openai/deployments/${parameters.model}/completions?api-version=${parameters.version}`;
    const jsonString = JSON.stringify(messages);

    interface Message {
        role: string;
        content: string
    }
    const _messages: Message[] = JSON.parse(jsonString);
    
    function formatMessages(messages: Message[]): string {
        let formattedMessages = '';
    
        for (const _message of messages) {
            formattedMessages += `${_message.role}\n`;
            formattedMessages += `<|im_start|>${_message.content}\n<|im_end|>\n\n`;
        }

        formattedMessages += "<|im_start|>assistant\n";

    
        return formattedMessages;
    }
    
    const formattedMessages = formatMessages(_messages);

    const requestData = {
        prompt: formattedMessages,
        max_tokens: 200,
    };

    const requestConfig = {
        headers: {
            'Content-Type': 'application/json',
            'api-key': parameters.apiKey,
        }
    };

    try {
        const response = await axios.post(apiUrl, requestData, requestConfig);
        // console.log("RES log", response.data.choices[0].text);
        // console.log("RES log", response.data);
        const specificStringToRemove = '<|im_end|>';
        return response.data.choices[0].text.replace(specificStringToRemove, '');
      } catch (error) {
        console.error(error);
        return ''
      }
}

export async function createStreamingChatCompletion(messages: OpenAIMessage[], parameters: Parameters) {
    if (!parameters.apiKey) {
        throw new Error('No API key provided');
    }

    const emitter = new EventEmitter();

    let messagesToSend = [...messages].filter(m => m.role !== 'app');

    for (let i = messagesToSend.length - 1; i >= 0; i--) {
        const m = messagesToSend[i];
        if (m.role === 'user') {
            break;
        }
        if (m.role === 'assistant') {
            messagesToSend.splice(i, 1);
        }
    }

    messagesToSend = getElementsAfterNthFromEnd(messagesToSend, parameters.pastMessagesIncluded);
    messagesToSend.unshift({
        role: 'system',
        content: (parameters.initialSystemPrompt || defaultSystemPrompt).replace('{{ datetime }}', new Date().toLocaleString()),
    });

    messagesToSend = await selectMessagesToSendSafely(messagesToSend, 2048);


    const jsonString = JSON.stringify(messagesToSend);
    // console.log("good news", jsonString);
    interface Message {
        role: string;
        content: string
    }
    const _messages: Message[] = JSON.parse(jsonString);
    
    function formatMessages(messages: Message[]): string {
        let formattedMessages = '';
    
        for (const _message of messages) {
            formattedMessages += `${_message.role}\n`;
            formattedMessages += `<|im_start|>${_message.content}<|im_end|>\n\n`;
        }

        formattedMessages += "<|im_start|>assistant\n";
    
        return formattedMessages;
    }
    
    const formattedMessages = formatMessages(_messages);
    console.log(formattedMessages);

    const tokenizer = new GPT3Tokenizer({ type: 'gpt3' }); // or 'codex'
    const str = "hello 👋 world 🌍";
    const encoded: { bpe: number[]; text: string[] } = tokenizer.encode(str);
    console.log(encoded.bpe.length);
    // 今のところデコード予定はない、投げる前にざっくりとしたトークン数を知りたいだけ
    // 本来はフォーク内のbpeを使ってみたかったが、とりあえず代替処理
    // const decoded = tokenizer.decode(encoded.bpe);
    const eventSource = new SSE(`https://${parameters.endpoint}.openai.azure.com/openai/deployments/${parameters.model}/completions?api-version=${parameters.version}`, {
        method: "POST",
        headers: {
            'api-key': parameters.apiKey,
            'Content-Type': 'application/json',
        },
        payload: JSON.stringify({
            "temperature": parameters.temperature,
            "prompt": formattedMessages,
            "max_tokens": parameters.maxtoken,
            "stream": true,
        }),
    }) as SSE;

    // TODO: enable (optional) server-side completion
    /*
    const eventSource = new SSE('/chatapi/completion/streaming', {
        method: "POST",
        headers: {
            'Accept': 'application/json, text/plain, *\/*',
            'Authorization': `Bearer ${(backend.current as any).token}`,
            'Content-Type': 'application/json',
        },
        payload: JSON.stringify({
            "model": "gpt-3.5-turbo",
            "messages": messagesToSend,
            "temperature": parameters.temperature,
            "stream": true,
        }),
    }) as SSE;
    */

    let contents = '';

    eventSource.addEventListener('error', (event: any) => {
        if (!contents) {
            let error = event.data;
            try {
                error = JSON.parse(error).error.message;
            } catch (e) {}
            emitter.emit('error', error);
        }
    });

    eventSource.addEventListener('message', async (event: any) => {

        if (event.data === '[DONE]') {
            emitter.emit('done');
            return;
        }
        try {
            const chunk = parseResponseChunk(event.data);

            if (chunk.choices && chunk.choices.length > 0) {
                const specificStringToRemove = '<|im_end|>';
                contents += chunk.choices[0]?.text.replace(specificStringToRemove, '') || '';
                emitter.emit('data', contents);
            }
        } catch (e) {
            console.error(e);
        }
    });

    eventSource.stream();

    return {
        emitter,
        cancel: () => eventSource.close(),
    };
}

async function selectMessagesToSendSafely(messages: OpenAIMessage[], maxTokens: number) {
    const { ChatHistoryTrimmer } = await import(/* webpackPreload: true */ './tokenizer/chat-history-trimmer');
    const compressor = new ChatHistoryTrimmer(messages, {
        maxTokens,
        preserveFirstUserMessage: true,
        preserveSystemPrompt: true,
    });
    return compressor.process();
}

setTimeout(() => selectMessagesToSendSafely([], 2048), 2000);