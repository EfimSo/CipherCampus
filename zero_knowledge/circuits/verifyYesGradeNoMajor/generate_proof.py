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
    # Write Prover.toml
    prover_path = os.path.join(circuit_dir, f"{prover_name}.toml")
    write_toml(inputs, prover_path)

    # Run nargo execute
    subprocess.run(["nargo", "execute"], cwd=circuit_dir, check=True)
    out_dir = os.path.join(circuit_dir, "out")
    os.makedirs(out_dir, exist_ok=True) 
    # Find witness and acir files
    witness = [f for f in os.listdir(os.path.join(circuit_dir, "target")) if f.endswith(".gz")][0]

    
    witness_path = os.path.join( "target", witness)
    proof_path = os.path.join(circuit_dir, "out", "proof")

    # Run bb prove
    subprocess.run([
        "bb", "prove",
        "-w", witness_path,
    ], cwd = circuit_dir, check=True)

    # Read and return proof
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
    print("hello, generate Proof - Yes No is triggered")
    proof = generate_proof("../../zero_knowledge/circuits/verifyYesGradeNoMajor", inputs)
    print("Proof (hex):", proof.hex())