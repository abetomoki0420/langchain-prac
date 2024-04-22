import { TavilySearchResults } from "@langchain/community/tools/tavily_search"
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai"
import { AgentExecutor, createOpenAIFunctionsAgent } from "langchain/agents"
import { CheerioWebBaseLoader } from "langchain/document_loaders/web/cheerio"
import { pull } from "langchain/hub"
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter"
import { createRetrieverTool } from "langchain/tools/retriever"
import { MemoryVectorStore } from "langchain/vectorstores/memory"

const loader = new CheerioWebBaseLoader(
  "https://www.producthunt.com"
)

const docs = await loader.load()

const splitter = new RecursiveCharacterTextSplitter()

const splitDocs = await splitter.splitDocuments(docs)

const embedding = new OpenAIEmbeddings()

const vectorstore = await MemoryVectorStore.fromDocuments(splitDocs, embedding)

const retriever = vectorstore.asRetriever()

const retrievalTool = await createRetrieverTool(retriever, {
  name: "producthunt_search",
  description:
    "Search for information about the product. For any questions about Producthunt, you must use this tool!",
})

const searchTool = new TavilySearchResults({
  maxResults: 1,
  apiKey: process.env.TAVILY_API_KEY,
})

const tools = [retrievalTool, searchTool]

const agentPropmt = await pull("hwchase17/openai-functions-agent")

if (!agentPropmt) {
  throw new Error("Prompt not found")
}

const chatModel = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const agent = await createOpenAIFunctionsAgent({
  llm: chatModel,
  tools,
  prompt: agentPropmt,
})

const agentExecutor = new AgentExecutor({
  agent,
  tools,
  // verbose: true,
})

const agentResult = await agentExecutor.invoke({
  input: "Please show today's popular products.",
})

console.log(agentResult.output)
