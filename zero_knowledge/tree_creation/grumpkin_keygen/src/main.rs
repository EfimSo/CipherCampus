use ark_ec::{CurveGroup, PrimeGroup};
use ark_ff::PrimeField;
use ark_grumpkin::{Affine as GAffine, Projective as GProjective};
use ark_std::{UniformRand, rand::rngs::OsRng};
use serde::Serialize;
use std::fs::File;

#[derive(Serialize)]
struct KeyPair {
    sk_lo: String,
    sk_hi: String,
    pk_x:  String,
    pk_y:  String,
}

// ---------- helper: field → 0x{64-hex-digits} -------------------
fn fe_to_hex<F: PrimeField>(fe: F) -> String {
    let bigint = fe.into_bigint();          // keep this alive
    let limbs  = bigint.as_ref();           // &[u64; 4]  (little-endian)
    format!(
        "0x{:016x}{:016x}{:016x}{:016x}",
        limbs[3], limbs[2], limbs[1], limbs[0]   // reverse → big-endian
    )
}


fn main() -> std::io::Result<()> {
    const N: usize = 1_000;
    let mut out = Vec::<KeyPair>::with_capacity(N);
    let mut rng = OsRng;

    for _ in 0..N {
        // -------- secret & public key ------------------------------------
        let sk = ark_grumpkin::Fr::rand(&mut rng);
        let pk_affine: GAffine = (GProjective::generator() * sk).into_affine();

        // -------- split sk into two 128-bit limbs ------------------------
        let b = sk.into_bigint();
        let lo = (b.as_ref()[0] as u128) | ((b.as_ref()[1] as u128) << 64);
        let hi = (b.as_ref()[2] as u128) | ((b.as_ref()[3] as u128) << 64);

        out.push(KeyPair {
            sk_lo: format!("0x{lo:032x}"),
            sk_hi: format!("0x{hi:032x}"),
            pk_x:  fe_to_hex(pk_affine.x),
            pk_y:  fe_to_hex(pk_affine.y),
        });
    }

    serde_json::to_writer_pretty(File::create("key_pairs.json")?, &out)?;
    println!("Wrote {N} key-pairs → grumpkin_keypairs.json");
    Ok(())
}
