export const tools = [
  {
    id: "semgrep",
    name: "Semgrep",
    type: "repository",
    description:
      "Static analysis tool for finding bugs and enforcing code standards",
  },
  {
    id: "zap",
    name: "OWASP ZAP",
    type: "deployed",
    description:
      "Security scanner for finding vulnerabilities in web applications",
  },
  {
    id: "trivy",
    name: "Trivy",
    type: "repository",
    description:
      "Scanner for vulnerabilities in container images and filesystems",
  },
  {
    id: "gitleaks",
    name: "Gitleaks",
    type: "repository",
    description:
      "Detects hardcoded secrets and sensitive information in git repos",
  },
  {
    id: "trufflehog",
    name: "Trufflehog",
    type: "repository",
    description: "Scans for secrets in git repositories",
  },
  {
    id: "checkov",
    name: "Checkov",
    type: "repository",
    description: "Static code analyzer for infrastructure-as-code",
  },
  {
    id: "nikto",
    name: "Nikto",
    type: "deployed",
    description: "Web server scanner for dangerous files and outdated software",
  },
  {
    id: "grype",
    name: "Syft/Grype",
    type: "repository",
    description: "Vulnerability scanner for container images and file systems",
  },
  {
    id: "k6_local",
    name: "k6 (Local)",
    type: "repository",
    description: "Performance Testing.",
  },
  {
    id: "k6_deployed",
    name: "k6 (Deployed)",
    type: "deployed",
    description: "Performance Testing",
  },
];

export const toolIdToApiMapping = {
  semgrep: "semgrep",
  zap: "zap",
  trivy: "trivy",
  gitleaks: "gitleaks",
  trufflehog: "trufflehog",
  checkov: "checkov",
  nikto: "nikto",
  grype: "grype",
  k6_local: "k6-local",
  k6_deployed: "k6-deployed",
};

export const severityColors = {
  critical: "bg-red-600 text-white",
  high: "bg-red-500 text-white",
  medium: "bg-yellow-500 text-black",
  low: "bg-green-500 text-white",
  info: "bg-gray-500 text-white",
};

export const severityFilters = [
  { id: "critical", label: "Critical", color: "bg-red-500" },
  { id: "high", label: "High", color: "bg-orange-500" },
  { id: "medium", label: "Medium", color: "bg-yellow-500" },
  { id: "low", label: "Low", color: "bg-green-500" },
  { id: "info", label: "Info", color: "bg-blue-500" },
];
