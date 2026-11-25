"use client";

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";

import {
  ACCEPTED_IMAGE_ACCEPT,
  getByPath,
  readImageFile,
} from "@/lib/editor";
import type {
  ExperienceEntry,
  Project,
  ProjectCaseStudy,
  ProjectCategory,
  ProjectImage,
  SectionKey,
  SkillCategory,
  SkillIcon,
} from "@/types";
import { useEditor } from "./ContentProvider";
import styles from "./SiteEditor.module.css";

const tabs = [
  "Profile",
  "Sections",
  "Experience",
  "Projects",
  "Skills",
  "Credentials",
] as const;

type Tab = (typeof tabs)[number];

const categoryOptions: ProjectCategory[] = [
  "Development",
  "IT & Systems",
  "UI/UX Design",
];

const iconOptions: SkillIcon[] = [
  "frontend",
  "backend",
  "database",
  "support",
  "design",
  "tools",
];

function Field({
  label,
  path,
  multiline = false,
}: {
  label: string;
  path: string;
  multiline?: boolean;
}) {
  const { content, setField } = useEditor();
  const value = String(getByPath(content, path) ?? "");

  return (
    <label className={styles.field}>
      <span>{label}</span>
      {multiline ? (
        <textarea
          value={value}
          rows={4}
          onChange={(event) => setField(path, event.target.value)}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(event) => setField(path, event.target.value)}
        />
      )}
    </label>
  );
}

function StringList({
  label,
  path,
  template = "",
}: {
  label: string;
  path: string;
  template?: string;
}) {
  const { content, setField, addItem, removeItem } = useEditor();
  const value = getByPath(content, path);
  const items = Array.isArray(value) ? (value as string[]) : [];

  return (
    <fieldset className={styles.list}>
      <legend>{label}</legend>
      {items.map((item, index) => (
        <div className={styles.listRow} key={`${path}-${index}`}>
          <input
            type="text"
            value={item}
            onChange={(event) =>
              setField(`${path}.${index}`, event.target.value)
            }
            aria-label={`${label} item ${index + 1}`}
          />
          <button
            type="button"
            className={styles.iconButton}
            onClick={() => removeItem(path, index)}
            aria-label={`Remove ${label} item ${index + 1}`}
          >
            ×
          </button>
        </div>
      ))}
      <button
        type="button"
        className={styles.addButton}
        onClick={() => addItem(path, template)}
      >
        + Add {label.toLowerCase()}
      </button>
    </fieldset>
  );
}

function ItemCard({
  title,
  onRemove,
  children,
}: {
  title: string;
  onRemove: () => void;
  children: ReactNode;
}) {
  return (
    <div className={styles.itemCard}>
      <div className={styles.itemHeader}>
        <strong>{title}</strong>
        <button
          type="button"
          className={styles.iconButton}
          onClick={onRemove}
          aria-label={`Remove ${title}`}
        >
          ×
        </button>
      </div>
      {children}
    </div>
  );
}

function PortraitField() {
  const { content, setField } = useEditor();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const portrait = content.profile.portrait;

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setError(null);

    const result = await readImageFile(file);
    if (inputRef.current) inputRef.current.value = "";

    if (!result.ok) {
      setError(result.message);
      return;
    }

    setField("profile.portrait.src", result.dataUrl);
    setField("profile.portrait.alt", `Portrait of ${content.profile.name}`);
    setField("profile.portrait.isPlaceholder", false);
  };

  return (
    <fieldset className={styles.list}>
      <legend>Profile photo</legend>
      <div className={styles.portraitRow}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={portrait.src} alt="Current profile preview" />
        <div>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_IMAGE_ACCEPT}
            onChange={(event) => void onFile(event.target.files?.[0])}
            aria-label="Upload a profile photo"
          />
          <p>
            PNG, JPEG, WebP, GIF, or AVIF, up to 2 MB. Uploads are stored in the
            repository when you publish.
          </p>
          {error ? (
            <p className={styles.uploadError} role="alert">
              {error}
            </p>
          ) : null}
        </div>
      </div>
      <Field label="Photo alt text" path="profile.portrait.alt" />
    </fieldset>
  );
}

