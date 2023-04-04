import SettingsTab from "./tab";
import SettingsOption from "./option";
import { Button, Select, Slider, Textarea } from "@mantine/core";
import { useCallback, useMemo } from "react";
import { defaultSystemPrompt, defaultModel, defaultEndpoint, defaultVersion } from "../../openai";
import { useAppDispatch, useAppSelector } from "../../store";
import { resetModel, setModel, selectModel, resetSystemPrompt, resetEndpoint, resetVersion, selectSystemPrompt, selectTemperature, setSystemPrompt, setTemperature , setMaxToken, setPastMessagesIncluded, setVersion, setTop_p, setEndpoint, selectMaxtoken, selectIncluded, selectTop_p, selectVersion, selectEndpoint} from "../../store/parameters";
import { selectSettingsOption } from "../../store/settings-ui";
import { FormattedMessage, useIntl } from "react-intl";

export default function GenerationOptionsTab(props: any) {
    const intl = useIntl();
    
    const option = useAppSelector(selectSettingsOption);
    const initialSystemPrompt = useAppSelector(selectSystemPrompt);
    const model = useAppSelector(selectModel);
    const temperature = useAppSelector(selectTemperature);
    const top_p = useAppSelector(selectTop_p);
    const maxtoken = useAppSelector(selectMaxtoken);
    const included = useAppSelector(selectIncluded);
    const version = useAppSelector(selectVersion);
    const endpoint = useAppSelector(selectEndpoint)

    const dispatch = useAppDispatch();
    const onSystemPromptChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => dispatch(setSystemPrompt(event.target.value)), [dispatch]);
    const onEndpointChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => dispatch(setEndpoint(event.target.value)), [dispatch]);
    const onModelChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => dispatch(setModel(event.target.value)), [dispatch]);
    const onVersionChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => dispatch(setVersion(event.target.value)), [dispatch]);
    const onTop_pChange = useCallback((value: number) => dispatch(setTop_p(value)), [dispatch]);
    const onResetSystemPrompt = useCallback(() => dispatch(resetSystemPrompt()), [dispatch]);
    const onResetModel = useCallback(() => dispatch(resetModel()), [dispatch]);
    const onResetEndpoint = useCallback(() => dispatch(resetEndpoint()), [dispatch]);
    const onResetVersion = useCallback(() => dispatch(resetVersion()), [dispatch]);
    const onTemperatureChange = useCallback((value: number) => dispatch(setTemperature(value)), [dispatch]);
    // スライダーか数値ボックスかでコールバック変える
    // const onMaxtokenChange = useCallback((value: number) => dispatch(setMaxToken(value)), [dispatch]);
    // const onIncludedChange = useCallback((value: number) => dispatch(setPastMessagesIncluded(value)), [dispatch]);
    const onMaxtokenChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => dispatch(setMaxToken(parseInt(event.target.value, 10))), [dispatch])
    const onIncludedChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => dispatch(setPastMessagesIncluded(parseInt(event.target.value, 10))), [dispatch])
    
    const resettableSystemPromopt = initialSystemPrompt
        && (initialSystemPrompt?.trim() !== defaultSystemPrompt.trim());

    const resettableModel = model
        && (model?.trim() !== defaultModel.trim());
    
    const resettableEndpoint = model
        && (model?.trim() !== defaultModel.trim());
    
    const resettableVersion = model
        && (model?.trim() !== defaultModel.trim());

    const systemPromptOption = useMemo(() => (
        <SettingsOption heading={intl.formatMessage({ defaultMessage: "System Prompt", description: "Heading for the setting that lets users customize the System Prompt, on the settings screen" })}
                        focused={option === 'system-prompt'}>
            <Textarea
                value={initialSystemPrompt || defaultSystemPrompt}
                onChange={onSystemPromptChange}
                minRows={5}
                maxRows={10}
                autosize />
            <p style={{ marginBottom: '0.7rem' }}>
                <FormattedMessage defaultMessage="The System Prompt is shown to ChatGPT by the &quot;System&quot; before your first message. The <code>'{{ datetime }}'</code> tag is automatically replaced by the current date and time."
                    values={{ code: chunk => <code style={{ whiteSpace: 'nowrap' }}>{chunk}</code> }} />
            </p>
            {resettableSystemPromopt && <Button size="xs" compact variant="light" onClick={onResetSystemPrompt}>
                <FormattedMessage defaultMessage="Reset to default" />
            </Button>}
        </SettingsOption>
    ), [option, initialSystemPrompt, resettableSystemPromopt, onSystemPromptChange, onResetSystemPrompt]);

    const endpointOption = useMemo(() => (
        <SettingsOption heading={intl.formatMessage({ defaultMessage: "Endpoint", description: "Heading for the setting that lets users choose a model to interact with, on the settings screen" })}
                        focused={option === 'endopint'}>
            <Textarea
                value={endpoint || defaultEndpoint}
                onChange={onEndpointChange}
                minRows={1}
                maxRows={10}
                autosize />

            <p style={{ marginBottom: '0.7rem' }}>
                <FormattedMessage defaultMessage="Note : https://YOUR_RESOURCE_NAME.openai.azure.com<a>API reference here</a>"
                    values={{ a: chunk => <a href="https://learn.microsoft.com/ja-jp/azure/cognitive-services/openai/reference" target="_blank" rel="noreferer">{chunk}</a> }} />
            </p>

            {resettableEndpoint && <Button size="xs" compact variant="light" onClick={onResetEndpoint}>
                <FormattedMessage defaultMessage="Reset to default" />
            </Button>}
        </SettingsOption>
    ), [option, endpoint, resettableEndpoint, onEndpointChange, onResetEndpoint]);

    const modelOption = useMemo(() => (
        <SettingsOption heading={intl.formatMessage({ defaultMessage: "Model", description: "Heading for the setting that lets users choose a model to interact with, on the settings screen" })}
                        focused={option === 'model'}>
            <Textarea
                value={model || defaultModel}
                onChange={onModelChange}
                minRows={1}
                maxRows={10}
                autosize />

            <p style={{ marginBottom: '0.7rem' }}>
                <FormattedMessage defaultMessage="Note: https://YOUR_RESOURCE_NAME.openai.azure.com/openai/deployments/YOUR_DEPLOYMENT_NAME<a>API reference here</a>"
                    values={{ a: chunk => <a href="https://learn.microsoft.com/ja-jp/azure/cognitive-services/openai/reference" target="_blank" rel="noreferer">{chunk}</a> }} />
            </p>

            {resettableModel && <Button size="xs" compact variant="light" onClick={onResetModel}>
                <FormattedMessage defaultMessage="Reset to default" />
            </Button>}
        </SettingsOption>
    ), [option, model, resettableModel, onModelChange, onResetModel]);

    const versionOption = useMemo(() => (
        <SettingsOption heading={intl.formatMessage({ defaultMessage: "Version", description: "MS Azure API Version." })}
                        focused={option === 'version'}>
            <Textarea
                value={version || defaultVersion}
                onChange={onVersionChange}
                minRows={1}
                maxRows={10}
                autosize />
            <p style={{ marginBottom: '0.7rem' }}>
                    <FormattedMessage defaultMessage="As of 2023/04/04, the VersionNote : 2022-12-01, "
                    />
                </p>
            {resettableVersion && <Button size="xs" compact variant="light" onClick={onResetVersion}>
                <FormattedMessage defaultMessage="Reset to default" />
            </Button>}
        </SettingsOption>
    ), [option, version, resettableVersion, onVersionChange, onResetVersion]);

    const temperatureOption = useMemo(() => (
        <SettingsOption heading={intl.formatMessage({
                            defaultMessage: "Temperature: {temperature, number, ::.0}", 
                            description: "Label for the button that opens a modal for setting the 'temperature' (randomness) of AI responses",
                        }, { temperature })}
                        focused={option === 'temperature'}>
            <Slider value={temperature} onChange={onTemperatureChange} step={0.1} min={0} max={1} precision={3} />
            <p>
                <FormattedMessage defaultMessage="The temperature parameter controls the randomness of the AI's responses. Lower values will make the AI more predictable, while higher values will make it more creative." />
            </p>
        </SettingsOption>
    ), [temperature, option, onTemperatureChange]);

    const top_pOption = useMemo(() => (
        <SettingsOption heading={intl.formatMessage({
                            defaultMessage: "Top_p: {top_p, number, ::.0}", 
                            description: "Label for the button that opens a modal for setting the 'temperature' (randomness) of AI responses",
                        }, { top_p })}
                        focused={option === 'top_p'}>
            <Slider value={top_p} onChange={onTop_pChange} step={0.1} min={0} max={1} precision={3} />
            <p>
                <FormattedMessage defaultMessage="The temperature parameter controls the randomness of the AI's responses. Lower values will make the AI more predictable, while higher values will make it more creative." />
            </p>
        </SettingsOption>
    ), [top_p, option, onTop_pChange]);

    const maxtokenOption = useMemo(() => (
        <SettingsOption
            heading={intl.formatMessage(
                {
                    defaultMessage: "maxtoken: {maxtoken, number, 400}",
                    description: "use query maxtoken size.",
                },
                { maxtoken }
            )}
            focused={option === 'maxtoken'}>
            {/* <Slider value={maxtoken} onChange={onMaxtokenChange} step={100} min={100} max={4000} precision={3} /> */}
            <input
                type="number"
                value={maxtoken}
                onChange={onMaxtokenChange}
                min={100}
                max={4000}
            />
            <p>
                <FormattedMessage defaultMessage="「Max Token」とは、テキスト内トークン（単語、句読点、特殊文字など）の処理可能な総数を指します。トークン数は、言語モデルがテキストを処理する際の計算負荷や、テキストの長さを評価するために使用されます。例えば、次の文章を考えてみましょう:「これはテストです。」この文章は次のトークンに分割されます。[これは][テスト][です][。]この場合、トークン数は4です。言語モデルがこの文章を解析する際には、4つのトークンをそれぞれ処理します。言語モデルの性能や応答速度は、トークン数に影響されます。処理すべきトークン数が多ければ多いほど、モデルがテキストを理解し、適切な回答を生成するのに時間がかかります。また、トークン数が多い場合、モデルが必要とする計算リソースも増えます。" />
            </p>
        </SettingsOption>
    ), [maxtoken, option, onMaxtokenChange]);

    const includedOption = useMemo(() => (
        <SettingsOption heading={intl.formatMessage({
                            defaultMessage: "included: {included, number, 5}", 
                            description: "past before massages.",
                        }, { included })}
                        focused={option === 'included'}>
            {/* <Slider value={included} onChange={onIncludedChange} step={1} min={1} max={10} precision={3} /> */}
            <input
                type="number"
                value={included}
                onChange={onIncludedChange}
                min={1}
                max={10}
            />
            <p>
                <FormattedMessage defaultMessage="過去のメッセージの数を示す「past Messages Included」は、AIがどれだけの過去の対話情報を考慮に入れるかを示しています。これにより、適切な応答を生成するためのコンテキストが提供され、ユーザーとの自然な会話が可能になります。" />
            </p>
        </SettingsOption>
    ), [included, option, onIncludedChange]);

    const elem = useMemo(() => (
        <SettingsTab name="options">
            {systemPromptOption}
            {endpointOption}
            {modelOption}
            {versionOption}
            {temperatureOption}
            {top_pOption}
            {maxtokenOption}
            {includedOption}
        </SettingsTab>
    ), [systemPromptOption, endpointOption, modelOption, versionOption,temperatureOption, top_pOption,maxtokenOption, includedOption]);

    return elem;
}