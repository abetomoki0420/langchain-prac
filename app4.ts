import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "langchain/prompts";
import { RunnableLambda, RunnableSequence } from "langchain/runnables";
import { StringOutputParser } from "langchain/schema/output_parser";

const model = new ChatOpenAI({
  model: "gpt-3.5-turbo",
  apiKey: process.env.OPENAI_API_KEY
});


const prompt = PromptTemplate.fromTemplate(`
  instruction"""
  You are Kansai dialect transformer.
  When you receive a text, you will transform it into Kansai dialect.
  e.g "Hello" -> "おおきに"
  """

  context"""
    {input}
  """

  You should response a single text.
`)

const outputParser = new StringOutputParser()

const outputFormatRunnable = new RunnableLambda<string, string>({
  func: (s) => `これが変換結果やで『${s}』！`
})

const chain = RunnableSequence.from([
  prompt,
  model,
  outputParser,
  outputFormatRunnable
])

const result = await chain.invoke({
  input: "このうなぎ美味しいね！　また食べたいなぁ"
})

console.log(result)