function ImageUpload({
  src,
  label,
  onUploaded,
  variant = "wide",
}: {
  src?: string;
  label: string;
  onUploaded: (dataUrl: string) => void;
  variant?: "wide" | "logo";
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setError(null);

    const result = await readImageFile(file);
    if (inputRef.current) inputRef.current.value = "";

    if (!result.ok) {
      setError(result.message);
      return;
    }

    onUploaded(result.dataUrl);
  };

  return (
    <div
      className={`${styles.projectImageRow} ${
        variant === "logo" ? styles.logoUploadRow : ""
      }`}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" />
      ) : (
        <span className={styles.uploadPlaceholder} aria-hidden="true">
          +
        </span>
      )}
      <div>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_IMAGE_ACCEPT}
          onChange={(event) => void onFile(event.target.files?.[0])}
          aria-label={label}
        />
        <p>
          PNG, JPEG, WebP, GIF, or AVIF, up to 2 MB. Uploaded images are stored
          in the repository when you publish.
        </p>
        {error ? (
          <p className={styles.uploadError} role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function ProjectImageField({ index }: { index: number }) {
  const { content, setField } = useEditor();
  const project = content.projects[index];

  return (
    <fieldset className={styles.list}>
      <legend>Project preview image</legend>
      <ImageUpload
        src={project.image.src}
        label={`Upload a preview image for ${project.name}`}
        onUploaded={(dataUrl) => {
          setField(`projects.${index}.image.src`, dataUrl);
          if (!project.image.alt || project.image.alt === "Project preview") {
            setField(`projects.${index}.image.alt`, `Preview of ${project.name}`);
          }
        }}
      />
      <Field label="Preview alt text" path={`projects.${index}.image.alt`} />
    </fieldset>
  );
}

function ProjectGalleryField({
  index,
  project,
}: {
  index: number;
  project: Project;
}) {
  const { addItem, removeItem, setField } = useEditor();
  const images = project.images ?? [];

  return (
    <fieldset className={styles.list}>
      <legend>Additional images</legend>
      <p className={styles.fieldHint}>
        Add up to {MAX_PROJECT_GALLERY_IMAGES} extra screenshots. They appear as
        a gallery on the project card.
      </p>

      {images.map((image, imageIndex) => (
        <div className={styles.itemCard} key={`gallery-${imageIndex}`}>
          <div className={styles.itemHeader}>
            <strong>Image {imageIndex + 2}</strong>
            <button
              type="button"
              className={styles.iconButton}
              onClick={() =>
                removeItem(`projects.${index}.images`, imageIndex)
              }
              aria-label={`Remove image ${imageIndex + 2} from ${project.name}`}
            >
              ×
            </button>
          </div>
          <ImageUpload
            src={image.src}
            label={`Upload image ${imageIndex + 2} for ${project.name}`}
            onUploaded={(dataUrl) => {
              setField(
                `projects.${index}.images.${imageIndex}.src`,
                dataUrl,
              );
              if (!image.alt || image.alt === "Project preview") {
                setField(
                  `projects.${index}.images.${imageIndex}.alt`,
                  `${project.name} screenshot ${imageIndex + 2}`,
                );
              }
            }}
          />
          <Field
            label="Alt text"
            path={`projects.${index}.images.${imageIndex}.alt`}
          />
        </div>
      ))}

      {images.length < MAX_PROJECT_GALLERY_IMAGES ? (
        <button
          type="button"
          className={styles.addButton}
          onClick={() =>
            addItem(`projects.${index}.images`, emptyProjectImage())
          }
        >
          + Add image
        </button>
      ) : null}
    </fieldset>
  );
}

function ProfileTab() {
  return (
    <>
      <Field label="Full name" path="profile.name" />
      <Field label="Main role" path="profile.role" />
      <Field label="Hero headline" path="profile.headline" />
      <Field label="Currently focused on" path="profile.currentFocus" />
      <Field label="About introduction" path="profile.summary" multiline />
      <StringList label="Positioning tags" path="profile.positioning" />
      <Field label="About — lead line" path="profile.about.lead" multiline />
      <StringList
        label="About — paragraphs"
        path="profile.about.paragraphs"
        template="New paragraph"
      />
      <StringList label="Focus areas" path="profile.about.focus" />
      <Field label="Email" path="profile.email" />
      <Field label="Location" path="profile.location" />
      <Field label="Availability" path="profile.availability" />
      <Field label="Work preference" path="profile.workPreference" />
      <Field label="GitHub URL" path="profile.github" />
      <Field label="LinkedIn URL" path="profile.linkedin" />
      <PortraitField />
    </>
  );
}

function SectionsTab() {
  const keys: SectionKey[] = [
    "about",
    "experience",
    "projects",
    "skills",
    "credentials",
    "contact",
  ];
  return (
    <>
      {keys.map((key) => (
        <div className={styles.group} key={key}>
          <h3>{key}</h3>
          <Field label="Heading" path={`sections.${key}.title`} />
          <Field
            label="Description"
            path={`sections.${key}.description`}
            multiline
          />
        </div>
      ))}
      <Field label="Site description (SEO)" path="site.description" multiline />
    </>
  );
}

const emptyExperience: ExperienceEntry = {
  role: "New role",
  organization: "Organization",
  location: "Location",
  period: "Period",
  summary: "",
  highlights: ["Key responsibility"],
  impact: [],
};

function ExperienceLogoField({
  index,
  entry,
}: {
  index: number;
  entry: ExperienceEntry;
}) {
  const { setField } = useEditor();

  return (
    <fieldset className={styles.list}>
      <legend>Organization logo</legend>
      <ImageUpload
        src={entry.logo?.src}
        variant="logo"
        label={`Upload a logo for ${entry.organization || "this organization"}`}
        onUploaded={(dataUrl) => {
          if (entry.logo) {
            setField(`experience.${index}.logo.src`, dataUrl);
            return;
          }

          setField(`experience.${index}.logo`, {
            src: dataUrl,
            alt: `${entry.organization || "Organization"} logo`,
          });
        }}
      />
      {entry.logo ? (
        <>
          <Field
            label="Logo alt text"
            path={`experience.${index}.logo.alt`}
          />
          <button
            type="button"
            className={styles.removeButton}
            onClick={() => setField(`experience.${index}.logo`, undefined)}
          >
            Remove logo
          </button>
        </>
      ) : null}
    </fieldset>
  );
}

function ExperienceTab() {
  const { content, addItem, removeItem, setField } = useEditor();
  return (
    <>
      {content.experience.map((entry, index) => (
        <ItemCard
          key={`experience-${index}`}
          title={entry.role || `Role ${index + 1}`}
          onRemove={() => removeItem("experience", index)}
        >
          <Field label="Role" path={`experience.${index}.role`} />
          <Field label="Organization" path={`experience.${index}.organization`} />
          <Field label="Location" path={`experience.${index}.location`} />
          <Field label="Period" path={`experience.${index}.period`} />
          <ExperienceLogoField index={index} entry={entry} />
          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={Boolean(entry.current)}
              onChange={(event) =>
                setField(`experience.${index}.current`, event.target.checked)
              }
            />
            Current role
          </label>
          <Field
            label="Summary"
            path={`experience.${index}.summary`}
            multiline
          />
          <StringList
            label="Key responsibilities"
            path={`experience.${index}.highlights`}
            template="New responsibility"
          />
          <StringList
            label="Impact"
            path={`experience.${index}.impact`}
            template="Outcome with a real metric"
          />
        </ItemCard>
      ))}
      <button
        type="button"
        className={styles.addButton}
        onClick={() => addItem("experience", emptyExperience)}
      >
        + Add experience
      </button>
    </>
  );
}

const MAX_PROJECT_GALLERY_IMAGES = 3;

function emptyProjectImage(): ProjectImage {
  return {
    src: "/projects/placeholder.svg",
    alt: "Project preview",
    width: 1200,
    height: 750,
  };
}

const emptyProject: Project = {
  slug: `project-${Date.now()}`,
  name: "New project",
  category: "Development",
  description: "Describe the project.",
  technologies: ["Technology"],
  image: {
    src: "/projects/placeholder.svg",
    alt: "Project preview",
    width: 1200,
    height: 750,
  },
  images: [],
};

function CaseStudyField({
  index,
  project,
}: {
  index: number;
  project: Project;
}) {
  const { setField } = useEditor();
  const basePath = `projects.${index}.caseStudy`;

  const addCaseStudy = () => {
    const template: ProjectCaseStudy = {
      role: "",
      overview: "",
      problem: "",
      solution: "",
      approach: "",
      features: [],
      decisions: [],
      challenges: [],
      outcome: "",
      learnings: "",
    };
    setField(basePath, template);
  };

  return (
    <fieldset className={styles.list}>
      <legend>Case study</legend>
      {project.caseStudy ? (
        <>
          <Field label="Your role" path={`${basePath}.role`} />
          <Field label="Overview" path={`${basePath}.overview`} multiline />
          <Field label="Problem" path={`${basePath}.problem`} multiline />
          <Field label="Solution" path={`${basePath}.solution`} multiline />
          <Field label="Approach" path={`${basePath}.approach`} multiline />
          <StringList
            label="Key features"
            path={`${basePath}.features`}
            template="Feature and why it matters"
          />
          <StringList
            label="Stack decisions"
            path={`${basePath}.decisions`}
            template="Decision and why"
          />
          <StringList
            label="Challenges"
            path={`${basePath}.challenges`}
            template="Challenge and how it was handled"
          />
          <Field label="Outcome" path={`${basePath}.outcome`} multiline />
          <Field label="What you learned" path={`${basePath}.learnings`} multiline />
          <button
            type="button"
            className={styles.removeButton}
            onClick={() => setField(basePath, undefined)}
          >
            Remove case study
          </button>
        </>
      ) : (
        <button type="button" className={styles.addButton} onClick={addCaseStudy}>
          + Add case study
        </button>
      )}
    </fieldset>
  );
}

function ProjectsTab() {
  const { content, addItem, removeItem, setField } = useEditor();
  return (
    <>
      {content.projects.map((project, index) => (
        <ItemCard
          key={project.slug || `project-${index}`}
          title={project.name || `Project ${index + 1}`}
          onRemove={() => removeItem("projects", index)}
        >
          <Field label="Name" path={`projects.${index}.name`} />
          <Field label="Slug" path={`projects.${index}.slug`} />
          <label className={styles.field}>
            <span>Category</span>
            <select
              value={project.category}
              onChange={(event) =>
                setField(
                  `projects.${index}.category`,
                  event.target.value as ProjectCategory,
                )
              }
            >
              {categoryOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <Field
            label="Description"
            path={`projects.${index}.description`}
            multiline
          />
          <StringList
            label="Technologies"
            path={`projects.${index}.technologies`}
            template="Technology"
          />
          <Field label="Repository URL" path={`projects.${index}.repository`} />
          <Field label="Live demo URL" path={`projects.${index}.demo`} />
          <Field label="Note" path={`projects.${index}.note`} />
          <ProjectImageField index={index} />
          <ProjectGalleryField index={index} project={project} />
          <CaseStudyField index={index} project={project} />
        </ItemCard>
      ))}
      <button
        type="button"
        className={styles.addButton}
        onClick={() => addItem("projects", emptyProject)}
      >
        + Add project
      </button>
    </>
  );
}

const emptySkill: SkillCategory = {
  title: "New category",
  description: "Describe this discipline.",
  icon: "tools",
  skills: ["Skill"],
};

function SkillsTab() {
  const { content, addItem, removeItem, setField } = useEditor();
  return (
    <>
      {content.skills.map((category, index) => (
        <ItemCard
          key={`skill-${index}`}
          title={category.title || `Category ${index + 1}`}
          onRemove={() => removeItem("skills", index)}
        >
          <Field label="Title" path={`skills.${index}.title`} />
          <Field
            label="Description"
            path={`skills.${index}.description`}
            multiline
          />
          <label className={styles.field}>
            <span>Icon</span>
            <select
              value={category.icon}
              onChange={(event) =>
                setField(
                  `skills.${index}.icon`,
                  event.target.value as SkillIcon,
                )
              }
            >
              {iconOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <StringList
            label="Skills"
            path={`skills.${index}.skills`}
            template="Skill"
          />
          <Field
            label="Evidence link label"
            path={`skills.${index}.evidenceLabel`}
          />
          <Field
            label="Evidence link URL or #anchor"
            path={`skills.${index}.evidenceHref`}
          />
        </ItemCard>
      ))}
      <button
        type="button"
        className={styles.addButton}
        onClick={() => addItem("skills", emptySkill)}
      >
        + Add skill category
      </button>
    </>
  );
}

function CredentialsTab() {
  const { content, addItem, removeItem } = useEditor();
  return (
    <>
      <h3 className={styles.groupTitle}>Education</h3>
      {content.education.map((entry, index) => (
        <ItemCard
          key={`education-${index}`}
          title={entry.qualification || `Education ${index + 1}`}
          onRemove={() => removeItem("education", index)}
        >
          <Field label="Qualification" path={`education.${index}.qualification`} />
          <Field label="Institution" path={`education.${index}.institution`} />
          <Field label="Period" path={`education.${index}.period`} />
          <Field label="Detail" path={`education.${index}.detail`} multiline />
        </ItemCard>
      ))}
      <button
        type="button"
        className={styles.addButton}
        onClick={() =>
          addItem("education", {
            qualification: "New qualification",
            institution: "Institution",
            period: "Period",
            detail: "",
          })
        }
      >
        + Add education
      </button>

      <h3 className={styles.groupTitle}>Certifications</h3>
      {content.certifications.map((entry, index) => (
        <ItemCard
          key={`cert-${index}`}
          title={entry.name || `Certificate ${index + 1}`}
          onRemove={() => removeItem("certifications", index)}
        >
          <Field label="Name" path={`certifications.${index}.name`} />
          <Field label="Issuer" path={`certifications.${index}.issuer`} />
          <Field
            label="Certificate link (https:// or /certificates/file.pdf)"
            path={`certifications.${index}.link`}
          />
          <Field label="Note" path={`certifications.${index}.note`} multiline />
        </ItemCard>
      ))}
      <button
        type="button"
        className={styles.addButton}
        onClick={() =>
          addItem("certifications", {
            name: "New certificate",
            issuer: "Issuer",
            link: "",
            note: "",
          })
        }
      >
        + Add certification
      </button>
    </>
  );
}

function PublishErrorBanner({
  message,
  onDismiss,
}: {
  message: string;
  onDismiss: () => void;
}) {
  return (
    <div className={styles.publishError} role="alert">
      <span className={styles.publishErrorMark} aria-hidden="true">
        !
      </span>
      <p className={styles.publishErrorText}>
        <strong>Publish failed.</strong> {message} Your changes are still saved
        in this browser and have not been published.
      </p>
      <button
        type="button"
        className={styles.publishErrorDismiss}
        onClick={onDismiss}
        aria-label="Dismiss publish error"
      >
        ×
      </button>
    </div>
  );
}

export function SiteEditor() {
  const {
    content,
    unlocked,
    editorOpen,
    dirty,
    publishing,
    status,
    publishError,
    dismissPublishError,
    openEditor,
    closeEditor,
    exitEditor,
    resetChanges,
    publish,
  } = useEditor();
  const [tab, setTab] = useState<Tab>("Profile");
  const panelRef = useRef<HTMLElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const closeEditorRef = useRef(closeEditor);

  useEffect(() => {
    closeEditorRef.current = closeEditor;
  }, [closeEditor]);

  useEffect(() => {
    if (!editorOpen) return;

    restoreFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const panel = panelRef.current;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel
      ?.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]')
      ?.focus();

    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeEditorRef.current();
        return;
      }

      if (event.key !== "Tab" || !panel) return;

      const focusable = Array.from(
        panel.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => element.offsetParent !== null);

      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const current = document.activeElement;

      if (event.shiftKey && (current === first || !panel.contains(current))) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        (current === last || !panel.contains(current))
      ) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = originalOverflow;
      if (restoreFocusRef.current?.isConnected) {
        restoreFocusRef.current.focus();
      }
    };
  }, [editorOpen]);

  function handleTabKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    let next = index;

    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      next = (index + 1) % tabs.length;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      next = (index - 1 + tabs.length) % tabs.length;
    } else if (event.key === "Home") {
      next = 0;
    } else if (event.key === "End") {
      next = tabs.length - 1;
    } else {
      return;
    }

    event.preventDefault();
    setTab(tabs[next]);
    tabRefs.current[next]?.focus();
  }

  const downloadContent = () => {
    const blob = new Blob([JSON.stringify(content, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "content.json";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {unlocked && !editorOpen ? (
        <div
          className={`${styles.launcher} ${publishError ? styles.launcherWithError : ""}`}
          role="status"
        >
          {publishError ? (
            <PublishErrorBanner
              message={publishError}
              onDismiss={dismissPublishError}
            />
          ) : null}
          <div className={styles.launcherRow}>
            <span className={styles.launcherDot} aria-hidden="true" />
            <span>Edit mode</span>
            <button type="button" onClick={openEditor}>
              Open editor
            </button>
            <button
              type="button"
              disabled={!dirty || publishing}
              onClick={() => void publish()}
            >
              {publishing ? "Publishing…" : "Publish"}
            </button>
            <button type="button" onClick={exitEditor}>
              Exit
            </button>
          </div>
        </div>
      ) : null}

      {unlocked && editorOpen ? (
        <aside
          ref={panelRef}
          className={styles.panel}
          role="dialog"
          aria-modal="true"
          aria-labelledby="site-editor-title"
        >
          <div className={styles.panelHeader}>
            <div>
              <p className={styles.eyebrow}>Henok · private editor</p>
              <h2 id="site-editor-title">Edit your site</h2>
            </div>
            <button
              type="button"
              className={styles.iconButton}
              onClick={closeEditor}
              aria-label="Close editor"
            >
              ×
            </button>
          </div>

          <div className={styles.tabs} role="tablist" aria-label="Content groups">
            {tabs.map((item, index) => (
              <button
                key={item}
                ref={(element) => {
                  tabRefs.current[index] = element;
                }}
                type="button"
                role="tab"
                id={`site-editor-tab-${index}`}
                aria-controls="site-editor-panel"
                aria-selected={tab === item}
                tabIndex={tab === item ? 0 : -1}
                className={tab === item ? styles.tabActive : undefined}
                onClick={() => setTab(item)}
                onKeyDown={(event) => handleTabKeyDown(event, index)}
              >
                {item}
              </button>
            ))}
          </div>

          {publishError ? (
            <PublishErrorBanner
              message={publishError}
              onDismiss={dismissPublishError}
            />
          ) : null}

          <div
            className={styles.panelBody}
            role="tabpanel"
            id="site-editor-panel"
            aria-labelledby={`site-editor-tab-${tabs.indexOf(tab)}`}
            tabIndex={0}
          >
            {tab === "Profile" ? <ProfileTab /> : null}
            {tab === "Sections" ? <SectionsTab /> : null}
            {tab === "Experience" ? <ExperienceTab /> : null}
            {tab === "Projects" ? <ProjectsTab /> : null}
            {tab === "Skills" ? <SkillsTab /> : null}
            {tab === "Credentials" ? <CredentialsTab /> : null}
          </div>

          <div className={styles.panelFooter}>
            <p className={styles.status} aria-live="polite">
              {status ??
                (dirty
                  ? "Unpublished changes are saved in this browser."
                  : "Everything shown is published.")}
            </p>
            <div className={styles.footerActions}>
              <button
                type="button"
                className={styles.resetButton}
                onClick={downloadContent}
              >
                Download JSON
              </button>
              <button
                type="button"
                className={styles.resetButton}
                onClick={resetChanges}
                disabled={!dirty}
              >
                Reset
              </button>
              <button
                type="button"
                className={styles.publishButton}
                onClick={() => void publish()}
                disabled={!dirty || publishing}
              >
                {publishing ? "Publishing…" : "Publish"}
              </button>
              <button type="button" className={styles.resetButton} onClick={exitEditor}>
                Exit
              </button>
            </div>
          </div>
        </aside>
      ) : null}
    </>
  );
}
