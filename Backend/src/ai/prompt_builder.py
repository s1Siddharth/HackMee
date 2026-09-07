from __future__ import annotations

import json


class InsightPromptBuilder:
    """Build evidence-grounded prompts for the LLM."""

    @staticmethod
    def build(evidence: dict) -> str:
        """Create an analysis prompt from computed evidence."""

        evidence_json = json.dumps(
            evidence,
            indent=2,
            default=str,
        )

        return f"""
Analyze the following dataset evidence.

IMPORTANT RULES:

1. Use only the supplied evidence.
2. Do not invent numbers.
3. Do not claim causation unless the evidence supports it.
4. Highlight meaningful trends and patterns.
5. Identify potential risks.
6. Provide practical business recommendations.
7. If the evidence is insufficient for a conclusion,
   explicitly say so.

Return the response using these sections:

EXECUTIVE SUMMARY

KEY FINDINGS

RISKS

RECOMMENDATIONS

EVIDENCE:

{evidence_json}
"""