/**
 * ocrUtils.ts
 *
 * Free, in-browser OCR powered by Tesseract.js.
 * No API key — runs entirely on the client.
 *
 * Usage:
 *   const result = await extractDocumentData(imageFile);
 *   // { firstName, lastName, documentNumber, rawText }
 */

import { createWorker } from 'tesseract.js';

export interface OcrResult {
  firstName: string | null;
  lastName: string | null;
  documentNumber: string | null;
  rawText: string;
}

export type OcrProgressCallback = (progress: number) => void;

/**
 * Run OCR on an image/PDF File and parse Moroccan CIN / driver's-licence fields.
 *
 * @param file     - File from an <input type="file"> or camera capture
 * @param onProgress - Optional callback receiving 0-100 progress
 * @param lang     - Tesseract language code(s), e.g. 'fra' for French
 */
export async function extractDocumentData(
  file: File,
  onProgress?: OcrProgressCallback,
  lang = 'fra',
): Promise<OcrResult> {
  const worker = await createWorker(lang, 1, {
    logger: (m) => {
      if (m.status === 'recognizing text' && onProgress) {
        onProgress(Math.round(m.progress * 100));
      }
    },
  });

  try {
    // ── Pass 1: PSM 6 (single block) ─────────────────────────────────────────
    // Good for connected fields (name, date of birth label rows).
    await worker.setParameters({
      tessedit_pageseg_mode: '6' as any,
      preserve_interword_spaces: '1',
    });

    const url = URL.createObjectURL(file);
    const { data: data6 } = await worker.recognize(url);

    // DEBUG — log raw OCR text so we can see exactly what Tesseract outputs.
    // Remove this line once name extraction is confirmed working.
    console.log('[OCR PSM6 raw]\n', data6.text);

    let result = parseDocumentText(data6.text);

    // ── Word-level scan (primary for document number) ─────────────────────
    // The CIN number is an isolated field at the bottom-left of the card, not
    // part of any text flow.  PSM 6 often misses it.  Scanning individual word
    // detections with OCR-error correction is far more reliable for this field.
    if (!result.documentNumber) {
      result.documentNumber = findDocumentNumberInWords((data6 as any).words);
    }

    // ── Pass 2: PSM 11 (sparse text) ─────────────────────────────────────────
    // Run whenever any field is still missing — PSM 11 often catches names
    // and numbers that PSM 6 misses on ID cards with mixed layouts.
    if (!result.documentNumber || !result.firstName || !result.lastName) {
      await worker.setParameters({
        tessedit_pageseg_mode: '11' as any,
        preserve_interword_spaces: '1',
      });
      const { data: data11 } = await worker.recognize(url);
      const r2 = parseDocumentText(data11.text);

      if (!result.documentNumber) {
        result.documentNumber =
          r2.documentNumber ?? findDocumentNumberInWords((data11 as any).words);
      }
      if (!result.firstName) result.firstName = r2.firstName;
      if (!result.lastName)  result.lastName  = r2.lastName;
    }

    URL.revokeObjectURL(url);
    return result;
  } finally {
    await worker.terminate();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Parsing helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Main entry point.
 * Strategy 1 — MRZ zone (most reliable for Moroccan CNIE / ICAO ID cards).
 * Strategy 2 — Label-based field extraction as fallback.
 */
function parseDocumentText(text: string): OcrResult {
  const result: OcrResult = {
    firstName: null,
    lastName: null,
    documentNumber: null,
    rawText: text,
  };

  if (!text.trim()) return result;

  // ── 1. MRZ parsing (primary — designed to be machine-readable) ───────────
  const mrz = parseMRZ(text);
  if (mrz.lastName)       result.lastName       = mrz.lastName;
  if (mrz.firstName)      result.firstName      = mrz.firstName;
  if (mrz.documentNumber) result.documentNumber = mrz.documentNumber;

  // Early exit if MRZ gave us everything
  if (result.lastName && result.firstName && result.documentNumber) return result;

  // ── 2. Label-based fallback ──────────────────────────────────────────────
  // Normalise: uppercase, strip Arabic/non-Latin noise, collapse whitespace.
  // We do NOT strip the whole line — we need the values.  We keep each line
  // but scan it for a recognised label prefix anywhere in the line (not just
  // at the start) to handle OCR noise or Arabic text prepended by the engine.
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const uLines = lines.map(l => l.toUpperCase());

  if (!result.lastName) {
    result.lastName = extractByLabel(uLines, [
      // "NOM : BENALI"  /  "NOM: BENALI"  /  "NOM BENALI"
      // Allow anything before the label (Arabic chars, noise from OCR)
      /(?:^|[\s:,;|])NOM(?:\s+DE\s+FAMILLE)?\s*:?\s+([A-Z\u00C0-\u024F][A-Z\u00C0-\u024F\s\-]+)/,
      /SURNAME\s*:?\s+([A-Z\u00C0-\u024F][A-Z\u00C0-\u024F\s\-]+)/,
    ], [
      'NOM', 'NOM DE FAMILLE', 'SURNAME', 'LAST NAME',
      // OCR sometimes merges the colon:
      'NOM:', 'SURNAME:',
    ]);
  }

  if (!result.firstName) {
    result.firstName = extractByLabel(uLines, [
      // "PRÉNOM(S) : MOHAMMED"  /  "PRENOM(S): MOHAMMED"  /  "PRENOMS : ..."
      /(?:^|[\s:,;|])PR[EÉ]NOM(?:S|\(S\))?\s*:?\s+([A-Z\u00C0-\u024F][A-Z\u00C0-\u024F\s\-]+)/,
      /GIVEN\s*NAMES?\s*:?\s+([A-Z\u00C0-\u024F][A-Z\u00C0-\u024F\s\-]+)/,
      /FIRST\s*NAME\s*:?\s+([A-Z\u00C0-\u024F][A-Z\u00C0-\u024F\s\-]+)/,
    ], [
      'PRÉNOM', 'PRENOM', 'PRENOMS', 'PRÉNOMS',
      'PRÉNOM(S)', 'PRENOM(S)', 'PRÉNOMS(S)',
      'GIVEN NAME', 'GIVEN NAMES', 'FIRST NAME',
      'PRÉNOM:', 'PRENOM:', 'PRÉNOMS:',
    ]);
  }

  if (!result.documentNumber) {
    // Inline label: "N° CIN BE123456"  /  "NUMÉRO: BE123456"
    const labeledNum = text.toUpperCase().match(
      /(?:N[°O\.]\s*(?:CIN|PERMIS|LICENCE)?\s*[:\-]?\s*)([A-Z]{1,2}\d{5,9}|\d{6,12})/,
    );
    if (labeledNum) result.documentNumber = labeledNum[1].trim();
  }

  if (!result.documentNumber) {
    // Moroccan CIN: 1–2 uppercase letters then 5–9 digits, not mid-word
    const cinMatch = text.toUpperCase().match(/(?<![A-Z\d])([A-Z]{1,2}\d{5,9})(?![A-Z\d])/);
    if (cinMatch) result.documentNumber = cinMatch[1];
  }

  if (!result.documentNumber) {
    // Driver's licence / other numeric IDs
    const dlMatch = text.toUpperCase().match(/(?<![A-Z\d])([A-Z]{0,3}-?\d{6,10})(?![A-Z\d])/);
    if (dlMatch) result.documentNumber = dlMatch[1];
  }

  // ── 3. Moroccan CNIE structural parsing ────────────────────────────────
  // Modern Moroccan CNIEs have NO "NOM:" / "PRÉNOM:" labels on the French
  // side.  The layout is:
  //   ROYAMUE DU MAROC / CARTE NATIONALE D'IDENTITÉ
  //   <FIRST NAME>       ← bare capitalised line
  //   <LAST NAME>        ← bare capitalised line
  //   Né le  <date>
  //   à <birth place>
  //   N°  <CIN>
  //
  // Anchor: find "NÉ LE" / "NEE LE" / "NE LE" and walk backwards.
  if (!result.firstName || !result.lastName) {
    const structural = extractMoroccanCNIENames(uLines);
    if (!result.firstName && structural.firstName) result.firstName = structural.firstName;
    if (!result.lastName  && structural.lastName)  result.lastName  = structural.lastName;
  }

  return result;
}

/**
 * Moroccan CNIE structural analysis (no labels on modern cards).
 *
 * Card layout (French side, top to bottom):
 *   ROYAUME DU MAROC / CARTE NATIONALE D'IDENTITE
 *   <ABDELILAH>      ← prénom — bare capitalised line, no label
 *   <EL IBBAWI>      ← nom — bare capitalised line, no label
 *   Né le  18.08.2001
 *   à ITZER MIDELT
 *   N°  VA154375
 *
 * Tesseract typically outputs Arabic text on the SAME line as the French text
 * (e.g. "عبدالإله ABDELILAH") — we strip all non-Latin chars before analysis.
 * Anchors: "Né le" text OR first dd.mm.yyyy date pattern.
 */
function extractMoroccanCNIENames(uLines: string[]): { firstName: string | null; lastName: string | null } {
  // Remove Arabic, Hebrew, digits, punctuation  — keep only uppercase Latin
  // (A-Z, accented), spaces, and hyphens.  uLines are already toUpperCase()d.
  const toLatinOnly = (s: string) =>
    s.replace(/[^A-Z\u00C0-\u024F\s\-]/g, ' ').replace(/\s+/g, ' ').trim();

  const latLines = uLines.map(toLatinOnly);

  // Valid name: ≥3 Latin chars, only uppercase letters / spaces / hyphens
  const isName = (s: string) =>
    s.length >= 3 && /^[A-Z\u00C0-\u024F][A-Z\u00C0-\u024F\s\-]*$/.test(s);

  // Skip card header / footer lines
  const SKIP_RE = /ROYAUME|MAROC|CARTE|NATIONAL|IDENTIT|VALABLE|ROYAU/;

  // ── Anchor: "Né le" anywhere in the (Latin-only) line, OR first date ──────
  const BIRTH_TEXT_RE = /\bN[EÉ]E?\s+LE\b/;            // matches "NÉ LE", "NEE LE", "NE LE"
  const DATE_RE       = /\b\d{2}[.\-\/]\d{2}[.\-\/]\d{2,4}\b/; // dd.mm.yyyy in ORIGINAL line

  let anchorIdx = latLines.findIndex(l => BIRTH_TEXT_RE.test(l));
  if (anchorIdx === -1) anchorIdx = uLines.findIndex(l => DATE_RE.test(l));

  // ── Strategy A: walk backwards from the anchor ───────────────────────────
  if (anchorIdx > 0) {
    const candidates: string[] = [];
    for (let i = anchorIdx - 1; i >= 0 && candidates.length < 2; i--) {
      const lat = latLines[i];
      if (isName(lat) && !SKIP_RE.test(lat)) {
        candidates.unshift(lat); // keep top-to-bottom order
      } else if (lat.length > 0 && candidates.length > 0) {
        break; // non-empty non-name line after we started collecting — stop
      }
      // empty line → keep scanning upward
    }
    if (candidates.length >= 2) {
      return { firstName: cleanName(candidates[0]), lastName: cleanName(candidates[1]) };
    }
    if (candidates.length === 1) {
      // Only last name found above anchor — try the full-scan fallback before giving up
    }
  }

  // ── Strategy B: full-scan fallback — first 2 name-like lines before any date ──
  const fallback: string[] = [];
  for (let i = 0; i < latLines.length; i++) {
    if (DATE_RE.test(uLines[i])) break;              // stop at first date
    const lat = latLines[i];
    if (isName(lat) && !SKIP_RE.test(lat)) {
      fallback.push(lat);
      if (fallback.length === 2) break;
    }
  }
  if (fallback.length >= 2) {
    return { firstName: cleanName(fallback[0]), lastName: cleanName(fallback[1]) };
  }

  // ── Strategy C: one name only ─────────────────────────────────────────────
  const singleName = anchorIdx > 0
    ? latLines.slice(0, anchorIdx).reverse().find(l => isName(l) && !SKIP_RE.test(l))
    : fallback[0];
  if (singleName) return { firstName: null, lastName: cleanName(singleName) };

  return { firstName: null, lastName: null };
}

// ─────────────────────────────────────────────────────────────────────────────
// MRZ (Machine Readable Zone) parser
//
// Moroccan CNIE uses TD1 format (ICAO 9303):
//   Line 1 (30 chars): IDMAR + document_number(9) + check + optional_data(15)
//   Line 2 (30 chars): birth_date(6) + check + sex(1) + expiry(6) + check + MAR + optional + check
//   Line 3 (30 chars): SURNAME<<GIVENNAMES<<<...
//
// OCR commonly replaces '<' with a space, and may partially garble the lines,
// so we handle both literal '<' and whitespace as name separators.
// ─────────────────────────────────────────────────────────────────────────────

interface MRZData {
  lastName?: string;
  firstName?: string;
  documentNumber?: string;
}

function parseMRZ(rawText: string): MRZData {
  const result: MRZData = {};

  // Split into non-empty lines; keep original spacing for name detection
  const lines = rawText
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l.length >= 15);

  for (const origLine of lines) {
    const line = origLine.toUpperCase();

    // ── Document number from TD1 line 1: starts with ID + 3-char country code ──
    if (!result.documentNumber) {
      // e.g. "IDMARA123456<<<<<<<<<<<<<<"
      const m = line.match(/^ID[A-Z]{3}([A-Z0-9]{1,9})[<\s]/);
      if (m) {
        const docNum = m[1].replace(/[<\s]+$/g, '').trim();
        if (docNum) result.documentNumber = docNum;
      }
    }

    // ── Name line: contains '<<' literal (surname<<givennames) ──────────────
    if (!result.lastName || !result.firstName) {
      if (line.includes('<<')) {
        const idx = line.indexOf('<<');
        const rawLast  = line.slice(0, idx);
        const rawFirst = line.slice(idx + 2);

        const lastName  = cleanNameMRZ(rawLast);
        const firstName = cleanNameMRZ(rawFirst);

        if (lastName.length >= 2 && firstName.length >= 2) {
          if (!result.lastName)  result.lastName  = lastName;
          if (!result.firstName) result.firstName = firstName;
          continue; // strong match — move on
        }
      }

      // ── Fallback: OCR replaced '<<' with 2+ spaces ───────────────────────
      // A name-only line contains only letters, spaces, and hyphens
      if (/^[A-Z][A-Z\s\-]{4,}[A-Z]$/.test(line)) {
        const parts = line.split(/\s{2,}/);
        if (parts.length === 2) {
          const lastName  = cleanNameMRZ(parts[0]);
          const firstName = cleanNameMRZ(parts[1]);
          if (lastName.length >= 2 && firstName.length >= 2) {
            if (!result.lastName)  result.lastName  = lastName;
            if (!result.firstName) result.firstName = firstName;
          }
        }
      }
    }
  }

  return result;
}

/** Strip leading/trailing filler chars and normalise internal separators to spaces. */
function cleanNameMRZ(s: string): string {
  return s
    .replace(/^[<\s]+|[<\s]+$/g, '')
    .replace(/[<]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// ─────────────────────────────────────────────────────────────────────────────
// Label-based extraction helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Scan uppercased lines for a label→value pattern.
 * Tries both inline (e.g. "NOM: DURAND") and two-line (e.g. "NOM\nDURAND") forms.
 */
function extractByLabel(
  lines: string[],
  inlinePatterns: RegExp[],
  standAloneLabels: string[],
): string | null {
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Inline: labels may appear anywhere in the line (after Arabic text / noise)
    for (const pattern of inlinePatterns) {
      const m = line.match(pattern);
      if (m) {
        const v = cleanName(m[1]);
        if (v) return v;
      }
    }

    // Standalone label: the label occupies the whole line,
    // and the value is on the next non-empty line.
    // Check both exact match AND contained-in-line (e.g. "NOM :"  or "  NOM  ").
    const isLabel = standAloneLabels.some(
      label => line === label || line === label + ':' || line === label + ' :',
    );
    const containsLabel = !isLabel && standAloneLabels.some(
      label => line.includes(label) && line.length < label.length + 4,
    );
    if ((isLabel || containsLabel) && lines[i + 1]) {
      const v = cleanName(lines[i + 1]);
      if (v) return v;
    }
  }
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Word-level document number detection
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Scan Tesseract's per-word detections for a CIN / licence number.
 *
 * The Moroccan CIN number is an isolated field at the bottom-left of the card
 * and is often not part of any reading-order text block.  Examining each word
 * individually (sorted by confidence) is far more reliable than line-regex for
 * this field.
 *
 * Common Tesseract OCR errors on the letter prefix are corrected:
 *   0 → O   (circle looks the same)
 *   1 → I   (vertical stroke)
 *   8 → B   (closed loops)
 *   5 → S   (curved top)
 */
function findDocumentNumberInWords(
  words: Array<{ text: string; confidence: number }> | null | undefined,
): string | null {
  if (!words?.length) return null;

  // Check adjacent-word pairs too (Tesseract sometimes splits "BE" from "123456")
  const tokens: string[] = [];
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    if (w.confidence < 25) continue;
    tokens.push(w.text);
    if (i + 1 < words.length && words[i + 1].confidence >= 25) {
      tokens.push(w.text + words[i + 1].text);
    }
  }

  for (const raw of tokens) {
    // Strip spaces and common OCR noise chars, then uppercase
    const clean = raw.replace(/[\s.,:;|_\-'"]/g, '').toUpperCase();
    if (clean.length < 6 || clean.length > 11) continue;

    if (/^[A-Z]{1,2}\d{5,9}$/.test(clean)) return clean;

    // Try correcting misread letter prefix
    const fixed = fixOCRLetterPrefix(clean);
    if (fixed !== clean && /^[A-Z]{1,2}\d{5,9}$/.test(fixed)) return fixed;
  }

  return null;
}

/**
 * Correct common OCR misreads at the alphabetic prefix of a Moroccan CIN.
 * Digits at the start of the string that look like letters are swapped.
 */
function fixOCRLetterPrefix(s: string): string {
  const map: Record<string, string> = { '0': 'O', '1': 'I', '8': 'B', '5': 'S' };
  // Fix up to 2 leading characters
  return s.replace(/^([0158]{1,2})(\d{5,9})$/, (_, prefix, digits) =>
    [...prefix].map(c => map[c] ?? c).join('') + digits,
  );
}

/**
 * Clean a name token: keep Unicode uppercase letters (covers accented
 * characters like É, À, Â that appear in French transliterations),
 * spaces, and hyphens.
 */
function cleanName(raw: string): string {
  return raw.replace(/[^\p{Lu}\s\-]/gu, '').replace(/\s+/g, ' ').trim();
}
