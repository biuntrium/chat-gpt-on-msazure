// @ts-ignore
import { EventSource } from "launchdarkly-eventsource";
import { OpenAIMessage, Parameters } from '../../../../app/src/types'; 
// build時に
// src/endpoints/completion/streaming.ts(3,43): error TS2307: Cannot find module '../../../../app/src/types' or its corresponding type declarations.
import express from 'express';
import RequestHandler from "../base";


// こいつがいつ呼び出されるのかわからん
// タイトルかな？
export default class StreamingCompletionRequestHandler extends RequestHandler {
    async handler(req: express.Request, res: express.Response) {
        res.set({
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive',
        });

        console.log("C", req.body);
        const eventSource = new EventSource(`https://${parameters.endpoint}.openai.azure.com/openai/deployments/${parameters.model}/completions?api-version=${parameters.version}`, {
            method: "POST",
            headers: {
                // 'api-type' : `azure`,
                // 'Accept': 'application/json, text/plain, */*',
                'api-key': parameters.apiKey,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...req.body,
                "max_tokens": 400,
                "stream": true,
            }),
        });

        eventSource.addEventListener('message', async (event: any) => {
            console.log(event.data);

            res.write(`data: ${event.data}\n\n`);
            res.flush();

            if (event.data === '[DONE]') {
                res.end();
                eventSource.close();
            }
        });

        eventSource.addEventListener('error', (event: any) => {
            res.end();
        });

        eventSource.addEventListener('abort', (event: any) => {
            res.end();
        });

        req.on('close', () => {
            eventSource.close();
        });

        res.on('error', () => {
            eventSource.close();
        });
    }

    public isProtected() {
        return true;
    }
}