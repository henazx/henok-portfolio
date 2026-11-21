"use client";

import { useEditor } from "@/components/editor/ContentProvider";
import { SectionHeading } from "@/components/ui/SectionHeading";
import styles from "./About.module.css";

export function About() {
  const { content } = useEditor();
  const { profile, education, experience, sections } = content;
  const currentRole = experience.find((entry) => entry.current) ?? experience[0];
  const primaryDegree = education[0];
  const copy = sections.about;

  return (
    <section className="section" id="about" aria-labelledby="about-title">
      <div className="container">
        <SectionHeading
          index="01"
          eyebrow="About"
          titleId="about-title"
          title={copy.title}
          description={copy.description}
        />

        <div className={styles.grid} data-reveal>
          <div className={styles.leadColumn} data-glow>
            <p className={styles.lead}>{profile.about.lead}</p>

            <ul className={styles.focus} aria-label="Focus areas">
              {profile.about.focus.map((item, index) => (
                <li key={`${item}-${index}`}>
                  <span className={styles.focusMark} aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.bodyColumn}>
            {profile.summary ? (
              <p className={styles.intro}>{profile.summary}</p>
            ) : null}
            {profile.about.paragraphs.map((paragraph, index) => (
              <p key={`${index}-${paragraph.slice(0, 24)}`}>{paragraph}</p>
            ))}
          </div>
        </div>

        <dl
          className={styles.facts}
          data-glow
          data-reveal
          style={{ transitionDelay: "80ms" }}
        >
          <div className={styles.fact}>
            <dt>Based in</dt>
            <dd>{profile.location}</dd>
          </div>
          <div className={styles.fact}>
            <dt>Education</dt>
            <dd>
              {primaryDegree?.qualification}
              <span className={styles.factDetail}>
                {primaryDegree?.institution}
              </span>
            </dd>
          </div>
          <div className={styles.fact}>
            <dt>Current role</dt>
            <dd>
              {currentRole?.role}
              <span className={styles.factDetail}>
                {currentRole?.organization}
              </span>
            </dd>
          </div>
          <div className={styles.fact}>
            <dt>Focus</dt>
            <dd>
              {profile.currentFocus ?? profile.about.focus[0]}
              {profile.currentFocus && profile.about.focus[1] ? (
                <span className={styles.factDetail}>
                  {profile.about.focus.slice(1).join(" · ")}
                </span>
              ) : null}
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
