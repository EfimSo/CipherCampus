from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import ec, utils
from cryptography.exceptions import InvalidSignature


def check_signature(signature, pkX, pkY, message):
    x_bytes = bytes.fromhex(pkX) if not pkX[:2] == "0x" else bytes.fromhex(pkX[2:])
    y_bytes = bytes.fromhex(pkY) if not pkY[:2] == "0x" else bytes.fromhex(pkY[2:])

    encoded_point = b"\x04" + x_bytes + y_bytes 


    try:
        public_key = ec.EllipticCurvePublicKey.from_encoded_point(
        ec.SECP256R1(),
        encoded_point
    )
    except Exception as e:
        print(f"Serialization error: {e}")
        return False

    try:
        public_key.verify(
            bytes.fromhex(signature),
            message.encode(),
            ec.ECDSA(hashes.SHA256())
        )        
    except InvalidSignature:
        print("Invalid signature")
        return False
    return True

if __name__ == "__main__":
    signature = "3045022051981ce795786d6ab9acda4b7a854de65dffe17d2e4c195e3925c01a7ed45a60022100e74ad95d9bc0425eece8143b813af11cb4fa8ff134f4fd54b29b3d06fdc9d675"
    public_key = "00d0851a3b1d23ac235650bdca139b801e99271c61d584811f9d008865f66d99",
    message = "This is the message to sign"
    pkX = "ce0577409866783934d127a44ce8cebdc39ad464385b7c024481b50b28e3818d"
    pkY = "321a6962fe40b83743a6575a605765799a583aeb44fe01185629cd92b7b30d5b"
    print(check_signature(signature, pkX, pkY, message))