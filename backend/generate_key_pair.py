from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.backends import default_backend

# 1) Generate a private key
private_key = ec.generate_private_key(ec.SECP256R1(), default_backend())

# 2) Get the corresponding public key
public_key = private_key.public_key()

# 3) Serialize to PEM ---------------------------------------------------------
# ----- Private key in PKCS#8 PEM -----
pem_private = private_key.private_bytes(
    encoding=serialization.Encoding.PEM,
    format=serialization.PrivateFormat.PKCS8,
    encryption_algorithm=serialization.NoEncryption(),   # or BestAvailableEncryption(b"passphrase")
)

# ----- Public key in SubjectPublicKeyInfo PEM -----
pem_public = public_key.public_bytes(
    encoding=serialization.Encoding.PEM,
    format=serialization.PublicFormat.SubjectPublicKeyInfo,
)

print("Private key (PEM):\n", pem_private.decode())
print("Public key  (PEM):\n", pem_public.decode())

# 4) Optional: get raw coordinates / compressed form --------------------------
numbers = public_key.public_numbers()
x_int, y_int = numbers.x, numbers.y
print(f"Public‑key coordinates:\n  x = {hex(x_int)}\n  y = {hex(y_int)}")