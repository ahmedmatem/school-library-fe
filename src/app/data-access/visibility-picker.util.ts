export const GRADES = ['5','6','7','8','9','10','11','12'];
export const CLASS_LETTERS = ['А','Б','В','Г'];

export const ALL_CLASSES = [
  ...GRADES.slice(0, 3), // 5, 6, 7 (no letters)
  ...GRADES.slice(3).flatMap(g => CLASS_LETTERS.map(l => `${g}${l}`)), // 8A..12Г
];
