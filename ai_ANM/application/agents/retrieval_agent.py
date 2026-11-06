from application.models.evidence import Evidence


class RetrievalAgent:

    def __init__(self):
        # Không cần truyền các tool vào đây nữa vì ToolExecutor đã đảm nhận việc gọi tool
        pass

    async def merge(
        self,
        evidences: list[Evidence],
    ) -> Evidence:
        
        merged_sources = []
        merged_documents = []

        for evidence in evidences:
            if evidence:
                # Gộp các sources
                if hasattr(evidence, 'sources') and evidence.sources:
                    merged_sources.extend(evidence.sources)
                
                # Gộp các documents
                if hasattr(evidence, 'documents') and evidence.documents:
                    merged_documents.extend(evidence.documents)

        # Loại bỏ các source trùng lặp (nếu có)
        merged_sources = list(set(merged_sources))

        return Evidence(
            sources=merged_sources,
            documents=merged_documents,
        )