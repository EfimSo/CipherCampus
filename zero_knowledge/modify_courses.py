#!/usr/bin/env python3
"""
process_courses.py
Script to assign keypairs, professors, and grades to courses data.
"""

import json
import pandas as pd
import random

# Constants for file paths
GRUMPKIN_KEYPAIRS_FILE = '/Users/mehmetborasarioglu/Desktop/allah_buyuktur/grumpkin_keygen/grumpkin_keypairs.json'
COURSES_CSV_FILE = 'courses.csv'
OUTPUT_CSV_FILE = 'courses_assigned.csv'

# List of professor names to choose from
PROFESSOR_NAMES = [
    'Dr. Alice Smith',
    'Dr. Bob Johnson',
    'Dr. Carol Williams',
    'Dr. David Brown',
    'Dr. Emma Davis',
    'Dr. Frank Miller',
    'Dr. Grace Wilson',
    'Dr. Henry Moore'
]

# Possible letter grades
GRADES = ['F', 'D', 'C-', 'C', 'C+', 'B-', 'B', 'B+', 'A-', 'A']


def load_keypairs(filepath):
    """Load JSON keypairs from file."""
    with open(filepath, 'r') as f:
        return json.load(f)


def assign_keypairs_to_students(df, keypairs):
    """
    Assign a unique keypair to each student.
    Raises ValueError if not enough keypairs.
    """
    students = df['student_id'].unique()
    if len(students) > len(keypairs):
        raise ValueError("Not enough keypairs for number of students in data.")
    random.shuffle(keypairs)
    return {sid: keypairs[i] for i, sid in enumerate(students)}


def assign_professors(df):
    """
    For each distinct course, choose 1 or 2 professors who teach it.
    Returns a dict mapping (college, department, course_number) -> [professor_names]
    """
    courses = df[['college', 'department', 'course_number']].drop_duplicates()
    course_map = {}
    for _, row in courses.iterrows():
        key = (row['college'], row['department'], row['course_number'])
        count = random.choice([1, 2])
        profs = random.sample(PROFESSOR_NAMES, k=count)
        course_map[key] = profs
    return course_map


def main():
    # Load data
    df = pd.read_csv(COURSES_CSV_FILE)
    keypairs = load_keypairs(GRUMPKIN_KEYPAIRS_FILE)

    # Assign keypairs per student
    kp_map = assign_keypairs_to_students(df, keypairs)
    df['pk_x'] = df['student_id'].apply(lambda sid: kp_map[sid]['pk_x'])
    df['pk_y'] = df['student_id'].apply(lambda sid: kp_map[sid]['pk_y'])
    df.drop(columns=['student_id'], inplace=True)

    # Determine which professors teach each course
    prof_map = assign_professors(df)
    # For each student-course row, randomly pick one of the assigned professors
    df['professor'] = df.apply(
        lambda row: random.choice(
            prof_map[(row['college'], row['department'], row['course_number'])]
        ), axis=1
    )

    # Assign random grades
    df['grade'] = df.apply(lambda _: random.choice(GRADES), axis=1)

    # Save to CSV
    df.to_csv(OUTPUT_CSV_FILE, index=False)
    print(f"Saved assigned courses to {OUTPUT_CSV_FILE}")

if __name__ == '__main__':
    main()
