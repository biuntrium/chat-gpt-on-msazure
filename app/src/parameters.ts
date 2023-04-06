import { defaultModel, defaultVersion, defaultEndpoint } from "./openai";
import { Parameters } from "./types";

export const defaultParameters: Parameters = {
    endpoint: defaultEndpoint,
    top_p: 1,
    maxtoken: 400,
    pastMessagesIncluded: 5,
    temperature: 0.5,
    model: defaultModel,
    version: defaultVersion,
};

export function loadParameters(id: string | null | undefined = null): Parameters {
    const apiKey = localStorage.getItem('openai-api-key') || undefined;
    const key = id ? `parameters-${id}` : 'parameters';
    try {
        const raw = localStorage.getItem(key);
        if (raw) {
            const parameters = JSON.parse(raw) as Parameters;
            parameters.apiKey = apiKey;
            return parameters;
        }
    } catch (e) { }
    return id ? loadParameters() : { ...defaultParameters, apiKey };
}

export function saveParameters(id: string, parameters: Parameters) {
    if (parameters) {
        const apiKey = parameters.apiKey;
        delete parameters.apiKey;

        localStorage.setItem(`parameters-${id}`, JSON.stringify(parameters));
        localStorage.setItem('parameters', JSON.stringify(parameters));

        if (apiKey) {
            localStorage.setItem(`openai-api-key`, apiKey);
        }
    }
}