import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";
import { cn } from "@/lib/utils";

interface InstallPWAProps {
  className?: string;
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
}

export function InstallPWA({
  className,
  variant = "outline",
  size = "sm",
}: InstallPWAProps) {
  const { deferredPrompt, promptToInstall, isAppInstalled } =
    useInstallPrompt();

  // If already installed or browser hasn't fired the event, don't show anything
  if (!deferredPrompt || isAppInstalled) return null;

  return (
    <Button
      variant={variant}
      size={size}
      className={cn("gap-2", className)}
      onClick={promptToInstall}
    >
      <Download className="h-4 w-4" />
      <span>Install App</span>
    </Button>
  );
}
