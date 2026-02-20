"""Generate claim assessment summaries using OpenAI."""

import os


def generate_summary(
    fraud_probability: float,
    is_fraud: bool,
    features: dict[str, str | int | float],
) -> str:
    """Call OpenAI to generate a brief summary of the fraud assessment."""
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        return _fallback_summary(is_fraud)

    try:
        from openai import OpenAI

        client = OpenAI(api_key=api_key)

        status = "Fraud likely" if is_fraud else "Low risk"
        feature_list = ", ".join(f"{k}: {v}" for k, v in sorted(features.items()))

        prompt = f"""You are an insurance fraud analyst. Based on this claim assessment, write a brief 2-3 sentence summary for a claims adjuster. Be clear and professional.

Assessment:
- Risk score (fraud probability): {fraud_probability:.2f}
- Status: {status}

Claim features: {feature_list}

Write a concise summary of the assessment."""

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "You write brief, professional summaries for insurance claims assessments.",
                },
                {"role": "user", "content": prompt},
            ],
            max_tokens=150,
        )
        summary = response.choices[0].message.content or ""
        return summary.strip() if summary else _fallback_summary(is_fraud)
    except Exception:
        return _fallback_summary(is_fraud)


def _fallback_summary(is_fraud: bool) -> str:
    if is_fraud:
        return "The model predicts a high probability of fraud for this claim. This assessment is driven by elevated risk indicators in the selected features."
    return "The model predicts a low probability of fraud for this claim. Most signals fall within expected ranges, lowering the overall risk."
