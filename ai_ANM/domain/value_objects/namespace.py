from enum import Enum


class Namespace(str, Enum):
    """
    Namespace trong Pinecone.
    """

    LAW = "law"

    SCAM = "scam"

    KNOWLEDGE = "knowledge"