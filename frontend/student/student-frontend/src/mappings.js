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
  "ENG": 
  {
    "101": 0,
    "102": 1,
    "201": 2,
    "202": 3,
    "301": 4,
    "302": 5,
  },
  "CAS": 
  {
    "101": 0,
    "102": 1,
    "201": 2,
    "202": 3,
    "301": 4,
    "302": 5,
    "595": 6
  }
};

export const collegeMap = {
  "ENG": 0,
  "CAS": 1,
};

export const COLLEGES = ["ENG", "CAS"]

export const departmentMap = {
  'ENG': 
    {
      'Mechanical Engineering': 0,
      'Biomedical Engineering': 1,
      'Electrical and Computer Engineering': 2,
      'Systems Engineering': 3
    },
  'CAS': 
    {
    'English': 0,
    'Economics': 1,
    'Mathematics': 2,
    'Computer Science': 3
  }
};

export const majorMap =  {
  'ENG':
  {
    'Biomedical Engineering': 0,
    'Systems Engineering': 1,
    'English': 2,
    'Computer Science': 3,
    'Mechanical Engineering': 4,
    'Economics': 5,
    'Electrical and Computer Engineering ': 6,
    'Mathematics': 7
  },
  'CAS': 
  {
    'Biomedical Engineering': 0,
    'Systems Engineering': 1,
    'English': 2,
    'Computer Science': 3,
    'Mechanical Engineering': 4,
    'Economics': 5,
    'Electrical and Computer Engineering ': 6,
    'Mathematics': 7
  }
};

export const COLLEGE_MULT = 1 << 15;
export const DEPT_MULT = 1 << 12;
export const COURSE_MULT = 1 << 9;
