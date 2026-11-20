/**
 * Compact brand mark used in the navbar and footer. It keeps the HN letterform
 * but draws it as a connected system rather than plain text, so it stays crisp
 * at small sizes and inherits the active theme through `currentColor`.
 */
export function BrandMark() {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M7.5 9.5V22.5M7.5 16H13M13 9.5V22.5"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18 22.5V9.5L25.5 22.5V9.5"
        stroke="currentColor"
        strokeOpacity="0.78"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="25.5" cy="22.5" r="1.5" fill="currentColor" />
    </svg>
  );
}
