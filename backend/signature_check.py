from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import ec, utils
from cryptography.exceptions import InvalidSignature
import hashlib

arg_dict = {
    "signature": "3046022100c7563a3043018710adeb3257263d65ac026633d3f01655ab7e27f1e12839d8ec022100d0ade5996cf34f623a6fa3ae3e5fb5a44d4bcc55783a2f10a8d58a0effd20543",
    "public_key": "00d0851a3b1d23ac235650bdca139b801e99271c61d584811f9d008865f66d99",
    "text": "This is the message to sign"
}

def check_sig(arg_dict = arg_dict):
    # try:
    #     message = arg_dict["text"]
    #     signature = bytes.fromhex(arg_dict["signature"])
    #     pem_key = (
    #         arg_dict["public_key"].encode()
    #     )
    # except KeyError as err:
    #     print("Key error")
    #     return False

    pkX_hex = "b473309703837930de512ced2c312460963eb6061b2869e2f27810e1da7cc854"
    pkY_hex = "8c41773aff3adccee0eff831bbc9a6043f2a0490eac871b161c5391e02dedd8c"

    x_bytes = bytes.fromhex(pkX_hex)
    y_bytes = bytes.fromhex(pkY_hex)

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
            bytes.fromhex(arg_dict["signature"]),
            arg_dict["text"].encode(),
            ec.ECDSA(hashes.SHA256())
        )        
    except InvalidSignature:
        print("Invalid signature")
        return False
    return True

print(check_sig(arg_dict=arg_dict))
# Nullify x