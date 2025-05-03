export const PROFESSOR_CODES = {
  "Dr. Alice Smith": 0,
  "Dr. Bob Johnson": 1,
  "Dr. Carol Williams": 2,
  "Dr. David Brown": 3,
  "Dr. Emma Davis": 4,
  "Dr. Frank Miller": 5,
  "Dr. Grace Wilson": 6,
  "Dr. Henry Moore": 7,
};

export const GRADES = [
  "F", "D", "C-", "C", "C+", "B-", "B", "B+", "A-", "A",
];

export const GRADE_CODES = GRADES.reduce((acc, g, idx) => {
  acc[g] = idx;
  return acc;
}, {});

export const COURSE_FIXED = {
  "101": 0,
  "102": 1,
  "201": 2,
  "202": 3,
  "301": 4,
  "302": 5,
  "595": 6,
};

export const COLLEGE_MULT = 1 << 15;
export const DEPT_MULT = 1 << 12;
export const COURSE_MULT = 1 << 9;
