// @ts-ignore
import { EventSource } from "launchdarkly-eventsource";
import { OpenAIMessage, Parameters } from '../../../../app/src/types';
import express from 'express';


// こいつがいつ呼び出されるのかわからん
export default class StreamingCompletionRequestHandler extends RequestHandler {
    async handler(req: express.Request, res: express.Response, parameters: Parameters) {
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