import type { PortfolioTheme } from "@/lib/portfolio/schema";

export function ThemeStyle({ theme }: { theme: PortfolioTheme }) {
  const css = `
    :root {
      --space: ${theme.colors.space};
      --ink: ${theme.colors.ink};
      --panel: ${theme.colors.panel};
      --panel-soft: ${theme.colors.panelSoft};
      --chrome-start: ${theme.colors.chromeStart};
      --chrome-end: ${theme.colors.chromeEnd};
      --accent: ${theme.colors.accent};
      --accent-alt: ${theme.colors.accentAlt};
      --text: ${theme.colors.text};
      --muted: ${theme.colors.muted};
      --line: ${theme.colors.line};
      --glow: ${theme.colors.glow};
      --scanline-opacity: ${theme.scanlineOpacity};
      --pixel-scale: ${theme.pixelScale};
    }
  `;

  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}
