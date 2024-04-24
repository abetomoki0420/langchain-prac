import { RunnableLambda } from "langchain/runnables";

const lambda1 = new RunnableLambda<number, number>({
  func: (x) => x + 1,
})

const lambda2 = new RunnableLambda<number, number>({
  func: (x) => x + 2
})

const chain = lambda1.pipe(lambda2)
const output = await chain.invoke(1)

console.log(output)