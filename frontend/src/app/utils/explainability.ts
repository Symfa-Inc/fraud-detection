const normalizeFeatureName = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]/g, "");

export function formatExplainabilityValue(name: string, value: string): string {
  const normalizedName = normalizeFeatureName(name);

  const isBinary =
    normalizedName === "higheducationind" ||
    normalizedName === "highereducation" ||
    normalizedName === "higheducation" ||
    normalizedName === "witnesspresentind" ||
    normalizedName === "witnesspresent";

  if (isBinary) {
    if (value === "1") {
      return "Yes";
    }
    if (value === "0") {
      return "No";
    }
  }

  return value;
}
