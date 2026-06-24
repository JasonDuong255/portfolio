import {
  defaultWebUiContent,
  type PortfolioContent
} from "@/lib/portfolio/schema";

export const defaultPortfolioContent: PortfolioContent = {
  profile: {
    name: "M. Choice",
    handle: "@m_choice",
    title: "Pixel Artist & Game Designer",
    tagline: "Characters, tiny worlds, UI sprites, and game-ready charm.",
    avatarUrl: "/assets/m-choice-avatar.png",
    heroImageUrl: "/assets/m-choice-hero.png",
    logoText: "PORTFOLIO",
    logoSubtext: "M. CHOICE",
    desktopName: "CHOICE_OS"
  },
  contacts: [
    {
      id: "email",
      type: "email",
      label: "Mail",
      value: "mchoicegd@gmail.com",
      href: "mailto:mchoicegd@gmail.com"
    },
    {
      id: "linkedin",
      type: "linkedin",
      label: "LinkedIn",
      value: "@mchoice",
      href: "https://www.linkedin.com/"
    },
    {
      id: "behance",
      type: "behance",
      label: "Behance",
      value: "@m_choice",
      href: "https://www.behance.net/"
    },
    {
      id: "instagram",
      type: "instagram",
      label: "Instagram",
      value: "@m.choice_",
      href: "https://www.instagram.com/"
    }
  ],
  about: {
    windowTitle: "About_Me.txt",
    paragraphs: [
      "I'm Choice, a digital artist specialized in pixel art. I create characters, environments, objects, animations, and tiny interface details for games.",
      "I grew up around digital games, then found drawing as a way to step inside those worlds instead of only playing through them.",
      "My work is focused, versatile, and fast-moving: a mix of playful sprites, readable silhouettes, and small moments that make a screen feel alive.",
      "My professional goal is to work in a game studio, improve my craft, and keep building worlds that feel handmade."
    ]
  },
  presentation: {
    windowTitle: "Apresentation.txt",
    education: [
      "Studying Design - UCDB (Catholic University of Dom Bosco) 2024-2026",
      "Game Designer and Unity Developer - EBAC 2023 (Studying)",
      "Domestika - Character Design for Animation in Games 2023"
    ],
    software: [
      { name: "Photoshop", level: 5 },
      { name: "Aseprite", level: 4 },
      { name: "Unity 2D", level: 3 }
    ],
    mainSkills: [
      "English and Portuguese knowledge",
      "Teamwork",
      "Fast self-learning",
      "Versatility"
    ]
  },
  projects: [
    {
      id: "sprites",
      title: "Sprite Pack 01",
      subtitle: "Game-ready character loop",
      description: "Idle, walk, hit, and blink frames with a restrained palette for easy in-engine readability.",
      imageUrl: "/assets/m-choice-about.png",
      href: "https://www.behance.net/",
      tags: ["Aseprite", "Animation", "Character"]
    },
    {
      id: "ui",
      title: "Nebula OS",
      subtitle: "Pixel interface kit",
      description: "Window chrome, icons, scrollbars, taskbar states, and a tiny desktop language for a game menu.",
      imageUrl: "/assets/m-choice-presentation.png",
      href: "https://www.behance.net/",
      tags: ["UI", "Pixel Art", "Game Menu"]
    },
    {
      id: "scene",
      title: "Soft Orbit",
      subtitle: "Environment study",
      description: "A starfield composition built from chunky shadows, magenta light, and low-resolution texture.",
      imageUrl: "/assets/m-choice-hero.png",
      href: "https://www.behance.net/",
      tags: ["Environment", "Palette", "Dither"]
    }
  ],
  theme: {
    name: "Nebula Candy CRT",
    backgroundImageUrl: "/assets/m-choice-hero.png",
    colors: {
      space: "#070313",
      ink: "#09070f",
      panel: "#6f3aa6",
      panelSoft: "#8a52c0",
      chromeStart: "#ff63e6",
      chromeEnd: "#9b21d4",
      accent: "#ff7adf",
      accentAlt: "#68e8ff",
      text: "#fff7ff",
      muted: "#d8b7ef",
      line: "#d9a7ff",
      glow: "rgba(255, 99, 230, 0.42)"
    },
    scanlineOpacity: 0.22,
    pixelScale: 2
  },
  ui: defaultWebUiContent
};
