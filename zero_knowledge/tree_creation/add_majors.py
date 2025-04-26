#!/usr/bin/env python3
"""
add_majors.py
Script to add a random major to each student in an existing courses_assigned.csv file.
"""

import pandas as pd
import random

# File path for existing assigned courses CSV\ nINPUT_CSV_FILE = 'courses_assigned.csv'

# Main function
def main():
    # Load existing data
    df = pd.read_csv("courses_assigned.csv")

    # Determine available departments
    departments = df['department'].unique().tolist()

    # Identify each student by their public key (pk_x)
    unique_students = df['pk_x'].unique()

    # Assign a random major (department) to each student
    major_map = {pk: random.choice(departments) for pk in unique_students}

    # Map majors back to every row
    df['major'] = df['pk_x'].apply(lambda pk: major_map[pk])

    # Overwrite the same CSV file with majors added
    df.to_csv("courses_assigned.csv", index=False)
    print(f"Majors added and saved back to {"courses_assigned.csv"}")

if __name__ == '__main__':
    main()
