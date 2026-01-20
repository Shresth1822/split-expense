import { useState, useEffect } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

  const [showInstructions, setShowInstructions] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    setIsIOS(
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream,
    );
  }, []);

  // If already installed, hide the button
  if (isAppInstalled) return null;

  const handleClick = () => {
    if (deferredPrompt) {
      promptToInstall();
    } else {
      setShowInstructions(true);
    }
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={cn("gap-2", className)}
        onClick={handleClick}
      >
        <Download className="h-4 w-4" />
        <span>Install App</span>
      </Button>

      <Dialog open={showInstructions} onOpenChange={setShowInstructions}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Install Splitify</DialogTitle>
            <DialogDescription>
              Install this application on your home screen for quick and easy
              access.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {isIOS ? (
              <div className="space-y-2">
                <p>
                  1. Tap the Share button <span className="text-xl">⎋</span> in
                  Safari menu.
                </p>
                <p>
                  2. Scroll down and tap <strong>Add to Home Screen</strong>{" "}
                  <span className="text-xl">➕</span>.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <p>
                  1. Tap the three dots menu <span className="text-xl">⋮</span>{" "}
                  in Chrome/Edge.
                </p>
                <p>
                  2. Tap <strong>Install Splitify</strong> or{" "}
                  <strong>Add to Home screen</strong>.
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
