/**
 * medical-sanitizer.ts
 * Specialized HTML cleaning for medical records.
 * Optimized for Google Docs paste behavior.
 */

export function smartSanitize(html: string): string {
  if (!html) return "";

  // 1. Initial cleanup: Remove comments and script tags
  let clean = html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "");

  // 2. Remove heavy Google Docs attributes (but KEEP 'id' for navigation)
  clean = clean.replace(/\s(dir|class|lang|on[a-z]+)="[^"]*"/gi, "");

  // 3. Smart Style Sanitization
  // We want to KEEP bold, italic, and color intents, but REMOVE fixed fonts and sizes
  clean = clean.replace(/style="([^"]*)"/gi, (match, styles: string) => {
    const styleMap = styles.split(";").reduce((acc, style) => {
      const [prop, val] = style.split(":").map(s => s.trim().toLowerCase());
      if (prop && val) acc[prop] = val;
      return acc;
    }, {} as Record<string, string>);

    const keptStyles: string[] = [];

    // Keep Bold intent
    if (styleMap["font-weight"] === "700" || styleMap["font-weight"] === "bold") {
      keptStyles.push("font-weight: bold");
    }

    // Keep Italic intent
    if (styleMap["font-style"] === "italic") {
      keptStyles.push("font-style: italic");
    }

    // Keep Underline intent
    if (styleMap["text-decoration"]?.includes("underline")) {
      keptStyles.push("text-decoration: underline");
    }

    // Keep Color intent but NORMALIZE IT
    // If it's pure black or white, we ignore it to let the theme handle it.
    // Otherwise, we keep it but maybe wrap in a theme-safe way if it's a known medical color.
    if (styleMap["color"]) {
      const color = styleMap["color"];
      if (!isNeutralColor(color)) {
        keptStyles.push(`color: ${color}`);
      }
    }

    // Keep Background Highlights (Common in clinical notes)
    if (styleMap["background-color"]) {
      const bgColor = styleMap["background-color"];
      if (!isNeutralColor(bgColor)) {
        keptStyles.push(`background-color: ${bgColor}`);
        keptStyles.push(`padding: 0 4px`);
        keptStyles.push(`border-radius: 2px`);
      }
    }

    return keptStyles.length > 0 ? `style="${keptStyles.join("; ")}"` : "";
  });

  // 4. Clean up empty tags and normalize spacing
  clean = clean.replace(/<span>(.*?)<\/span>/gi, (match, content) => {
    // If a span has no style, just return the content
    if (!match.includes("style=")) return content;
    return match;
  });

  return clean;
}

function isNeutralColor(color: string): boolean {
  if (!color) return true;
  const c = color.toLowerCase().replace(/\s/g, "");
  
  // Detect near-black and near-white variations
  const neutrals = [
    "#000", "#000000", "#fff", "#ffffff", "black", "white", "transparent", 
    "rgb(0,0,0)", "rgb(255,255,255)", "rgba(0,0,0,0)",
    "rgb(31,31,31)", // Near black from Google Docs
    "rgb(34,34,34)", // Near black
    "rgb(250,250,250)", // Near white
    "rgb(241,241,241)"  // Near white from Google Docs
  ];
  
  // If it's a very dark gray or a very light gray, we treat it as neutral to let the theme handle it
  if (c.startsWith("rgb(")) {
    const parts = c.match(/\d+/g);
    if (parts && parts.length >= 3) {
      const r = parseInt(parts[0]);
      const g = parseInt(parts[1]);
      const b = parseInt(parts[2]);
      
      // Near black check
      if (r < 50 && g < 50 && b < 50) return true;
      // Near white check
      if (r > 200 && g > 200 && b > 200) return true;
    }
  }

  return neutrals.some(n => c.includes(n));
}
