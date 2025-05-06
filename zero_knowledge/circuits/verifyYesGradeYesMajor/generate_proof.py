import subprocess
import os
import argparse


def write_toml(inputs, path):
    with open(path, "w") as f:
        for key, value in inputs.items():
            if isinstance(value, list):
                # Write TOML array
                arr = ", ".join(f"\"{v}\"" for v in value)
                f.write(f"{key} = [{arr}]\n")
            else:
                # Write as a quoted string
                f.write(f"{key} = \"{value}\"\n")


def generate_proof(circuit_dir, inputs, prover_name="Prover"):
    # 1) make circuit_dir absolute
    circuit_dir = os.path.abspath(circuit_dir)

    # 2) write Prover.toml
    prover_path = os.path.join(circuit_dir, f"{prover_name}.toml")
    write_toml(inputs, prover_path)

    # 3) build the witness
    subprocess.run(
        ["nargo", "execute"],
        cwd=circuit_dir,
        check=True
    )

    # 4) locate ACIR (.json) and witness (.gz)
    target_dir   = os.path.join(circuit_dir, "target")
    acir_path    = os.path.join(target_dir, "program.json")
    witness_path = os.path.join(target_dir, "verifyWithYesGradeYesMajor.gz")

    # 5) prepare your output directory (for BB to write into)
    out_dir = os.path.join(circuit_dir, "out")
    os.makedirs(out_dir, exist_ok=True)

    # 6) run bb prove *with* scheme & oracle flags, pointing -o at the directory
    subprocess.run([
        "bb", "prove",
        "--scheme",      "ultra_honk",
        "--oracle_hash", "keccak",
        "-b",            acir_path,
        "-w",            witness_path,
        "-o",            out_dir,            # <-- this must be a directory
    ], check=True)

    # 7) now BB has created `<out_dir>/proof`
    proof_path = os.path.join(out_dir, "proof")

    # 8) read & return the raw proof bytes
    with open(proof_path, "rb") as f:
        return f.read()
    
def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Parse the input parameters required by the program."
    )

    # Simple scalar (string/integer) arguments
    parser.add_argument("--leaf_index", required=True,
                        help="Index of the Merkle-tree leaf.")
    parser.add_argument("--pk_x", required=True,
                        help="Public-key X coordinate (hex).")
    parser.add_argument("--pk_y", required=True,
                        help="Public-key Y coordinate (hex).")
    parser.add_argument("--sk_lo", required=True,
                        help="Secret-key low word (hex).")
    parser.add_argument("--sk_hi", required=True,
                        help="Secret-key high word (hex).")
    parser.add_argument("--professor", required=True, type=int,
                        help="Professor identifier.")
    parser.add_argument("--grade", required=True, type=int,
                        help="Grade value.")
    parser.add_argument("--major", required=True, type=int,
                        help="Major identifier.")
    parser.add_argument("--college_idx", required=True, type=int,
                        help="College index.")
    parser.add_argument("--dept_idx", required=True, type=int,
                        help="Department index.")
    parser.add_argument("--course_idx", required=True, type=int,
                        help="Course index.")
    parser.add_argument("--rootSchool", required=True,
                        help="Root of the Merkle tree.")

    # The Merkle proof path: variable-length positional list after --path
    parser.add_argument(
        "--path",
        nargs="+",                # one or more values
        required=True,
        metavar="HASH",
        help="Sequence of sibling hashes (hex strings) forming a Merkle proof."
    )

    return parser

if __name__ == "__main__":
    parser = build_parser()
    args = parser.parse_args()

    # Convert Namespace to ordinary dict (optional)
    inputs = vars(args)
    print("hello, generate Proof - Yes Yes is triggered")
    proof = generate_proof("../../zero_knowledge/circuits/verifyYesGradeYesMajor", inputs)
    print("∑", proof.hex())