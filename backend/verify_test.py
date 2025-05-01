import subprocess
import os
import subprocess


def write_proof_binary(hex_str: str, path: str = "./proof") -> None:
    """Convert a hex string to raw bytes and write it to *path*."""
    hex_str = hex_str.strip().lower().replace("0x", "")
    try:
        data = bytes.fromhex(hex_str)
    except ValueError as e:
        raise ValueError(f"Invalid hex data: {e}") from None

    if os.path.exists(path):
        os.remove(path)

    with open(path, "wb") as f:
        f.write(data)

vk_paths = {
    0: "vk_no_grade_no_major",
    1: "vk_no_grade_yes_major",
    2: "vk_yes_grade_no_major",
    3: "vk_no_grade_yes_major"
}


def verify(path: str = "./proof", vk_path: str = "./vk",
           out_path: str = "verify_output.txt") -> None:
    """Run the bb verifier and pipe stdout+stderr to *out_path*."""
    cmd = [
        "bb",
        "verify",
        "--scheme", "ultra_honk",
        "--oracle_hash", "keccak",
        "-k", vk_path,
        "-p", path,
    ]

    with open(out_path, "w") as out:
        subprocess.run(cmd, stdout=out, stderr=subprocess.STDOUT, check=True)


def proof_verified(out_path: str = "verify_output.txt") -> bool:
    try:
        with open(out_path, "r", encoding="utf-8") as f:
            lines = f.readlines()
        os.remove(out_path)
        return len(lines) >= 2 and lines[1].strip() == "Proof verified successfully"
    except FileNotFoundError:
        return False


def verify_proof(proof_hex, vk_index):
    write_proof_binary(proof_hex)
    verify(vk_path=vk_paths[vk_index])
    return proof_verified()