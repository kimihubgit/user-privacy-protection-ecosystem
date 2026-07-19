import asyncio

from config.di_container import law_agent
from application.models.agent_context import AgentContext


async def main():

    agent = law_agent()

    context = AgentContext(
        message="Tội lừa đảo chiếm đoạt tài sản theo Điều 174 là gì?",
        history=[],
        retrieved_docs=[],
        metadata={},
    )

    response = await agent.run(context)

    print("=" * 80)
    print(response.reply)
    print("=" * 80)

    print("\nRetrieved Docs:", len(context.retrieved_docs))

    for i, doc in enumerate(context.retrieved_docs, start=1):
        print(f"\n----- Document {i} -----")
        print("Score :", doc.score)
        print("Source:", doc.source)
        print(doc.content[:500])


if __name__ == "__main__":
    asyncio.run(main())