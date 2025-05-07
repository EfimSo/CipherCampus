import re
import json

def split_256bit(n):
    lo = n & ((1 << 128) - 1)
    hi = n >> 128
    return {
        "hi": f"0x{hi:032x}",
        "lo": f"0x{lo:032x}"
    }

# Read full text file
with open("/Users/berenaydogan/3.2./CS595/Project/CipherCampus/zero_knowledge/tree_creation/public_keys.txt", "r") as f:
    content = f.read()

# Regex to find all key blocks
pattern = r"### KEY (\d+) ###\s*x = (0x[0-9a-fA-F]+)\s*y = (0x[0-9a-fA-F]+)"
matches = re.findall(pattern, content)

result = {}

for key_id, x_hex, y_hex in matches:
    x = int(x_hex, 16)
    y = int(y_hex, 16)
    x_split = split_256bit(x)
    y_split = split_256bit(y)

    result[f"KEY_{key_id}"] = {
        "pk_x_hi": x_split["hi"],
        "pk_x_lo": x_split["lo"],
        "pk_y_hi": y_split["hi"],
        "pk_y_lo": y_split["lo"]
    }

# Write result to JSON file
with open("parsed_keys.json", "w") as out_file:
    json.dump(result, out_file, indent=4)

print("Done. Keys parsed and saved to parsed_keys.json.")
