"use client";

import { type FormEvent, useMemo, useState } from "react";
import { FileJson, Palette, RotateCcw, Save } from "lucide-react";
import type { PortfolioContent } from "@/lib/portfolio/schema";

type SaveState = {
  ok: boolean;
  message: string;
};

const initialState: SaveState = {
  ok: false,
  message: ""
};

const colorLabels: Array<[keyof PortfolioContent["theme"]["colors"], string]> = [
  ["space", "Space"],
  ["ink", "Ink"],
  ["panel", "Panel"],
  ["panelSoft", "Panel soft"],
  ["chromeStart", "Chrome start"],
  ["chromeEnd", "Chrome end"],
  ["accent", "Accent"],
  ["accentAlt", "Alt accent"],
  ["text", "Text"],
  ["muted", "Muted"],
  ["line", "Line"],
  ["glow", "Glow"]
];

export function AdminEditor({
  initialContent,
  adminEmail
}: {
  initialContent: PortfolioContent;
  adminEmail: string;
}) {
  const [jsonText, setJsonText] = useState(formatJson(initialContent));
  const [state, setState] = useState<SaveState>(initialState);
  const [pending, setPending] = useState(false);

  const parsed = useMemo(() => {
    try {
      return JSON.parse(jsonText) as PortfolioContent;
    } catch {
      return null;
    }
  }, [jsonText]);

  function updateContent(mutator: (content: PortfolioContent) => void) {
    if (!parsed) return;
    const next = structuredClone(parsed);
    mutator(next);
    setJsonText(formatJson(next));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!parsed) {
      setState({
        ok: false,
        message: "JSON is not valid."
      });
      return;
    }

    setPending(true);
    setState(initialState);

    try {
      const response = await fetch("/api/admin/content", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: jsonText
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

      setState({
        ok: true,
        message: "Saved portfolio content."
      });
    } catch (error) {
      setState({
        ok: false,
        message:
          error instanceof Error ? error.message : "Unable to save content."
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="admin-grid" onSubmit={handleSubmit}>
      <section className="admin-panel theme-panel">
        <div className="panel-heading">
          <Palette size={18} aria-hidden="true" />
          <div>
            <p className="eyebrow">Theme</p>
            <h2>{parsed?.theme.name ?? "Invalid JSON"}</h2>
          </div>
        </div>

        {parsed ? (
          <>
            <label>
              Theme name
              <input
                value={parsed.theme.name}
                onChange={(event) =>
                  updateContent((content) => {
                    content.theme.name = event.target.value;
                  })
                }
              />
            </label>
            <div className="color-grid">
              {colorLabels.map(([key, label]) => {
                const value = parsed.theme.colors[key];
                const isColor = value.startsWith("#");

                return (
                  <label key={key}>
                    {label}
                    <span className="color-line">
                      {isColor ? (
                        <input
                          aria-label={`${label} swatch`}
                          type="color"
                          value={value}
                          onChange={(event) =>
                            updateContent((content) => {
                              content.theme.colors[key] = event.target.value;
                            })
                          }
                        />
                      ) : null}
                      <input
                        value={value}
                        onChange={(event) =>
                          updateContent((content) => {
                            content.theme.colors[key] = event.target.value;
                          })
                        }
                      />
                    </span>
                  </label>
                );
              })}
            </div>
            <div className="range-row">
              <label>
                Scanlines
                <input
                  type="range"
                  min="0"
                  max="0.35"
                  step="0.01"
                  value={parsed.theme.scanlineOpacity}
                  onChange={(event) =>
                    updateContent((content) => {
                      content.theme.scanlineOpacity = Number(event.target.value);
                    })
                  }
                />
              </label>
              <label>
                Pixel scale
                <input
                  type="number"
                  min="1"
                  max="4"
                  value={parsed.theme.pixelScale}
                  onChange={(event) =>
                    updateContent((content) => {
                      content.theme.pixelScale = Number(event.target.value);
                    })
                  }
                />
              </label>
            </div>
          </>
        ) : (
          <p className="form-error">Fix JSON before editing theme controls.</p>
        )}
      </section>

      <section className="admin-panel json-panel">
        <div className="panel-heading">
          <FileJson size={18} aria-hidden="true" />
          <div>
            <p className="eyebrow">All fields</p>
            <h2>Content JSON</h2>
          </div>
        </div>
        <textarea
          aria-label="Portfolio content JSON"
          value={jsonText}
          spellCheck={false}
          onChange={(event) => setJsonText(event.target.value)}
        />
      </section>

      <footer className="admin-savebar">
        <span>{adminEmail}</span>
        {state.message ? (
          <p className={state.ok ? "save-message ok" : "save-message"}>
            {state.message}
          </p>
        ) : null}
        {!parsed ? <p className="save-message">JSON is not valid.</p> : null}
        <button
          className="ghost-button"
          type="button"
          onClick={() => setJsonText(formatJson(initialContent))}
        >
          <RotateCcw size={16} aria-hidden="true" />
          Reset
        </button>
        <button className="admin-button" type="submit" disabled={pending || !parsed}>
          <Save size={16} aria-hidden="true" />
          {pending ? "Saving" : "Save"}
        </button>
      </footer>
    </form>
  );
}

function formatJson(content: PortfolioContent) {
  return JSON.stringify(content, null, 2);
}
