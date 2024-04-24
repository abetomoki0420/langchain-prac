import { ChatOpenAI } from "@langchain/openai";
import { AgentExecutor, createOpenAIFunctionsAgent } from "langchain/agents";
import { pull } from "langchain/hub";
import { ChatPromptTemplate } from "langchain/prompts";
import { DynamicStructuredTool, DynamicTool } from "langchain/tools";
import { z } from "zod";

const addOne = (x: number) => x + 1;

const model = new ChatOpenAI({
  model: "gpt-3.5-turbo",
});

const addOneTool = new DynamicStructuredTool({
  name: "addOne",
  description: "Adds one to a number",
  schema: z.object({
    x: z.number().describe("The number to add one to"),
  }),
  func: async ({ x }) => addOne(x).toString(),
})

const getTodayTool = new DynamicTool({
  name: "getToday",
  description: "get today's date as the format of 'YYYY-MM-DD'",
  func: async () => new Date().toISOString().split("T")[0],
})

const ultimateFunnyJokeGenerator = new DynamicTool({
  name: "generate-ulitmate-funny-joke",
  description: "generate the ultimate funny joke in the universe",
  func: async () => '布団がふっとんだ'
})

const prompt2 = await pull<ChatPromptTemplate>(
  "hwchase17/openai-functions-agent"
);

const agent2 = await createOpenAIFunctionsAgent({
  llm: model,
  tools: [
    addOneTool,
    getTodayTool,
    ultimateFunnyJokeGenerator
  ],
  prompt: prompt2,
})

const agentExecutor2 = new AgentExecutor({
  agent: agent2,
  tools:[
    addOneTool,
    getTodayTool,
    ultimateFunnyJokeGenerator
  ],
  verbose: true,
})

const result2 = await agentExecutor2.invoke({
  input: "めちゃくちゃ面白いジョークを教えて",
})

console.log(result2.output);