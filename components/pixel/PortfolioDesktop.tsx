"use client";

import { useMemo, useState } from "react";
import type { PointerEvent } from "react";
import type { PortfolioContent } from "@/lib/portfolio/schema";

type WindowId = "contacts" | "about" | "presentation" | "projects";

type WindowState = {
  x: number;
  y: number;
  width: number;
  open: boolean;
  z: number;
};

const initialWindows: Record<WindowId, WindowState> = {
  contacts: { x: 48, y: 74, width: 340, open: true, z: 4 },
  about: { x: 438, y: 46, width: 790, open: true, z: 3 },
  presentation: { x: 526, y: 254, width: 820, open: true, z: 5 },
  projects: { x: 280, y: 332, width: 780, open: true, z: 2 }
};

export function PortfolioDesktop({ content }: { content: PortfolioContent }) {
  const [introVisible, setIntroVisible] = useState(true);
  const [windows, setWindows] = useState(initialWindows);
  const [drag, setDrag] = useState<{
    id: WindowId;
    offsetX: number;
    offsetY: number;
  } | null>(null);
  const [zTop, setZTop] = useState(8);

  const now = useMemo(() => {
    return new Intl.DateTimeFormat("en", {
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date());
  }, []);
  const taskbarItems: Array<{ id: WindowId; label: string }> = [
    { id: "about", label: content.ui.taskbarLabels.about },
    { id: "presentation", label: content.ui.taskbarLabels.presentation },
    { id: "projects", label: content.ui.taskbarLabels.projects },
    { id: "contacts", label: content.ui.taskbarLabels.contacts }
  ];

  function focus(id: WindowId) {
    setZTop((current) => {
      setWindows((all) => ({
        ...all,
        [id]: { ...all[id], z: current + 1, open: true }
      }));
      return current + 1;
    });
  }

  function close(id: WindowId) {
    setWindows((all) => ({ ...all, [id]: { ...all[id], open: false } }));
  }

  function startDrag(id: WindowId, event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "touch") {
      focus(id);
      return;
    }

    const win = windows[id];
    focus(id);
    setDrag({
      id,
      offsetX: event.clientX - win.x,
      offsetY: event.clientY - win.y
    });
  }

  function moveDrag(event: PointerEvent<HTMLDivElement>) {
    if (!drag) return;

    setWindows((all) => ({
      ...all,
      [drag.id]: {
        ...all[drag.id],
        x: Math.max(12, event.clientX - drag.offsetX),
        y: Math.max(12, event.clientY - drag.offsetY)
      }
    }));
  }

  function stopDrag() {
    setDrag(null);
  }

  return (
    <main
      className="pixel-desktop"
      onPointerMove={moveDrag}
      onPointerUp={stopDrag}
      onPointerLeave={stopDrag}
    >
      <div
        className="nebula-art"
        style={{ backgroundImage: `url("${content.theme.backgroundImageUrl}")` }}
        aria-hidden="true"
      />
      <div className="star-grid" aria-hidden="true" />
      <div className="scanlines" aria-hidden="true" />

      {introVisible ? (
        <button
          type="button"
          className="intro-screen"
          data-testid="intro-start"
          onClick={() => setIntroVisible(false)}
          aria-label="Enter portfolio"
        >
          <span className="intro-logo">{content.profile.logoText}</span>
          <span className="intro-name">{content.profile.name}</span>
          <span className="intro-title">{content.profile.title}</span>
          <span className="intro-start">{content.ui.introStart}</span>
        </button>
      ) : null}

      {!introVisible ? (
        <>
          <header className="desktop-signal" aria-label={content.profile.logoText}>
            <p>{content.profile.logoText}</p>
            <span>{content.profile.logoSubtext}</span>
          </header>

          {windows.contacts.open && (
            <PixelWindow
              id="contacts"
              title={content.ui.contactsWindowTitle}
              state={windows.contacts}
              onFocus={focus}
              onClose={close}
              onDragStart={startDrag}
              className="contacts-window"
            >
              <section className="contact-card">
                <div className="avatar-ring">
                  <img
                    src={content.profile.avatarUrl}
                    alt={`${content.profile.name} avatar`}
                    className="avatar-image"
                  />
                </div>
                <p className="contact-name">{content.profile.name}</p>
                <p className="contact-title">{content.profile.title}</p>
                <h2>{content.ui.contactsHeading}</h2>
                <div className="contact-list">
                  {content.contacts.map((contact) => (
                    <a href={contact.href} key={contact.id} className="contact-row">
                      <span className="contact-icon">{iconLabel(contact.type)}</span>
                      <span>
                        <b>{contact.label}</b>
                        {contact.value}
                      </span>
                    </a>
                  ))}
                </div>
                <button className="pixel-button" type="button" onClick={() => close("contacts")}>
                  {content.ui.contactButton}
                </button>
              </section>
            </PixelWindow>
          )}

          {windows.about.open && (
            <PixelWindow
              id="about"
              title={content.about.windowTitle}
              state={windows.about}
              onFocus={focus}
              onClose={close}
              onDragStart={startDrag}
            >
              <div className="terminal-pane about-pane">
                {content.about.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                <span className="cursor-mark" aria-hidden="true">_</span>
              </div>
            </PixelWindow>
          )}

          {windows.presentation.open && (
            <PixelWindow
              id="presentation"
              title={content.presentation.windowTitle}
              state={windows.presentation}
              onFocus={focus}
              onClose={close}
              onDragStart={startDrag}
            >
              <div className="terminal-pane presentation-grid">
                <section>
                  <h2>Education:</h2>
                  <ul>
                    {content.presentation.education.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </section>
                <section>
                  <h2>Softwares:</h2>
                  <div className="software-grid">
                    {content.presentation.software.map((software) => (
                      <div className="rating" key={software.name}>
                        <span>{software.name}</span>
                        <DotRating level={software.level} />
                      </div>
                    ))}
                  </div>
                </section>
                <section>
                  <h2>Main Skills:</h2>
                  <ul>
                    {content.presentation.mainSkills.map((skill) => (
                      <li key={skill}>{skill}</li>
                    ))}
                  </ul>
                </section>
              </div>
            </PixelWindow>
          )}

          {windows.projects.open && (
            <PixelWindow
              id="projects"
              title={content.ui.projectsWindowTitle}
              state={windows.projects}
              onFocus={focus}
              onClose={close}
              onDragStart={startDrag}
            >
              <div className="project-grid">
                {content.projects.map((project) => (
                  <article className="project-tile" key={project.id}>
                    <img src={project.imageUrl} alt="" />
                    <p className="project-kicker">{project.subtitle}</p>
                    <h2>{project.title}</h2>
                    <p>{project.description}</p>
                    <div className="tag-row">
                      {project.tags.map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>
                    <a href={project.href}>{content.ui.projectLinkLabel} &#8599;</a>
                  </article>
                ))}
              </div>
            </PixelWindow>
          )}

          <nav className="taskbar" aria-label="Window taskbar">
            <button type="button" className="start-chip" onClick={() => focus("contacts")}>
              {content.profile.desktopName}
            </button>
            {taskbarItems.map((item) => (
              <button
                type="button"
                key={item.id}
                className={windows[item.id].open ? "task-item active" : "task-item"}
                onClick={() => focus(item.id)}
              >
                {item.label}
              </button>
            ))}
            <span className="task-clock">{now}</span>
          </nav>
        </>
      ) : null}
    </main>
  );
}

function PixelWindow({
  id,
  title,
  state,
  children,
  onFocus,
  onClose,
  onDragStart,
  className = ""
}: {
  id: WindowId;
  title: string;
  state: WindowState;
  children: React.ReactNode;
  onFocus: (id: WindowId) => void;
  onClose: (id: WindowId) => void;
  onDragStart: (id: WindowId, event: PointerEvent<HTMLDivElement>) => void;
  className?: string;
}) {
  return (
    <section
      className={`pixel-window ${className}`}
      style={{
        width: state.width,
        transform: `translate3d(${state.x}px, ${state.y}px, 0)`,
        zIndex: state.z
      }}
      onPointerDown={() => onFocus(id)}
      aria-label={title || "Contacts"}
    >
      <div className="window-titlebar" onPointerDown={(event) => onDragStart(id, event)}>
        <span className="orbit-mark" aria-hidden="true" />
        {title ? <h1>{title}</h1> : <span className="title-spacer" />}
        <button type="button" aria-label={`Minimize ${title || "contacts"}`} onClick={() => onClose(id)}>
          _
        </button>
        <button type="button" aria-label="Maximize disabled">
          □
        </button>
        <button type="button" aria-label={`Close ${title || "contacts"}`} onClick={() => onClose(id)}>
          ×
        </button>
      </div>
      {children}
      <div className="window-scroll-x" aria-hidden="true">
        <span />
      </div>
    </section>
  );
}

function DotRating({ level }: { level: number }) {
  return (
    <span className="dot-rating" aria-label={`${level} out of 5`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <i className={index < level ? "filled" : ""} key={index} />
      ))}
    </span>
  );
}

function iconLabel(type: PortfolioContent["contacts"][number]["type"]) {
  switch (type) {
    case "email":
      return "✉";
    case "linkedin":
      return "in";
    case "behance":
      return "Be";
    case "instagram":
      return "◎";
    case "github":
      return "GH";
    default:
      return "↗";
  }
}
