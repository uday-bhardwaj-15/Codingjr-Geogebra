import { GeoObject } from '../../types/geo';

export function getNextPointLabel(objects: GeoObject[]): string {
  const existingLabels = new Set(objects.map((o) => o.label));
  
  // Try A-Z
  for (let i = 0; i < 26; i++) {
    const letter = String.fromCharCode(65 + i); // 'A' -> 'Z'
    if (!existingLabels.has(letter)) {
      return letter;
    }
  }

  // Try A_1, B_1, ..., A_2, etc.
  for (let suffix = 1; suffix < 100; suffix++) {
    for (let i = 0; i < 26; i++) {
      const label = `${String.fromCharCode(65 + i)}_${suffix}`;
      if (!existingLabels.has(label)) {
        return label;
      }
    }
  }

  return `P_${objects.length + 1}`;
}

export function getNextSliderLabel(objects: GeoObject[]): string {
  const existingLabels = new Set(objects.map((o) => o.label));

  // Try a, b, c, d, e, ..., z (standard GeoGebra order)
  const letters = ['a', 'b', 'c', 'd', 'k', 'm', 'n', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'e', 'f', 'g', 'h', 'i', 'j', 'l', 'o', 'z'];
  for (const letter of letters) {
    if (!existingLabels.has(letter)) {
      return letter;
    }
  }

  for (let suffix = 1; suffix < 100; suffix++) {
    for (const letter of ['a', 'b', 'c', 'd']) {
      const label = `${letter}_${suffix}`;
      if (!existingLabels.has(label)) {
        return label;
      }
    }
  }

  return `s_${objects.length + 1}`;
}

export function getNextLineLabel(objects: GeoObject[]): string {
  const existingLabels = new Set(objects.map((o) => o.label));
  const lineLetters = ['f', 'g', 'h', 'p', 'q', 'r', 's', 't', 'l', 'm', 'k'];
  for (const letter of lineLetters) {
    if (!existingLabels.has(letter)) {
      return letter;
    }
  }

  return `l_${objects.length + 1}`;
}
