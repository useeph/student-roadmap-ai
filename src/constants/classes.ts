/**
 * High school course options grouped by category.
 * Used for the Current Classes searchable multi-select.
 */

export interface ClassOption {
  value: string;
  label: string;
  category: string;
}

export const CLASS_CATEGORIES = [
  "Math",
  "Science",
  "Computer Science",
  "English",
  "Social Studies",
  "Foreign Language",
  "Arts",
  "Electives",
] as const;

export const CLASS_OPTIONS: ClassOption[] = [
  // Math
  { value: "Algebra II", label: "Algebra II", category: "Math" },
  { value: "Precalculus", label: "Precalculus", category: "Math" },
  { value: "AP Calculus AB", label: "AP Calculus AB", category: "Math" },
  { value: "AP Calculus BC", label: "AP Calculus BC", category: "Math" },
  { value: "Statistics", label: "Statistics", category: "Math" },
  { value: "AP Statistics", label: "AP Statistics", category: "Math" },
  { value: "Calculus", label: "Calculus", category: "Math" },
  { value: "Geometry", label: "Geometry", category: "Math" },
  { value: "Algebra I", label: "Algebra I", category: "Math" },
  // Science
  { value: "Biology", label: "Biology", category: "Science" },
  { value: "AP Biology", label: "AP Biology", category: "Science" },
  { value: "Chemistry", label: "Chemistry", category: "Science" },
  { value: "AP Chemistry", label: "AP Chemistry", category: "Science" },
  { value: "Physics", label: "Physics", category: "Science" },
  { value: "AP Physics 1", label: "AP Physics 1", category: "Science" },
  { value: "AP Physics 2", label: "AP Physics 2", category: "Science" },
  { value: "AP Physics C: Mechanics", label: "AP Physics C: Mechanics", category: "Science" },
  { value: "AP Physics C: E&M", label: "AP Physics C: E&M", category: "Science" },
  { value: "Environmental Science", label: "Environmental Science", category: "Science" },
  { value: "AP Environmental Science", label: "AP Environmental Science", category: "Science" },
  // Computer Science
  { value: "Computer Science Principles", label: "Computer Science Principles", category: "Computer Science" },
  { value: "AP Computer Science Principles", label: "AP Computer Science Principles", category: "Computer Science" },
  { value: "AP Computer Science A", label: "AP Computer Science A", category: "Computer Science" },
  { value: "Introduction to Programming", label: "Introduction to Programming", category: "Computer Science" },
  { value: "Data Structures", label: "Data Structures", category: "Computer Science" },
  // English
  { value: "English 9", label: "English 9", category: "English" },
  { value: "English 10", label: "English 10", category: "English" },
  { value: "English 11", label: "English 11", category: "English" },
  { value: "English 12", label: "English 12", category: "English" },
  { value: "AP English Language", label: "AP English Language", category: "English" },
  { value: "AP English Literature", label: "AP English Literature", category: "English" },
  { value: "Honors English", label: "Honors English", category: "English" },
  // Social Studies
  { value: "World History", label: "World History", category: "Social Studies" },
  { value: "AP World History", label: "AP World History", category: "Social Studies" },
  { value: "US History", label: "US History", category: "Social Studies" },
  { value: "AP US History", label: "AP US History", category: "Social Studies" },
  { value: "Government", label: "Government", category: "Social Studies" },
  { value: "AP US Government", label: "AP US Government", category: "Social Studies" },
  { value: "Economics", label: "Economics", category: "Social Studies" },
  { value: "AP Economics", label: "AP Economics", category: "Social Studies" },
  { value: "Psychology", label: "Psychology", category: "Social Studies" },
  { value: "AP Psychology", label: "AP Psychology", category: "Social Studies" },
  // Foreign Language
  { value: "Spanish I", label: "Spanish I", category: "Foreign Language" },
  { value: "Spanish II", label: "Spanish II", category: "Foreign Language" },
  { value: "Spanish III", label: "Spanish III", category: "Foreign Language" },
  { value: "AP Spanish", label: "AP Spanish", category: "Foreign Language" },
  { value: "French I", label: "French I", category: "Foreign Language" },
  { value: "French II", label: "French II", category: "Foreign Language" },
  { value: "AP French", label: "AP French", category: "Foreign Language" },
  { value: "Mandarin Chinese", label: "Mandarin Chinese", category: "Foreign Language" },
  { value: "Latin", label: "Latin", category: "Foreign Language" },
  // Arts
  { value: "Art I", label: "Art I", category: "Arts" },
  { value: "AP Art History", label: "AP Art History", category: "Arts" },
  { value: "AP Studio Art", label: "AP Studio Art", category: "Arts" },
  { value: "Music Theory", label: "Music Theory", category: "Arts" },
  { value: "AP Music Theory", label: "AP Music Theory", category: "Arts" },
  { value: "Theater", label: "Theater", category: "Arts" },
  { value: "Drama", label: "Drama", category: "Arts" },
  // Electives
  { value: "Robotics", label: "Robotics", category: "Electives" },
  { value: "Engineering Design", label: "Engineering Design", category: "Electives" },
  { value: "Journalism", label: "Journalism", category: "Electives" },
  { value: "Yearbook", label: "Yearbook", category: "Electives" },
  { value: "Debate", label: "Debate", category: "Electives" },
  { value: "Health", label: "Health", category: "Electives" },
  { value: "Physical Education", label: "Physical Education", category: "Electives" },
];
