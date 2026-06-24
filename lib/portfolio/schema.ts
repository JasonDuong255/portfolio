import { z } from "zod";

export const themeSchema = z.object({
  name: z.string().min(1),
  colors: z.object({
    space: z.string().min(1),
    ink: z.string().min(1),
    panel: z.string().min(1),
    panelSoft: z.string().min(1),
    chromeStart: z.string().min(1),
    chromeEnd: z.string().min(1),
    accent: z.string().min(1),
    accentAlt: z.string().min(1),
    text: z.string().min(1),
    muted: z.string().min(1),
    line: z.string().min(1),
    glow: z.string().min(1)
  }),
  scanlineOpacity: z.number().min(0).max(0.35),
  pixelScale: z.number().min(1).max(4)
});

export const contactSchema = z.object({
  id: z.string().min(1),
  type: z.enum(["email", "linkedin", "behance", "instagram", "github", "website"]),
  label: z.string().min(1),
  value: z.string().min(1),
  href: z.string().min(1)
});

export const skillRatingSchema = z.object({
  name: z.string().min(1),
  level: z.number().int().min(0).max(5)
});

export const projectSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  subtitle: z.string().min(1),
  description: z.string().min(1),
  imageUrl: z.string().min(1),
  href: z.string().min(1),
  tags: z.array(z.string().min(1))
});

export const portfolioContentSchema = z.object({
  profile: z.object({
    name: z.string().min(1),
    handle: z.string().min(1),
    title: z.string().min(1),
    tagline: z.string().min(1),
    avatarUrl: z.string().min(1),
    heroImageUrl: z.string().min(1),
    logoText: z.string().min(1),
    logoSubtext: z.string().min(1),
    desktopName: z.string().min(1)
  }),
  contacts: z.array(contactSchema),
  about: z.object({
    windowTitle: z.string().min(1),
    paragraphs: z.array(z.string().min(1))
  }),
  presentation: z.object({
    windowTitle: z.string().min(1),
    education: z.array(z.string().min(1)),
    software: z.array(skillRatingSchema),
    mainSkills: z.array(z.string().min(1))
  }),
  projects: z.array(projectSchema),
  theme: themeSchema
});

export type PortfolioContent = z.infer<typeof portfolioContentSchema>;
export type PortfolioTheme = z.infer<typeof themeSchema>;
