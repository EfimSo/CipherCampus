import os
import re
import json
import pandas as pd
import random
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.backends import default_backend

# File paths
PUBLIC_KEYS_FILE = '/Users/berenaydogan/3.2./CS595/Project/CipherCampus/zero_knowledge/tree_creation/public_keys.txt'
PRIVATE_KEYS_FILE = '/Users/berenaydogan/3.2./CS595/Project/CipherCampus/zero_knowledge/tree_creation/private_keys.pem'
COURSES_CSV_FILE = '/Users/berenaydogan/3.2./CS595/Project/CipherCampus/zero_knowledge/tree_creation/courses.csv'
OUTPUT_CSV_FILE = '/Users/berenaydogan/3.2./CS595/Project/CipherCampus/zero_knowledge/tree_creation/courses_assigned.csv'

PROFESSOR_NAMES = [
    'Dr. Alice Smith', 'Dr. Bob Johnson', 'Dr. Carol Williams',
    'Dr. David Brown', 'Dr. Emma Davis', 'Dr. Frank Miller',
    'Dr. Grace Wilson', 'Dr. Henry Moore'
]

GRADES = ['F', 'D', 'C-', 'C', 'C+', 'B-', 'B', 'B+', 'A-', 'A']


def load_custom_public_keys(filepath):
    """Parse public key coordinates from custom-formatted file."""
    with open(filepath, 'r') as f:
        content = f.read()

    key_blocks = re.findall(r'### KEY \d+ ###\n\s*x = (0x[0-9a-fA-F]+)\n\s*y = (0x[0-9a-fA-F]+)', content)
    return [{'x': int(x, 16), 'y': int(y, 16)} for x, y in key_blocks]


def load_custom_private_keys(filepath):
    """Parse private key PEMs from custom-formatted file."""
    with open(filepath, 'rb') as f:
        content = f.read()

    pem_blocks = re.findall(
        b'-----BEGIN PRIVATE KEY-----.*?-----END PRIVATE KEY-----',
        content,
        re.DOTALL
    )

    return [
        serialization.load_pem_private_key(pem, password=None, backend=default_backend())
        for pem in pem_blocks
    ]


def assign_keypairs_to_students(df, public_keys, private_keys):
    """Assign a keypair to each student (1-to-1 mapping)."""
    students = df['student_id'].unique()
    if len(students) > len(public_keys):
        raise ValueError("Not enough keypairs for number of students.")

    keypairs = list(zip(public_keys, private_keys))
    random.shuffle(keypairs)
    return {sid: keypairs[i] for i, sid in enumerate(students)}


def assign_professors(df):
    courses = df[['college', 'department', 'course_number']].drop_duplicates()
    course_map = {}
    for _, row in courses.iterrows():
        key = (row['college'], row['department'], row['course_number'])
        profs = random.sample(PROFESSOR_NAMES, k=random.choice([1, 2]))
        course_map[key] = profs
    return course_map


def assign_majors(df):
    """Randomly assign a department (as major) to each student."""
    students = df['student_id'].unique()
    departments = df['department'].drop_duplicates().tolist()
    student_major_map = {sid: random.choice(departments) for sid in students}
    return student_major_map

def split_hi_lo(value: int):
    """Split a 256-bit integer into high and low 128-bit parts."""
    lo = value & ((1 << 128) - 1)
    hi = value >> 128
    return hi, lo

def main():
    df = pd.read_csv(COURSES_CSV_FILE)
    public_keys = load_custom_public_keys(PUBLIC_KEYS_FILE)
    private_keys = load_custom_private_keys(PRIVATE_KEYS_FILE)

    # Assign keypairs
    kp_map = assign_keypairs_to_students(df, public_keys, private_keys)
    
    # Extract and split public key coordinates
    df['pk_x_hi'] = df['student_id'].apply(lambda sid: hex(split_hi_lo(kp_map[sid][0]['x'])[0]))
    df['pk_x_lo'] = df['student_id'].apply(lambda sid: hex(split_hi_lo(kp_map[sid][0]['x'])[1]))
    df['pk_y_hi'] = df['student_id'].apply(lambda sid: hex(split_hi_lo(kp_map[sid][0]['y'])[0]))
    df['pk_y_lo'] = df['student_id'].apply(lambda sid: hex(split_hi_lo(kp_map[sid][0]['y'])[1]))

    # Assign professors
    prof_map = assign_professors(df)
    df['professor'] = df.apply(
        lambda row: random.choice(prof_map[(row['college'], row['department'], row['course_number'])]),
        axis=1
    )

    # Assign grades
    df['grade'] = df.apply(lambda _: random.choice(GRADES), axis=1)

    # Assign majors
    major_map = assign_majors(df)
    df['major'] = df['student_id'].apply(lambda sid: major_map[sid])

    # Drop student_id if not needed
    df.drop(columns=['student_id'], inplace=True)

    # Ensure 'major' is the last column
    cols = [col for col in df.columns if col != 'major'] + ['major']
    df = df[cols]

    df.to_csv(OUTPUT_CSV_FILE, index=False)
    print(f"Saved to {OUTPUT_CSV_FILE}")

if __name__ == '__main__':
    main()
