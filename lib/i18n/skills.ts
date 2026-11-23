export type SkillsLanguage = "en" | "am";

export const skillsUi = {
  en: {
    languageLabel: "Language",
    languageGroup: "Skills section language",
    english: "English",
    amharic: "አማርኛ",
    eyebrow: "Skills",
  },
  am: {
    languageLabel: "ቋንቋ",
    languageGroup: "የክህሎት ክፍል ቋንቋ",
    english: "እንግሊዝኛ",
    amharic: "አማርኛ",
    eyebrow: "ክህሎቶች",
  },
} as const;

/**
 * Amharic translations for the Skills section UI and key copy. Untranslated,
 * editor-provided strings intentionally fall back to English rather than
 * inventing a translation at runtime.
 */
const amharicCopy: Record<string, string> = {
  "Tools I use, with evidence.": "የምጠቀምባቸው መሳሪያዎች፣ በማስረጃ።",
  "Grouped by discipline and linked to the projects or experience where they appear — no arbitrary percentages.":
    "በዘርፍ ተከፋፍለው፣ በሚታዩባቸው ፕሮጀክቶች ወይም ልምድ የተሳሰሩ — ያለ ዘፈቀደ መቶኛ።",

  "Frontend Development": "የፊት-ገጽ ልማት",
  "Component-driven interfaces built to stay clear and responsive.":
    "ግልጽ እና ምላሽ ሰጪ እንዲሆኑ የተገነቡ ክፍሎችን መሰረት ያደረጉ በይነገጾች።",
  "Backend Development": "የኋላ-ገጽ ልማት",
  "Application logic, server routes, and API workflows.":
    "የመተግበሪያ ሎጂክ፣ የሰርቨር መስመሮች እና የኤፒአይ ሂደቶች።",
  Databases: "የውሂብ ጎታዎች",
  "Structured storage and dependable data access.":
    "የተደራጀ ማከማቻ እና አስተማማኝ የውሂብ መዳረሻ።",
  "IT Infrastructure & Support": "የአይቲ መሠረተ ልማትና ድጋፍ",
  "Keeping hardware, software, and networks dependable.":
    "ሃርድዌር፣ ሶፍትዌር እና አውታረ መረቦች አስተማማኝ እንዲሆኑ ማድረግ።",
  "UI/UX Design": "የዩአይ/ዩኤክስ ዲዛይን",
  "Turning requirements into clear, usable interfaces.":
    "መስፈርቶችን ግልጽና ጥቅም ላይ ሊውሉ ወደሚችሉ በይነገጾች መቀየር።",
  "Development Tools": "የልማት መሳሪያዎች",
  "The everyday environment behind the work.":
    "ስራውን የሚደግፍ ዕለታዊ አካባቢ።",

  "Responsive layouts": "ምላሽ ሰጪ አቀማመጦች",
  "IT Support": "የአይቲ ድጋፍ",
  "Hardware Troubleshooting": "የሃርድዌር ችግር መፍታት",
  "Software Installation & Configuration": "የሶፍትዌር ጭነትና ውቅር",
  "Network Troubleshooting": "የአውታረ መረብ ችግር መፍታት",
  "System Maintenance": "የስርዓት ጥገና",
  Wireframing: "የዋይርፍሬም ዝግጅት",
  "User-Centered Design": "ተጠቃሚን ያማከለ ዲዛይን",

  "SmartCV case study": "የ SmartCV ጥናት",
  "Mesob Connect case study": "የ Mesob Connect ጥናት",
  "Mesob data model": "የ Mesob ውሂብ ሞዴል",
  "Addis Mesob role": "በ Addis Mesob ያከናወነው ሚና",
  "Counseling design project": "የምክር ዲዛይን ፕሮጀክት",
  "Projects and repositories": "ፕሮጀክቶች እና ማከማቻዎች",
  "(opens in a new tab)": "(በአዲስ ትር ይከፈታል)",
};

export function translateSkillsCopy(
  text: string,
  language: SkillsLanguage,
): string {
  if (language === "en") return text;
  return amharicCopy[text] ?? text;
}
