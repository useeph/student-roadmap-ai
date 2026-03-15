/**
 * University options for the premium college selector.
 * Includes aliases for search and recommended/popular flags.
 */

export interface UniversityOption {
  label: string;
  value: string;
  aliases: string[];
  recommended?: boolean;
}

export const UNIVERSITY_OPTIONS: UniversityOption[] = [
  { label: "Massachusetts Institute of Technology", value: "Massachusetts Institute of Technology", aliases: ["MIT"], recommended: true },
  { label: "Stanford University", value: "Stanford University", aliases: ["Stanford"], recommended: true },
  { label: "Carnegie Mellon University", value: "Carnegie Mellon University", aliases: ["CMU", "Carnegie Mellon"], recommended: true },
  { label: "Georgia Institute of Technology", value: "Georgia Institute of Technology", aliases: ["Georgia Tech", "Georgia Tech"], recommended: true },
  { label: "University of California, Berkeley", value: "University of California, Berkeley", aliases: ["Berkeley", "UC Berkeley", "Cal"], recommended: true },
  { label: "Harvard University", value: "Harvard University", aliases: ["Harvard"] },
  { label: "Princeton University", value: "Princeton University", aliases: ["Princeton"] },
  { label: "Yale University", value: "Yale University", aliases: ["Yale"] },
  { label: "Columbia University", value: "Columbia University", aliases: ["Columbia"] },
  { label: "University of Pennsylvania", value: "University of Pennsylvania", aliases: ["UPenn", "Penn"] },
  { label: "California Institute of Technology", value: "California Institute of Technology", aliases: ["Caltech"] },
  { label: "Duke University", value: "Duke University", aliases: ["Duke"] },
  { label: "Northwestern University", value: "Northwestern University", aliases: ["Northwestern"] },
  { label: "Brown University", value: "Brown University", aliases: ["Brown"] },
  { label: "Cornell University", value: "Cornell University", aliases: ["Cornell"] },
  { label: "Johns Hopkins University", value: "Johns Hopkins University", aliases: ["Johns Hopkins", "JHU"] },
  { label: "University of Chicago", value: "University of Chicago", aliases: ["UChicago", "Chicago"] },
  { label: "Rice University", value: "Rice University", aliases: ["Rice"] },
  { label: "Vanderbilt University", value: "Vanderbilt University", aliases: ["Vanderbilt", "Vandy"] },
  { label: "Dartmouth College", value: "Dartmouth College", aliases: ["Dartmouth"] },
  { label: "University of California, Los Angeles", value: "University of California, Los Angeles", aliases: ["UCLA"] },
  { label: "University of Michigan", value: "University of Michigan", aliases: ["Michigan", "UMich"] },
  { label: "University of Southern California", value: "University of Southern California", aliases: ["USC"] },
  { label: "New York University", value: "New York University", aliases: ["NYU"] },
  { label: "Purdue University", value: "Purdue University", aliases: ["Purdue"] },
  { label: "University of Illinois Urbana-Champaign", value: "University of Illinois Urbana-Champaign", aliases: ["UIUC", "Illinois"] },
  { label: "University of Washington", value: "University of Washington", aliases: ["UW", "UW Seattle"] },
  { label: "University of Texas at Austin", value: "University of Texas at Austin", aliases: ["UT Austin", "Texas"] },
  { label: "University of Wisconsin-Madison", value: "University of Wisconsin-Madison", aliases: ["Wisconsin", "UW-Madison"] },
  { label: "Penn State University", value: "Penn State University", aliases: ["Penn State", "PSU"] },
  { label: "Rutgers University", value: "Rutgers University", aliases: ["Rutgers"] },
  { label: "Boston University", value: "Boston University", aliases: ["BU", "Boston U"] },
  { label: "Northeastern University", value: "Northeastern University", aliases: ["Northeastern", "Northeastern"] },
  { label: "University of Florida", value: "University of Florida", aliases: ["UF", "Florida"] },
  { label: "Ohio State University", value: "Ohio State University", aliases: ["Ohio State", "OSU"] },
  { label: "University of Maryland", value: "University of Maryland", aliases: ["Maryland", "UMD"] },
  { label: "Virginia Tech", value: "Virginia Tech", aliases: ["Virginia Tech", "VT"] },
  { label: "Texas A&M University", value: "Texas A&M University", aliases: ["Texas A&M", "TAMU"] },
  { label: "Arizona State University", value: "Arizona State University", aliases: ["ASU", "Arizona State"] },
  { label: "University of California, San Diego", value: "University of California, San Diego", aliases: ["UCSD", "UC San Diego"] },
  { label: "University of California, Irvine", value: "University of California, Irvine", aliases: ["UCI", "UC Irvine"] },
  { label: "University of California, Davis", value: "University of California, Davis", aliases: ["UC Davis", "Davis"] },
  { label: "University of Minnesota", value: "University of Minnesota", aliases: ["Minnesota", "UMN"] },
  { label: "University of Pittsburgh", value: "University of Pittsburgh", aliases: ["Pitt", "Pittsburgh"] },
  { label: "University of Virginia", value: "University of Virginia", aliases: ["UVA", "Virginia"] },
  { label: "University of North Carolina at Chapel Hill", value: "University of North Carolina at Chapel Hill", aliases: ["UNC", "North Carolina"] },
  { label: "University of Notre Dame", value: "University of Notre Dame", aliases: ["Notre Dame"] },
  { label: "Emory University", value: "Emory University", aliases: ["Emory"] },
  { label: "Georgetown University", value: "Georgetown University", aliases: ["Georgetown"] },
  { label: "Tufts University", value: "Tufts University", aliases: ["Tufts"] },
  { label: "Boston College", value: "Boston College", aliases: ["BC", "Boston College"] },
  { label: "Williams College", value: "Williams College", aliases: ["Williams"] },
  { label: "Amherst College", value: "Amherst College", aliases: ["Amherst"] },
  { label: "Swarthmore College", value: "Swarthmore College", aliases: ["Swarthmore"] },
  { label: "Pomona College", value: "Pomona College", aliases: ["Pomona"] },
  { label: "Wellesley College", value: "Wellesley College", aliases: ["Wellesley"] },
  { label: "Harvey Mudd College", value: "Harvey Mudd College", aliases: ["Harvey Mudd", "HMC"] },
];

export const RECOMMENDED_UNIVERSITIES = UNIVERSITY_OPTIONS.filter((u) => u.recommended);
export const UNIVERSITIES = UNIVERSITY_OPTIONS;
