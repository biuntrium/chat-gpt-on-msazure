import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '.';
import { defaultSystemPrompt, defaultModel, defaultEndpoint, defaultVersion } from '../openai';
import { defaultParameters } from '../parameters';
import { Parameters } from '../types';

const initialState: Parameters = defaultParameters;

export const parametersSlice = createSlice({
    name: 'parameters',
    initialState,
    reducers: {
        setSystemPrompt: (state, action: PayloadAction<string>) => {
            state.initialSystemPrompt = action.payload;
        },
        resetSystemPrompt: (state) => {
            state.initialSystemPrompt = defaultSystemPrompt;
        },
        setModel: (state, action: PayloadAction<string>) => {
            state.model = action.payload;
        },
        resetModel: (state) => {
            state.model = defaultModel;
        },
        setTemperature: (state, action: PayloadAction<number>) => {
            state.temperature = action.payload;
        },
        setTop_p: (state, action: PayloadAction<number>) => {
            state.top_p = action.payload;
        },
        setMaxToken: (state, action: PayloadAction<number>) => {
            state.maxtoken = action.payload;
        },
        setVersion: (state, action: PayloadAction<string>) => {
            state.version = action.payload;
        },
        resetVersion: (state) => {
            state.version = defaultVersion;
        },
        setEndpoint: (state, action: PayloadAction<string>) => {
            state.endpoint = action.payload;
        },
        resetEndpoint: (state) => {
            state.version = defaultEndpoint;
        },
        // resetMaxToken: (state) => {
        //     state.temperature = defaultModel;
        // },
        setPastMessagesIncluded: (state, action: PayloadAction<number>) => {
            state.pastMessagesIncluded = action.payload;
        },
        // resetPastMessagesIncluded: (state) => {
        //     state.temperature = defaultModel;
        // },
    },
})

export const { setSystemPrompt, setModel, setTemperature, setMaxToken, setPastMessagesIncluded, resetSystemPrompt, resetEndpoint, resetModel, resetVersion, setVersion, setTop_p, setEndpoint } = parametersSlice.actions;

export const selectSystemPrompt = (state: RootState) => state.parameters.initialSystemPrompt;
export const selectModel = (state: RootState) => state.parameters.model;
export const selectTemperature = (state: RootState) => state.parameters.temperature;
export const selectMaxtoken = (state: RootState) => state.parameters.maxtoken;
export const selectTop_p = (state: RootState) => state.parameters.top_p;
export const selectVersion = (state: RootState) => state.parameters.version;
export const selectIncluded = (state: RootState) => state.parameters.pastMessagesIncluded;
export const selectEndpoint = (state: RootState) => state.parameters.endpoint;

export default parametersSlice.reducer;