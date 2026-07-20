"""
Prompt Builder V6 (Optimized)

Author: Anti Scam Detector
"""

from __future__ import annotations

from app.domain.entities.collector import CollectorResult
from app.presentation.api.schemas.evidence_result import EvidenceResult


class PromptBuilder:
    """
    Prompt Builder
    """

    def build(
        self,
        collector: CollectorResult,
        evidences: EvidenceResult,
    ) -> str:

        prompt = [
            self._system(),
            self._website(collector),
            self._evidence(evidences),
            self._output()
        ]

        return "\n\n".join(prompt)

    # ==========================================================
    # SYSTEM
    # ==========================================================

    def _system(self):
        return """
You are an expert cybersecurity analyst and online fraud investigator.
Classify the website risk based ONLY on the provided factual observations.

# Core Principles
- Evaluate holistic risk: cybersecurity, phishing, fraud, financial, and user safety.
- Technical security (HTTPS, Cloudflare, CDN, valid SSL, professional design, fast loading, normal hosting) does NOT prove a website is safe.
- Do NOT classify as malicious based on a single weak observation (e.g., login page, OTP, new domain, QR code). Multiple indicators are required.
- Default to "suspicious" if evidence is weak, incomplete, or conflicting.
- Never invent evidence.

# High-Risk Categories
Websites primarily involving phishing, credential theft, fake banking/government, malware, ransomware, online gambling, casino, betting, Ponzi schemes, fake investments/crypto/exchanges, and loan/romance/tech support scams normally MUST NOT be classified as "safe" unless strongly contradicted by evidence.

# Examples
- Programming tutorials -> safe
- News website, limited evidence -> suspicious
- Bank login on a suspicious domain -> malicious
- Football betting platform -> malicious
- Investment platform promising guaranteed profit -> malicious
- E-commerce with valid payment, clear info, stable domain -> safe
"""

    # ==========================================================
    # WEBSITE
    # ==========================================================

    def _website(
        self,
        collector: CollectorResult,
    ):
        title = collector.title or "Unknown"
        url = collector.final_url or "Unknown"

        return f"""
# Website
URL: {url}
Title: {title}
"""

    # ==========================================================
    # EVIDENCE
    # ==========================================================

    def _evidence(
        self,
        evidences: EvidenceResult,
    ):
        lines = ["# Observed Evidence"]

        if not evidences:
            lines.append("- No evidence collected.")
            return "\n".join(lines)

        for group in evidences:
            detector = getattr(group, "detector", "Unknown")
            lines.append(f"\n[{detector}]")

            if len(group) == 0:
                lines.append("- No observations.")
                continue

            for evidence in group:
                evidence_type = getattr(evidence, "type", "Unknown")
                name = getattr(evidence, "name", "")
                value = getattr(evidence, "value", "")
                location = getattr(evidence, "location", "")

                lines.append(f"- {evidence_type} | {name} | {value} | {location}")

                context = getattr(evidence, "context", None)
                if context:
                    lines.append(f"  Context: {context}")

        return "\n".join(lines)

    # ==========================================================
    # OUTPUT
    # ==========================================================

    def _output(self):
        return """
# Output Requirements
Return ONLY valid JSON. Do NOT return markdown. Do NOT explain anything outside JSON.

{
    "analysis_type": "LLM",
    
    // 0-20: Legitimate/Safe. 21-40: Minor concerns. 41-60: Suspicious. 61-80: High-risk/Fraud. 81-100: Malicious/Theft.
    "risk_score": 0,
    
    // Choose exactly one.
    "status": "safe | suspicious | malicious",
    
    // Low: risk_score <= 20. Medium: 21-60. High: 61-100.
    "level": "Low | Medium | High",
    
    // 0.0 to 1.0. Reflect confidence based ONLY on provided evidence strength.
    "confidence": 0.0,
    
    // Choose exactly ONE primary category: banking, shopping, education, government, technology, blog, news, social, forum, business, finance, gambling, casino, crypto, investment, loan, phishing, malware, scam, unknown.
    "categories": [
        "..."
    ],
    
    // 2-5 short Vietnamese phrases (2-5 words each). Factual observations only, no explanation. (e.g., "Yêu cầu đăng nhập", "Tên miền mới").
    "indicators": [
        "..."
    ],
    
    // EXACTLY ONE Vietnamese sentence. Max 25 words. Simple language. Mention: website purpose + main observation + concise conclusion. Do NOT mention AI, confidence, or internal analysis.
    "reason": [
        "..."
    ]
}
"""