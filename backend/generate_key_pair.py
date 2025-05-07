from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.backends import default_backend

# Output files
with open("private_keys.pem", "w") as priv_file, open("public_keys.txt", "w") as pub_file:
    for i in range(2048):
        # Generate private key
        private_key = ec.generate_private_key(ec.SECP256R1(), default_backend())
        public_key = private_key.public_key()

        # Serialize private key in PEM (PKCS#8 format)
        pem_private = private_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.PKCS8,
            encryption_algorithm=serialization.NoEncryption()
        ).decode()

        # Get public key coordinates
        numbers = public_key.public_numbers()
        x_hex = hex(numbers.x)
        y_hex = hex(numbers.y)

        # Write private key to PEM file
        priv_file.write(f"### KEY {i} ###\n{pem_private}\n")

        # Write public key to TXT file in hex format
        pub_file.write(f"### KEY {i} ###\n")
        pub_file.write(f"x = {x_hex}\n")
        pub_file.write(f"y = {y_hex}\n\n")
