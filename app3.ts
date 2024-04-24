import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "langchain/prompts";
import { RunnableLambda, RunnableSequence } from "langchain/runnables";
import { JsonOutputParser, StringOutputParser } from "langchain/schema/output_parser";

const model = new ChatOpenAI({
  model: "gpt-3.5-turbo",
  apiKey: process.env.OPENAI_API_KEY
});


const prompt = PromptTemplate.fromTemplate(`
  What is my input ? Input is {text}.
  But, I know that I got ignored by the next lambda.
`)

const outputParser = new StringOutputParser()
const jsonParser = new JsonOutputParser()

const lambda1 = new RunnableLambda<void, {
  text: string
}>({
  func: () => ({ text: 'This input will be ignored by lambda2.' })
})

const lambda2 = new RunnableLambda<string, string>({
  func: (s) => `What is the result of 1 + 1 ? Please answer on JSON format like "{"result":2}".`
})

const lambda3 = new RunnableLambda<string, string>({
  func: (s) => {
    console.log("on lambda3",s)
    return s
  }
})


const chain = RunnableSequence.from([
  lambda1, // パラメーターを受け取らず、text key を持つオブジェクトを返す
  prompt, // text key を持つオブジェクトを受取り、フォーマットした文字列を返す
  lambda2, // 入力を無視し、独自のテキストを返す
  model, // 入力を受け取り、モデルによる生成結果を返却する
  outputParser, // モデルに夜生成結果を受取り、文字列に変換する返却する
  lambda3, // 入力を受け取り、ログを出力し、入力をそのまま返却する
  jsonParser, // 受け取った文字列を json にパースした結果を返却する
])

const result = await chain.invoke()
// 最終的に、パースされた javascript オブジェクトが得られる
console.log(result)