import { Shield, Key, AlertTriangle } from "lucide-react";

export const ToolIcon = ({ toolName }: { toolName: string }) => {
  switch (toolName.toLowerCase()) {
    case "nikto":
      return <Shield className="w-4 h-4" />;
    case "trufflehog":
      return <Key className="w-4 h-4" />;
    default:
      return <AlertTriangle className="w-4 h-4" />;
  }
};
