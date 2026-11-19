import styles from "./Backdrop.module.css";

/**
 * Animated aurora backdrop that gives the glass surfaces something to
 * refract. Purely visual: hidden from assistive tech and non-interactive.
 */
export function Backdrop() {
  return (
    <div className={styles.backdrop} aria-hidden="true">
      <span className={`${styles.orb} ${styles.orbA}`} />
      <span className={`${styles.orb} ${styles.orbB}`} />
      <span className={`${styles.orb} ${styles.orbC}`} />
      <span className={`${styles.ribbon} ${styles.ribbonA}`} />
      <span className={`${styles.ribbon} ${styles.ribbonB}`} />
      <span className={styles.halo} />
      <span className={styles.beam} />
      <span className={styles.sweep} />
      <span className={`${styles.motes} ${styles.motesA}`} />
      <span className={`${styles.motes} ${styles.motesB}`} />
      <span className={`${styles.star} ${styles.starA}`} />
      <span className={`${styles.star} ${styles.starB}`} />
      <span className={`${styles.star} ${styles.starC}`} />
      <span className={styles.grid} />
      <span className={styles.noise} />
    </div>
  );
}
