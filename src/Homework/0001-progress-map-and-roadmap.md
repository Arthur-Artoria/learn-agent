# 用自己的话（不看代码）默写 tool calling 的五步

1. tool 定义
   1. name 应是以动词开头的短语，例如：get_weather、query_order、search_keyword等等
   2. description 应当描述工具的作用，入参以及返回内容
   3. parameter 定义了入参的格式，应当使用 additionalProperties: false，来约束 LLM 的推理
2. tool 与用户的 input 一起发送给 LLM
3. LLM 会返回带有 tool_call 的消息，并包含格式化的参数
4. 根据返回的消息进行正确的函数调用，然后将结果和之前的输入、输出一同发送给 LLM
5. 将 LLM 生成的最后结果展示给用户
