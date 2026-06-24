"use client";

import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useMemo,
  useState
} from "react";
import {
  ChevronDown,
  FolderKanban,
  Image as ImageIcon,
  Monitor,
  Palette,
  Plus,
  RefreshCw,
  RotateCcw,
  Save,
  Trash2,
  Upload,
  UserRound
} from "lucide-react";
import type {
  PortfolioContent,
  PortfolioTheme,
  PortfolioThemePreset
} from "@/lib/portfolio/schema";

type SaveState = {
  ok: boolean;
  message: string;
};

type SectionId = "design" | "ui" | "portfolio";
type ContactType = PortfolioContent["contacts"][number]["type"];
type ThemeColor = keyof PortfolioContent["theme"]["colors"];
type PortfolioAsset = {
  id: string;
  name: string;
  path: string;
  publicUrl: string;
  mimeType: string | null;
  size: number | null;
  createdAt: string | null;
};
type ImageTools = {
  assets: PortfolioAsset[];
  assetsPending: boolean;
  onRefreshAssets: () => Promise<void>;
  onUploadAsset: (file: File) => Promise<string | null>;
};

const initialState: SaveState = {
  ok: false,
  message: ""
};

const sectionConfig: Record<
  SectionId,
  { eyebrow: string; title: string; label: string; icon: typeof Palette }
> = {
  design: {
    eyebrow: "Design config",
    title: "Theme and CRT feel",
    label: "Design",
    icon: Palette
  },
  ui: {
    eyebrow: "Web UI contents",
    title: "Intro, windows, labels",
    label: "Web UI",
    icon: Monitor
  },
  portfolio: {
    eyebrow: "Portfolio content",
    title: "Profile, lists, projects",
    label: "Portfolio",
    icon: FolderKanban
  }
};

const colorLabels: Array<[ThemeColor, string]> = [
  ["space", "Space"],
  ["ink", "Terminal ink"],
  ["panel", "Panel"],
  ["panelSoft", "Panel soft"],
  ["chromeStart", "Chrome start"],
  ["chromeEnd", "Chrome end"],
  ["accent", "Accent"],
  ["accentAlt", "Alt accent"],
  ["text", "Text"],
  ["muted", "Muted text"],
  ["line", "Pixel line"],
  ["glow", "Glow"]
];

const contactTypes: ContactType[] = [
  "email",
  "linkedin",
  "behance",
  "instagram",
  "github",
  "website"
];

