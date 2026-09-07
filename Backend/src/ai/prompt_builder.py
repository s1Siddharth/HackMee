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

IMPORTANT FORMATTING RULES:
1. Keep the output concise, crisp, and executive-ready.
2. Use short bullet points with bold key metrics (e.g. **Age: 49.8 yrs**, **Low Risk: 50%**).
3. Do not output long dense paragraphs.
4. Do not invent numbers; use only supplied evidence.

Return the response strictly formatted under these markdown section headers:

**EXECUTIVE SUMMARY**
* [1-2 concise bullet points summarizing population and primary outcome]

**KEY FINDINGS**
* [Short bullet with bold key metric: value]
* [Short bullet with bold key metric: value]

**RISKS**
* [Short bullet with identified risk factor]
* [Short bullet with identified risk factor]

**RECOMMENDATIONS**
* [Actionable bullet point]
* [Actionable bullet point]

EVIDENCE:
{evidence_json}
"""