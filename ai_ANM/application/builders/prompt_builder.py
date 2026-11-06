from application.models.agent_context import AgentContext


class PromptBuilder:

    @staticmethod
    def build(context: AgentContext) -> str:

        prompt = context.message

        if context.retrieved_docs:

            references = "\n\n".join(
                doc.content
                for doc in context.retrieved_docs
            )

            prompt = f"""
Tài liệu:

{references}

----------------

Câu hỏi:

{context.message}
"""

        return prompt