export function AdminEditor({
  initialActiveThemeId,
  initialContent,
  initialThemes,
  adminEmail
}: {
  initialActiveThemeId: string;
  initialContent: PortfolioContent;
  initialThemes: PortfolioThemePreset[];
  adminEmail: string;
}) {
  const initialThemeLibrary = ensureThemeLibrary(
    initialThemes,
    initialContent.theme
  );
  const initialThemeId = getValidThemeId(
    initialActiveThemeId,
    initialThemeLibrary
  );
  const [content, setContent] = useState(() => structuredClone(initialContent));
  const [savedContent, setSavedContent] = useState(() =>
    structuredClone(initialContent)
  );
  const [themes, setThemes] = useState(() => structuredClone(initialThemeLibrary));
  const [savedThemes, setSavedThemes] = useState(() =>
    structuredClone(initialThemeLibrary)
  );
  const [activeThemeId, setActiveThemeId] = useState(initialThemeId);
  const [savedActiveThemeId, setSavedActiveThemeId] = useState(initialThemeId);
  const [selectedThemeId, setSelectedThemeId] = useState(initialThemeId);
  const [activeSection, setActiveSection] = useState<SectionId>("design");
  const [state, setState] = useState<SaveState>(initialState);
  const [pendingSection, setPendingSection] = useState<SectionId | null>(null);
  const [assets, setAssets] = useState<PortfolioAsset[]>([]);
  const [assetsPending, setAssetsPending] = useState(false);

  useEffect(() => {
    void refreshAssets();
  }, []);

  const dirty = useMemo(() => {
    return (
      JSON.stringify(content) !== JSON.stringify(savedContent) ||
      JSON.stringify(themes) !== JSON.stringify(savedThemes) ||
      activeThemeId !== savedActiveThemeId
    );
  }, [activeThemeId, content, savedActiveThemeId, savedContent, savedThemes, themes]);

  const active = sectionConfig[activeSection];
  const ActiveIcon = active.icon;
  const imageTools: ImageTools = {
    assets,
    assetsPending,
    onRefreshAssets: refreshAssets,
    onUploadAsset: uploadAsset
  };
  const selectedTheme =
    themes.find((theme) => theme.id === selectedThemeId) ?? themes[0];

  function updateContent(mutator: (next: PortfolioContent) => void) {
    setContent((current) => {
      const next = structuredClone(current);
      mutator(next);
      return next;
    });
    setState(initialState);
  }

  function updateSelectedTheme(mutator: (next: PortfolioThemePreset) => void) {
    setThemes((current) => {
      const nextThemes = current.map((theme) => {
        if (theme.id !== selectedTheme.id) {
          return theme;
        }

        const nextTheme = structuredClone(theme);
        mutator(nextTheme);
        return nextTheme;
      });
      const activeTheme = nextThemes.find((theme) => theme.id === activeThemeId);

      if (activeTheme && selectedTheme.id === activeThemeId) {
        setContent((currentContent) => {
          const nextContent = structuredClone(currentContent);
          nextContent.theme = themeToContentTheme(activeTheme);
          return nextContent;
        });
      }

      return nextThemes;
    });
    setState(initialState);
  }

  function selectTheme(themeId: string) {
    setSelectedThemeId(themeId);
    setState(initialState);
  }

  function chooseActiveTheme(themeId: string) {
    const theme = themes.find((item) => item.id === themeId);
    if (!theme) {
      return;
    }

    setActiveThemeId(themeId);
    setSelectedThemeId(themeId);
    setContent((current) => {
      const next = structuredClone(current);
      next.theme = themeToContentTheme(theme);
      return next;
    });
    setState(initialState);
  }

  function addTheme() {
    const baseTheme = selectedTheme ?? themes[0];
    const id = makeId("theme");
    const theme: PortfolioThemePreset = {
      ...structuredClone(baseTheme),
      id,
      name: "New theme"
    };

    setThemes((current) => [...current, theme]);
    setSelectedThemeId(id);
    setState(initialState);
  }

  function duplicateTheme() {
    const baseTheme = selectedTheme ?? themes[0];
    const id = makeId("theme");
    const theme: PortfolioThemePreset = {
      ...structuredClone(baseTheme),
      id,
      name: `${baseTheme.name} copy`
    };

    setThemes((current) => [...current, theme]);
    setSelectedThemeId(id);
    setState(initialState);
  }

  function removeSelectedTheme() {
    if (themes.length <= 1) {
      return;
    }

    const remaining = themes.filter((theme) => theme.id !== selectedTheme.id);
    const nextActiveThemeId =
      selectedTheme.id === activeThemeId ? remaining[0].id : activeThemeId;

    setThemes(remaining);
    setSelectedThemeId(nextActiveThemeId);
    setActiveThemeId(nextActiveThemeId);
    if (nextActiveThemeId !== activeThemeId) {
      setContent((current) => {
        const next = structuredClone(current);
        next.theme = themeToContentTheme(remaining[0]);
        return next;
      });
    }
    setState(initialState);
  }

  async function refreshAssets() {
    setAssetsPending(true);

    try {
      const response = await fetch("/api/admin/assets", {
        method: "GET"
      });
      const result = (await response.json().catch(() => null)) as {
        ok?: boolean;
        assets?: PortfolioAsset[];
        error?: string;
      } | null;

      if (!response.ok || !result?.ok) {
        setState({
          ok: false,
          message: result?.error ?? "Unable to load Supabase assets."
        });
        return;
      }

      setAssets(result.assets ?? []);
    } catch (error) {
      setState({
        ok: false,
        message:
          error instanceof Error ? error.message : "Unable to load Supabase assets."
      });
    } finally {
      setAssetsPending(false);
    }
  }

  async function uploadAsset(file: File) {
    setAssetsPending(true);
    setState(initialState);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/admin/assets", {
        method: "POST",
        body: formData
      });
      const result = (await response.json().catch(() => null)) as {
        ok?: boolean;
        asset?: PortfolioAsset;
        error?: string;
      } | null;

      if (!response.ok || !result?.ok || !result.asset) {
        setState({
          ok: false,
          message: result?.error ?? "Unable to upload image."
        });
        return null;
      }

      setAssets((current) => [result.asset as PortfolioAsset, ...current]);
      setState({
        ok: true,
        message: "Uploaded image to Supabase Storage."
      });

      return result.asset.publicUrl;
    } catch (error) {
      setState({
        ok: false,
        message: error instanceof Error ? error.message : "Unable to upload image."
      });
      return null;
    } finally {
      setAssetsPending(false);
    }
  }

  async function handleSave(section: SectionId = activeSection) {
    setPendingSection(section);
    setState(initialState);

    try {
      const contentToSave = getContentForSave(content, themes, activeThemeId);
      const response = await fetch("/api/admin/content", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          content: contentToSave,
          themes,
          activeThemeId
        })
      });
      const result = (await response.json().catch(() => null)) as {
        ok?: boolean;
        error?: string;
      } | null;

      if (!response.ok || !result?.ok) {
        setState({
          ok: false,
          message: result?.error ?? "Unable to save content."
        });
        return;
      }

      setContent(structuredClone(contentToSave));
      setSavedContent(structuredClone(contentToSave));
      setSavedThemes(structuredClone(themes));
      setSavedActiveThemeId(activeThemeId);
      setState({
        ok: true,
        message: `Saved ${sectionConfig[section].label.toLowerCase()} fields.`
      });
    } catch (error) {
      setState({
        ok: false,
        message:
          error instanceof Error ? error.message : "Unable to save content."
      });
    } finally {
      setPendingSection(null);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void handleSave();
  }

  function resetChanges() {
    setContent(structuredClone(savedContent));
    setThemes(structuredClone(savedThemes));
    setActiveThemeId(savedActiveThemeId);
    setSelectedThemeId(savedActiveThemeId);
    setState({
      ok: true,
      message: "Reset unsaved changes."
    });
  }

  function addContact() {
    updateContent((next) => {
      const id = makeId("contact");
      next.contacts.push({
        id,
        type: "website",
        label: "Website",
        value: "@handle",
        href: "https://"
      });
    });
  }

  function addProject() {
    updateContent((next) => {
      const id = makeId("project");
      next.projects.push({
        id,
        title: "New project",
        subtitle: "Project subtitle",
        description: "Write the project story here.",
        imageUrl: "/assets/m-choice-hero.png",
        href: "https://",
        tags: ["Tag"]
      });
    });
  }

  return (
    <form className="admin-editor" onSubmit={handleSubmit}>
      <aside className="admin-panel admin-sidebar" aria-label="CMS sections">
        <div className="panel-heading compact-heading">
          <UserRound size={18} aria-hidden="true" />
          <div>
            <p className="eyebrow">Signed in</p>
            <h2>{adminEmail}</h2>
          </div>
        </div>

        <div className="section-tabs" role="tablist" aria-label="Content groups">
          {(Object.keys(sectionConfig) as SectionId[]).map((section) => {
            const item = sectionConfig[section];
            const Icon = item.icon;
            return (
              <button
                type="button"
                role="tab"
                aria-selected={activeSection === section}
                className={activeSection === section ? "section-tab active" : "section-tab"}
                key={section}
                onClick={() => setActiveSection(section)}
              >
                <Icon size={17} aria-hidden="true" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        <div className="save-note">
          <span className={dirty ? "status-dot dirty" : "status-dot"} />
          <p>{dirty ? "Unsaved changes" : "All changes saved"}</p>
        </div>
      </aside>

      <section className="admin-panel editor-panel">
        <header className="editor-heading">
          <div className="panel-heading compact-heading">
            <ActiveIcon size={19} aria-hidden="true" />
            <div>
              <p className="eyebrow">{active.eyebrow}</p>
              <h2>{active.title}</h2>
            </div>
          </div>
          <div className="editor-actions">
            <button
              className="ghost-button"
              type="button"
              onClick={resetChanges}
              disabled={!dirty || pendingSection !== null}
            >
              <RotateCcw size={16} aria-hidden="true" />
              Reset
            </button>
            <button
              className="admin-button"
              type="submit"
              disabled={!dirty || pendingSection !== null}
            >
              <Save size={16} aria-hidden="true" />
              {pendingSection === activeSection ? "Saving" : `Save ${active.label}`}
            </button>
          </div>
        </header>

        <div className="editor-body">
          {activeSection === "design" ? (
            <DesignSection
              activeThemeId={activeThemeId}
              imageTools={imageTools}
              onAddTheme={addTheme}
              onChooseActiveTheme={chooseActiveTheme}
              onDuplicateTheme={duplicateTheme}
              onRemoveTheme={removeSelectedTheme}
              onSelectTheme={selectTheme}
              selectedTheme={selectedTheme}
              selectedThemeId={selectedThemeId}
              themes={themes}
              updateTheme={updateSelectedTheme}
            />
          ) : null}
          {activeSection === "ui" ? (
            <UiSection
              content={content}
              updateContent={updateContent}
              imageTools={imageTools}
            />
          ) : null}
          {activeSection === "portfolio" ? (
            <PortfolioSection
              content={content}
              updateContent={updateContent}
              onAddContact={addContact}
              onAddProject={addProject}
              imageTools={imageTools}
            />
          ) : null}
        </div>
      </section>

      <footer className="admin-savebar">
        <span>{adminEmail}</span>
        {state.message ? (
          <p className={state.ok ? "save-message ok" : "save-message"}>
            {state.message}
          </p>
        ) : null}
        <button
          className="ghost-button"
          type="button"
          onClick={resetChanges}
          disabled={!dirty || pendingSection !== null}
        >
          <RotateCcw size={16} aria-hidden="true" />
          Reset
        </button>
        <button
          className="admin-button"
          type="submit"
          disabled={!dirty || pendingSection !== null}
        >
          <Save size={16} aria-hidden="true" />
          {pendingSection ? "Saving" : "Save changes"}
        </button>
      </footer>
    </form>
  );
}

function DesignSection({
  activeThemeId,
  imageTools,
  onAddTheme,
  onChooseActiveTheme,
  onDuplicateTheme,
  onRemoveTheme,
  onSelectTheme,
  selectedTheme,
  selectedThemeId,
  themes,
  updateTheme
}: {
  activeThemeId: string;
  imageTools: ImageTools;
  onAddTheme: () => void;
  onChooseActiveTheme: (themeId: string) => void;
  onDuplicateTheme: () => void;
  onRemoveTheme: () => void;
  onSelectTheme: (themeId: string) => void;
  selectedTheme: PortfolioThemePreset;
  selectedThemeId: string;
  themes: PortfolioThemePreset[];
  updateTheme: (mutator: (next: PortfolioThemePreset) => void) => void;
}) {
  return (
    <div className="editor-columns">
      <fieldset className="field-group theme-library">
        <legend>Theme library</legend>
        <label className="field">
          <span>Theme to display</span>
          <select
            value={activeThemeId}
            onChange={(event) => onChooseActiveTheme(event.target.value)}
          >
            {themes.map((theme) => (
              <option value={theme.id} key={theme.id}>
                {theme.name}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Theme to configure</span>
          <select
            value={selectedThemeId}
            onChange={(event) => onSelectTheme(event.target.value)}
          >
            {themes.map((theme) => (
              <option value={theme.id} key={theme.id}>
                {theme.name}
              </option>
            ))}
          </select>
        </label>
        <div className="theme-actions">
          <button className="ghost-button compact-button" type="button" onClick={onAddTheme}>
            <Plus size={15} aria-hidden="true" />
            New
          </button>
          <button
            className="ghost-button compact-button"
            type="button"
            onClick={onDuplicateTheme}
          >
            <RefreshCw size={15} aria-hidden="true" />
            Duplicate
          </button>
          <button
            className="danger-button"
            type="button"
            disabled={themes.length <= 1}
            onClick={onRemoveTheme}
          >
            <Trash2 size={15} aria-hidden="true" />
            Remove
          </button>
        </div>
        <div className="theme-swatch-row" aria-hidden="true">
          {Object.entries(selectedTheme.colors).map(([key, value]) => (
            <span
              key={key}
              style={{ background: value.startsWith("#") ? value : selectedTheme.colors.accent }}
            />
          ))}
        </div>
      </fieldset>

      <fieldset className="field-group">
        <legend>Theme identity</legend>
        <TextField
          label="Theme name"
          value={selectedTheme.name}
          onChange={(value) =>
            updateTheme((next) => {
              next.name = value;
            })
          }
        />
        <ImageField
          label="Background image"
          value={selectedTheme.backgroundImageUrl}
          onChange={(value) =>
            updateTheme((next) => {
              next.backgroundImageUrl = value;
            })
          }
          imageTools={imageTools}
        />
        <div className="range-row">
          <label className="field">
            <span>Scanline opacity</span>
            <input
              type="range"
              min="0"
              max="0.35"
              step="0.01"
              value={selectedTheme.scanlineOpacity}
              onChange={(event) =>
                updateTheme((next) => {
                  next.scanlineOpacity = Number(event.target.value);
                })
              }
            />
            <small>{selectedTheme.scanlineOpacity.toFixed(2)}</small>
          </label>
          <label className="field">
            <span>Pixel scale</span>
            <input
              type="number"
              min="1"
              max="4"
              value={selectedTheme.pixelScale}
              onChange={(event) =>
                updateTheme((next) => {
                  next.pixelScale = Number(event.target.value);
                })
              }
            />
          </label>
        </div>
      </fieldset>

      <fieldset className="field-group">
        <legend>Color system</legend>
        <div className="color-grid">
          {colorLabels.map(([key, label]) => {
            const value = selectedTheme.colors[key];
            const isColor = value.startsWith("#");

            return (
              <label className="field color-field" key={key}>
                <span>{label}</span>
                <span className="color-line">
                  {isColor ? (
                    <input
                      aria-label={`${label} swatch`}
                      type="color"
                      value={value}
                      onChange={(event) =>
                        updateTheme((next) => {
                          next.colors[key] = event.target.value;
                        })
                      }
                    />
                  ) : (
                    <span className="color-chip text-chip">fx</span>
                  )}
                  <input
                    value={value}
                    onChange={(event) =>
                      updateTheme((next) => {
                        next.colors[key] = event.target.value;
                      })
                    }
                  />
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}

function UiSection({
  content,
  updateContent,
  imageTools
}: {
  content: PortfolioContent;
  updateContent: (mutator: (next: PortfolioContent) => void) => void;
  imageTools: ImageTools;
}) {
  return (
    <div className="editor-columns">
      <fieldset className="field-group">
        <legend>Intro screen</legend>
        <TextField
          label="Browser tab name"
          value={content.ui.browserTabName}
          onChange={(value) =>
            updateContent((next) => {
              next.ui.browserTabName = value;
            })
          }
        />
        <ImageField
          label="Browser tab image"
          value={content.ui.browserTabImageUrl}
          imageTools={imageTools}
          onChange={(value) =>
            updateContent((next) => {
              next.ui.browserTabImageUrl = value;
            })
          }
        />
        <TextField
          label="Logo text"
          value={content.profile.logoText}
          onChange={(value) =>
            updateContent((next) => {
              next.profile.logoText = value;
            })
          }
        />
        <TextField
          label="Logo subtext"
          value={content.profile.logoSubtext}
          onChange={(value) =>
            updateContent((next) => {
              next.profile.logoSubtext = value;
            })
          }
        />
        <TextField
          label="Start prompt"
          value={content.ui.introStart}
          onChange={(value) =>
            updateContent((next) => {
              next.ui.introStart = value;
            })
          }
        />
        <TextField
          label="Desktop start chip"
          value={content.profile.desktopName}
          onChange={(value) =>
            updateContent((next) => {
              next.profile.desktopName = value;
            })
          }
        />
      </fieldset>

      <fieldset className="field-group">
        <legend>Window chrome</legend>
        <TextField
          label="Contacts window title"
          value={content.ui.contactsWindowTitle}
          onChange={(value) =>
            updateContent((next) => {
              next.ui.contactsWindowTitle = value;
            })
          }
        />
        <TextField
          label="About window title"
          value={content.about.windowTitle}
          onChange={(value) =>
            updateContent((next) => {
              next.about.windowTitle = value;
            })
          }
        />
        <TextField
          label="Presentation window title"
          value={content.presentation.windowTitle}
          onChange={(value) =>
            updateContent((next) => {
              next.presentation.windowTitle = value;
            })
          }
        />
        <TextField
          label="Projects window title"
          value={content.ui.projectsWindowTitle}
          onChange={(value) =>
            updateContent((next) => {
              next.ui.projectsWindowTitle = value;
            })
          }
        />
      </fieldset>

      <fieldset className="field-group">
        <legend>Interface labels</legend>
        <TextField
          label="Contacts heading"
          value={content.ui.contactsHeading}
          onChange={(value) =>
            updateContent((next) => {
              next.ui.contactsHeading = value;
            })
          }
        />
        <TextField
          label="Contacts button"
          value={content.ui.contactButton}
          onChange={(value) =>
            updateContent((next) => {
              next.ui.contactButton = value;
            })
          }
        />
        <TextField
          label="Project link label"
          value={content.ui.projectLinkLabel}
          onChange={(value) =>
            updateContent((next) => {
              next.ui.projectLinkLabel = value;
            })
          }
        />
      </fieldset>

      <fieldset className="field-group">
        <legend>Taskbar labels</legend>
        <TextField
          label="About task"
          value={content.ui.taskbarLabels.about}
          onChange={(value) =>
            updateContent((next) => {
              next.ui.taskbarLabels.about = value;
            })
          }
        />
        <TextField
          label="Presentation task"
          value={content.ui.taskbarLabels.presentation}
          onChange={(value) =>
            updateContent((next) => {
              next.ui.taskbarLabels.presentation = value;
            })
          }
        />
        <TextField
          label="Projects task"
          value={content.ui.taskbarLabels.projects}
          onChange={(value) =>
            updateContent((next) => {
              next.ui.taskbarLabels.projects = value;
            })
          }
        />
        <TextField
          label="Contacts task"
          value={content.ui.taskbarLabels.contacts}
          onChange={(value) =>
            updateContent((next) => {
              next.ui.taskbarLabels.contacts = value;
            })
          }
        />
      </fieldset>
    </div>
  );
}

function PortfolioSection({
  content,
  updateContent,
  onAddContact,
  onAddProject,
  imageTools
}: {
  content: PortfolioContent;
  updateContent: (mutator: (next: PortfolioContent) => void) => void;
  onAddContact: () => void;
  onAddProject: () => void;
  imageTools: ImageTools;
}) {
  return (
    <div className="editor-stack">
      <fieldset className="field-group">
        <legend>Profile</legend>
        <div className="two-column-fields">
          <TextField
            label="Name"
            value={content.profile.name}
            onChange={(value) =>
              updateContent((next) => {
                next.profile.name = value;
              })
            }
          />
          <TextField
            label="Handle"
            value={content.profile.handle}
            onChange={(value) =>
              updateContent((next) => {
                next.profile.handle = value;
              })
            }
          />
          <TextField
            label="Title"
            value={content.profile.title}
            onChange={(value) =>
              updateContent((next) => {
                next.profile.title = value;
              })
            }
          />
          <TextField
            label="Tagline"
            value={content.profile.tagline}
            onChange={(value) =>
              updateContent((next) => {
                next.profile.tagline = value;
              })
            }
          />
        </div>
        <div className="two-column-fields">
          <ImageField
            label="Avatar image"
            value={content.profile.avatarUrl}
            onChange={(value) =>
              updateContent((next) => {
                next.profile.avatarUrl = value;
              })
            }
            imageTools={imageTools}
          />
          <ImageField
            label="Hero/background image"
            value={content.profile.heroImageUrl}
            onChange={(value) =>
              updateContent((next) => {
                next.profile.heroImageUrl = value;
              })
            }
            imageTools={imageTools}
          />
        </div>
      </fieldset>

      <ListGroup title="Contacts" actionLabel="Add contact" onAdd={onAddContact}>
        {content.contacts.map((contact, index) => (
          <details className="repeat-item" key={contact.id} open={index === 0}>
            <summary>
              <span>
                <b>{contact.label || "Untitled contact"}</b>
                <small>{contact.value || contact.href}</small>
              </span>
              <ChevronDown size={18} aria-hidden="true" />
            </summary>
            <div className="repeat-body">
              <div className="two-column-fields">
                <TextField
                  label="ID"
                  value={contact.id}
                  onChange={(value) =>
                    updateContent((next) => {
                      next.contacts[index].id = value;
                    })
                  }
                />
                <label className="field">
                  <span>Type</span>
                  <select
                    value={contact.type}
                    onChange={(event) =>
                      updateContent((next) => {
                        next.contacts[index].type = event.target.value as ContactType;
                      })
                    }
                  >
                    {contactTypes.map((type) => (
                      <option value={type} key={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </label>
                <TextField
                  label="Label"
                  value={contact.label}
                  onChange={(value) =>
                    updateContent((next) => {
                      next.contacts[index].label = value;
                    })
                  }
                />
                <TextField
                  label="Displayed value"
                  value={contact.value}
                  onChange={(value) =>
                    updateContent((next) => {
                      next.contacts[index].value = value;
                    })
                  }
                />
              </div>
              <TextField
                label="Link URL"
                value={contact.href}
                onChange={(value) =>
                  updateContent((next) => {
                    next.contacts[index].href = value;
                  })
                }
              />
              <RemoveButton
                label="Remove contact"
                onClick={() =>
                  updateContent((next) => {
                    next.contacts.splice(index, 1);
                  })
                }
              />
            </div>
          </details>
        ))}
      </ListGroup>

      <ListGroup
        title="About paragraphs"
        actionLabel="Add paragraph"
        onAdd={() =>
          updateContent((next) => {
            next.about.paragraphs.push("New paragraph");
          })
        }
      >
        {content.about.paragraphs.map((paragraph, index) => (
          <div className="simple-row" key={`paragraph-${index}`}>
            <TextareaField
              label={`Paragraph ${index + 1}`}
              value={paragraph}
              rows={3}
              onChange={(value) =>
                updateContent((next) => {
                  next.about.paragraphs[index] = value;
                })
              }
            />
            <RemoveButton
              label="Remove paragraph"
              onClick={() =>
                updateContent((next) => {
                  next.about.paragraphs.splice(index, 1);
                })
              }
            />
          </div>
        ))}
      </ListGroup>

      <ListGroup
        title="Education"
        actionLabel="Add education"
        onAdd={() =>
          updateContent((next) => {
            next.presentation.education.push("New education item");
          })
        }
      >
        {content.presentation.education.map((item, index) => (
          <div className="simple-row" key={`education-${index}`}>
            <TextField
              label={`Education ${index + 1}`}
              value={item}
              onChange={(value) =>
                updateContent((next) => {
                  next.presentation.education[index] = value;
                })
              }
            />
            <RemoveButton
              label="Remove education"
              onClick={() =>
                updateContent((next) => {
                  next.presentation.education.splice(index, 1);
                })
              }
            />
          </div>
        ))}
      </ListGroup>

      <ListGroup
        title="Software"
        actionLabel="Add software"
        onAdd={() =>
          updateContent((next) => {
            next.presentation.software.push({ name: "New tool", level: 3 });
          })
        }
      >
        {content.presentation.software.map((software, index) => (
          <details className="repeat-item compact-item" key={`${software.name}-${index}`}>
            <summary>
              <span>
                <b>{software.name || "Untitled software"}</b>
                <small>{software.level} of 5</small>
              </span>
              <ChevronDown size={18} aria-hidden="true" />
            </summary>
            <div className="repeat-body">
              <div className="two-column-fields">
                <TextField
                  label="Name"
                  value={software.name}
                  onChange={(value) =>
                    updateContent((next) => {
                      next.presentation.software[index].name = value;
                    })
                  }
                />
                <label className="field">
                  <span>Level</span>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="1"
                    value={software.level}
                    onChange={(event) =>
                      updateContent((next) => {
                        next.presentation.software[index].level = Number(
                          event.target.value
                        );
                      })
                    }
                  />
                  <small>{software.level} / 5</small>
                </label>
              </div>
              <RemoveButton
                label="Remove software"
                onClick={() =>
                  updateContent((next) => {
                    next.presentation.software.splice(index, 1);
                  })
                }
              />
            </div>
          </details>
        ))}
      </ListGroup>

      <ListGroup
        title="Main skills"
        actionLabel="Add skill"
        onAdd={() =>
          updateContent((next) => {
            next.presentation.mainSkills.push("New skill");
          })
        }
      >
        {content.presentation.mainSkills.map((skill, index) => (
          <div className="simple-row" key={`skill-${index}`}>
            <TextField
              label={`Skill ${index + 1}`}
              value={skill}
              onChange={(value) =>
                updateContent((next) => {
                  next.presentation.mainSkills[index] = value;
                })
              }
            />
            <RemoveButton
              label="Remove skill"
              onClick={() =>
                updateContent((next) => {
                  next.presentation.mainSkills.splice(index, 1);
                })
              }
            />
          </div>
        ))}
      </ListGroup>

      <ListGroup title="Projects" actionLabel="Add project" onAdd={onAddProject}>
        {content.projects.map((project, index) => (
          <details className="repeat-item project-item" key={project.id} open={index === 0}>
            <summary>
              <span>
                <b>{project.title || "Untitled project"}</b>
                <small>{project.subtitle || project.href}</small>
              </span>
              <ChevronDown size={18} aria-hidden="true" />
            </summary>
            <div className="repeat-body">
              <div className="two-column-fields">
                <TextField
                  label="ID"
                  value={project.id}
                  onChange={(value) =>
                    updateContent((next) => {
                      next.projects[index].id = value;
                    })
                  }
                />
                <TextField
                  label="Title"
                  value={project.title}
                  onChange={(value) =>
                    updateContent((next) => {
                      next.projects[index].title = value;
                    })
                  }
                />
                <TextField
                  label="Subtitle"
                  value={project.subtitle}
                  onChange={(value) =>
                    updateContent((next) => {
                      next.projects[index].subtitle = value;
                    })
                  }
                />
                <TextField
                  label="Project URL"
                  value={project.href}
                  onChange={(value) =>
                    updateContent((next) => {
                      next.projects[index].href = value;
                    })
                  }
                />
              </div>
              <TextareaField
                label="Description"
                value={project.description}
                rows={3}
                onChange={(value) =>
                  updateContent((next) => {
                    next.projects[index].description = value;
                  })
                }
              />
              <ImageField
                label="Project image"
                value={project.imageUrl}
                onChange={(value) =>
                  updateContent((next) => {
                    next.projects[index].imageUrl = value;
                  })
                }
                imageTools={imageTools}
              />
              <ListGroup
                title="Tags"
                actionLabel="Add tag"
                onAdd={() =>
                  updateContent((next) => {
                    next.projects[index].tags.push("Tag");
                  })
                }
                nested
              >
                {project.tags.map((tag, tagIndex) => (
                  <div className="simple-row" key={`${project.id}-tag-${tagIndex}`}>
                    <TextField
                      label={`Tag ${tagIndex + 1}`}
                      value={tag}
                      onChange={(value) =>
                        updateContent((next) => {
                          next.projects[index].tags[tagIndex] = value;
                        })
                      }
                    />
                    <RemoveButton
                      label="Remove tag"
                      onClick={() =>
                        updateContent((next) => {
                          next.projects[index].tags.splice(tagIndex, 1);
                        })
                      }
                    />
                  </div>
                ))}
              </ListGroup>
              <RemoveButton
                label="Remove project"
                onClick={() =>
                  updateContent((next) => {
                    next.projects.splice(index, 1);
                  })
                }
              />
            </div>
          </details>
        ))}
      </ListGroup>
    </div>
  );
}

function ListGroup({
  title,
  actionLabel,
  onAdd,
  children,
  nested = false
}: {
  title: string;
  actionLabel: string;
  onAdd: () => void;
  children: React.ReactNode;
  nested?: boolean;
}) {
  return (
    <fieldset className={nested ? "field-group nested-group" : "field-group"}>
      <legend>{title}</legend>
      <div className="list-heading">
        <span>{title}</span>
        <button className="ghost-button compact-button" type="button" onClick={onAdd}>
          <Plus size={15} aria-hidden="true" />
          {actionLabel}
        </button>
      </div>
      <div className="repeat-list">{children}</div>
    </fieldset>
  );
}

function TextField({
  label,
  value,
  onChange
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function TextareaField({
  label,
  value,
  rows = 4,
  onChange
}: {
  label: string;
  value: string;
  rows?: number;
  onChange: (value: string) => void;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <textarea
        rows={rows}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function ImageField({
  label,
  value,
  onChange,
  imageTools
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  imageTools: ImageTools;
}) {
  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const publicUrl = await imageTools.onUploadAsset(file);
    if (publicUrl) {
      onChange(publicUrl);
    }

    event.target.value = "";
  }

  return (
    <div className="field image-field">
      <span>{label}</span>
      <span className="image-input-row">
        <span className="image-preview" aria-hidden="true">
          {value ? <img src={value} alt="" /> : <ImageIcon size={18} />}
        </span>
        <span className="image-field-main">
          <input
            value={value}
            placeholder="Supabase image URL or https://..."
            onChange={(event) => onChange(event.target.value)}
          />
          <span className="asset-actions">
            <label className="ghost-button compact-button asset-upload-button">
              <Upload size={15} aria-hidden="true" />
              Upload
              <input
                type="file"
                accept="image/gif,image/jpeg,image/png,image/svg+xml,image/webp"
                disabled={imageTools.assetsPending}
                onChange={handleFileChange}
              />
            </label>
            <button
              className="ghost-button compact-button"
              type="button"
              disabled={imageTools.assetsPending}
              onClick={() => void imageTools.onRefreshAssets()}
            >
              <RefreshCw size={15} aria-hidden="true" />
              Refresh
            </button>
          </span>
        </span>
      </span>
      <details className="asset-picker">
        <summary>
          {imageTools.assets.length > 0
            ? `Choose uploaded asset (${imageTools.assets.length})`
            : "No uploaded assets yet"}
        </summary>
        {imageTools.assets.length > 0 ? (
          <div className="asset-grid">
            {imageTools.assets.map((asset) => (
              <button
                type="button"
                className={asset.publicUrl === value ? "asset-tile active" : "asset-tile"}
                key={asset.path}
                onClick={() => onChange(asset.publicUrl)}
              >
                <img src={asset.publicUrl} alt="" />
                <span>{asset.name}</span>
              </button>
            ))}
          </div>
        ) : null}
      </details>
    </div>
  );
}

function RemoveButton({
  label,
  onClick
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button className="danger-button" type="button" onClick={onClick}>
      <Trash2 size={15} aria-hidden="true" />
      {label}
    </button>
  );
}

function ensureThemeLibrary(
  themes: PortfolioThemePreset[],
  fallbackTheme: PortfolioTheme
) {
  if (themes.length > 0) {
    return themes;
  }

  return [
    {
      id: "default",
      ...fallbackTheme
    }
  ];
}

function getValidThemeId(themeId: string, themes: PortfolioThemePreset[]) {
  return themes.some((theme) => theme.id === themeId) ? themeId : themes[0].id;
}

function getContentForSave(
  content: PortfolioContent,
  themes: PortfolioThemePreset[],
  activeThemeId: string
) {
  const activeTheme =
    themes.find((theme) => theme.id === activeThemeId) ?? themes[0];
  const next = structuredClone(content);
  next.theme = themeToContentTheme(activeTheme);
  return next;
}

function themeToContentTheme(theme: PortfolioThemePreset): PortfolioTheme {
  const { id: _id, ...contentTheme } = theme;
  return contentTheme;
}

function makeId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 6)}`;
}
