use std::hash::pedersen_hash;
use std::merkle::compute_merkle_root;
use std::embedded_curve_ops::{fixed_base_scalar_mul, EmbeddedCurveScalar};
use std::convert::AsPrimitive;

fn main(
    sk_lo: Field,  
    sk_hi: Field,  
    leaf_index: Field,          
    path: [Field; 18],      
    pk_x:  Field, 
    pk_y:  Field,
    grade: Field,
    major: Field,

    professor: pub Field,
    college_idx: pub Field,     
    dept_idx:    pub Field,     
    course_idx:  pub Field      
) {
    let idx_u32: u32 = leaf_index.as_();

    let sk  = EmbeddedCurveScalar::new(sk_lo, sk_hi);
    let pk  = fixed_base_scalar_mul(sk); 

    let is_x = pk.x == pk_x;
    let is_y = pk.y == pk_y;

    let is_x_bool: bool = is_x.as_();
    let is_y_bool: bool = is_y.as_();

    assert(is_x_bool & is_y_bool);

    let college = idx_u32 / 32768;               
    assert(Field::from(college) == college_idx);

    let rem1     = idx_u32 - college * 32768;
    let dept     = rem1 / 4096;                   
    assert(Field::from(dept) == dept_idx);

    let rem2     = rem1 - dept * 4096;
    let course   = rem2 / 512;                    
    assert(Field::from(course) == course_idx);

    let h1    = pedersen_hash([pk_x, pk_y]);      
   let h2    = pedersen_hash([professor, grade]); 
   let leaf0 = pedersen_hash([h1, h2]);           
   let leaf  = pedersen_hash([leaf0, major]);     


    let computed_root = compute_merkle_root(leaf, leaf_index, path);
    let root = 0x2bb036fa47012291aaa0ce4a290191f9776cdf08b8356a4aadf84f2b6699e922;
    assert(computed_root == root);
}