import styles from "./Backdrop.module.css";

/**
 * Static atmospheric base. The earlier animated aurora/ribbons/particles were
 * visually noisy and kept compositor work running for the whole session, so the
 * premium treatment now uses only a soft wash, a quiet grid and fine grain.
 */
export function Backdrop() {
  return (
    <div className={styles.backdrop} aria-hidden="true">
      <span className={styles.wash} />
      <span className={styles.grid} />
      <span className={styles.noise} />
    </div>
  );
}
