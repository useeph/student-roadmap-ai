/**
 * Maps university names to Clearbit logo domain for displaying small logos.
 * Used in chat messages when colleges are mentioned.
 */
const UNIVERSITY_TO_DOMAIN: Record<string, string> = {
  "Massachusetts Institute of Technology": "mit.edu",
  MIT: "mit.edu",
  "Stanford University": "stanford.edu",
  Stanford: "stanford.edu",
  "Harvard University": "harvard.edu",
  Harvard: "harvard.edu",
  "University of California, Berkeley": "berkeley.edu",
  "UC Berkeley": "berkeley.edu",
  Berkeley: "berkeley.edu",
  "Carnegie Mellon University": "cmu.edu",
  "Carnegie Mellon": "cmu.edu",
  CMU: "cmu.edu",
  "Georgia Institute of Technology": "gatech.edu",
  "Georgia Tech": "gatech.edu",
  "California Institute of Technology": "caltech.edu",
  Caltech: "caltech.edu",
  "Princeton University": "princeton.edu",
  Princeton: "princeton.edu",
  "Yale University": "yale.edu",
  Yale: "yale.edu",
  "Columbia University": "columbia.edu",
  Columbia: "columbia.edu",
  "University of Pennsylvania": "upenn.edu",
  Penn: "upenn.edu",
  UPenn: "upenn.edu",
  "Duke University": "duke.edu",
  Duke: "duke.edu",
  "Northwestern University": "northwestern.edu",
  Northwestern: "northwestern.edu",
  "University of Chicago": "uchicago.edu",
  UChicago: "uchicago.edu",
  "Cornell University": "cornell.edu",
  Cornell: "cornell.edu",
  "University of California, Los Angeles": "ucla.edu",
  UCLA: "ucla.edu",
  "University of Michigan": "umich.edu",
  "University of Southern California": "usc.edu",
  USC: "usc.edu",
  "New York University": "nyu.edu",
  NYU: "nyu.edu",
};

export function getUniversityLogoUrl(name: string): string | null {
  const domain = UNIVERSITY_TO_DOMAIN[name];
  if (domain) return `https://logo.clearbit.com/${domain}`;
  return null;
}

export function getUniversityInitial(name: string): string {
  // For "University of X" use first letter of X; otherwise first letter of name
  const ofMatch = name.match(/University of ([A-Za-z])/);
  if (ofMatch) return ofMatch[1].toUpperCase();
  return name.charAt(0).toUpperCase() || "?";
}
