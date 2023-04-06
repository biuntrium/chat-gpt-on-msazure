# Chatra

![icon](./app/public/logo192.png)

Chatra is an open-source, unofficial ChatGPT app with extra features and more ways to customize your experience.

This application accesses the Azure OpenAI Service and provides a user interface similar to OpenAI's ChatGPT.

The biggest difference between OpenAI's ChatGPT and this application is that you can freely change parameters like Temperature and Top_p. This is provided by the Azure OpenAI Service, and you can make changes to the settings through a graphical user interface (GUI).

Try [self-host with Docker](#running-on-your-own-computer).

### Azure OpenAI deploy

First, please deploy the GPT model in Azure OpenAI Service. At that time, make a note of the resource name and deployment name.

[Azure OpenAI Service](https://azure.microsoft.com/ja-jp/products/cognitive-services/openai-service)
[Azure OpenAI Quickstart Documentation](https://learn.microsoft.com/ja-jp/azure/cognitive-services/openai/chatgpt-quickstart?tabs=command-line&pivots=rest-api)

## Running on your own computer

To run on your own device, you can use Docker:

```
docker-compose build
```

```
docker run -v $(pwd)/data:/app/data -p 3000:3000 chatra_app:latest
```

Then navigate to http://localhost:3000 to view the app.

## License

This project was forked from the [chat with gpt](https://github.com/cogentapps/chat-with-gpt/tree/main/app/public).
Chatra is licensed under the MIT license. See the LICENSE file for more information.
