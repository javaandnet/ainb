const https = require("https");
//定义函数，没啥用，实际运用
function getCurrentWeather(location, unit = "fahrenheit") {
  let weather_info = {
    location: location,
    temperature: "unknown",
    unit: unit,
  };

  if (location.toLowerCase().includes("tokyo")) {
    weather_info = { location: "Tokyo", temperature: "10", unit: "celsius" };
  } else if (location.toLowerCase().includes("san francisco")) {
    weather_info = {
      location: "San Francisco",
      temperature: "72",
      unit: "fahrenheit",
    };
  } else if (location.toLowerCase().includes("paris")) {
    weather_info = { location: "Paris", temperature: "22", unit: "fahrenheit" };
  }

  return JSON.stringify(weather_info);
}
/**
 * 
 * @returns 核心 进行转义
 */
async function runConversation() {
  var msg = "What's the weather like in San Francisco, Tokyo, and Paris?";
  //测试用信息
  const messages = [
    {
      role: "user",
      content:msg
    },
  ];
  //配置，可以改成动态的，或者保存文件 进行热更新 json.parse?
  const tools = [
    {
      type: "function",
      function: {
        name: "get_current_weather",//函数
        description: "Get the current weather in a given location",
        parameters: {
          type: "object",
          properties: {//参数说明
            location: {
              type: "string",
              description: "The city and state, e.g. San Francisco, CA",
            },
            unit: { type: "string", enum: ["celsius", "fahrenheit"] },//摄氏度，华氏度 参数
          },
          required: ["location"],//必须
        },
      },
    },
  ];

  const requestData = JSON.stringify({
    model: "gpt-3.5-turbo",
    messages: messages,
    tools: tools, //将配置保存为固定文件？
    tool_choice: "auto", //自动选择
  });

   //没啥用,请求例子
  const options = {
    hostname: "api.openai.com",
    path: "/v1/chat/completions",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer sk-xxxxxxxxx", // Replace with your OpenAI API key
    },
  };

  //定义返回函数
  const response = await new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = "";
      //拼接字符串，等着可以查看 是否一个字一个字出来
      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        resolve(JSON.parse(data));
      });
    });

    req.on("error", (error) => {
      reject(error);
    });

    req.write(requestData);
    req.end();
  });

  //里面应有choices，各种信息
  const responseMessage = response.choices[0].message;

  if (responseMessage.tool_calls) {
    const toolCalls = responseMessage.tool_calls;//智能返回值
    //用户自定义的，可以动态追加
    const availableFunctions = {
      get_current_weather: getCurrentWeather,
    };
    //往第一次请求中再次添加 2遍？
    messages.push(responseMessage);

    //本质第一步是用chatapp 来智能判断是否使用函数
    const functionResponses = await Promise.all(
      toolCalls.map(async (toolCall) => {
        const functionName = toolCall.function.name;
        const functionArgs = JSON.parse(toolCall.function.arguments);
        const functionToCall = availableFunctions[functionName];//根据返回值判断使用哪一个函数，此处可灵活使用
        const functionResponse = functionToCall(
          functionArgs.location, //分解后的参数
          functionArgs.unit
        );
        return {
          tool_call_id: toolCall.id,
          role: "tool",
          name: functionName,
          content: functionResponse,
        };
      })
    );
  //继续加？ 修改返回的tool_calls，之后 再加
    messages.push(...functionResponses);
    //信息报表
    const secondRequestData = JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: messages,
    });

    //第二次请求，没有太多东西
    const secondResponse = await new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          resolve(JSON.parse(data));
        });
      });

      req.on("error", (error) => {
        reject(error);
      });

      req.write(secondRequestData);
      req.end();
    });

    return secondResponse;
  }
}

//纯为了查看
runConversation()
  .then((response) => {
    const messageContent = response.choices[0].message.content;
    console.log(messageContent);
  })
  .catch((error) => {
    console.error(error);
  });