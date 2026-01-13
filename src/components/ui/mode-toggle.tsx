import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ui/theme-provider";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  // If theme is system, we might need a way to know resolved theme, but for toggle simplicity:
  // We just toggle to the opposite. If system->dark, we go light. If system->light, we go dark.
  // For icon display: If explicit 'dark', show Moon. If 'light', show Sun.
  // If 'system', we rely on CSS classes or just show Sun (default) as most systems light?
  // Actually, let's just use CSS classes but SIMPLIFIED.
  // The User wants: Night Mode -> Moon. Light Mode -> Sun.

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className="relative"
    >
      {theme === "dark" ? (
        <Moon className="h-[1.2rem] w-[1.2rem]" />
      ) : (
        <Sun className="h-[1.2rem] w-[1.2rem]" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
