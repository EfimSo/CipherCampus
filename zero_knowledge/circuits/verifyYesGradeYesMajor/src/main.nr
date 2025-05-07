use std::hash::pedersen_hash;
use std::merkle::compute_merkle_root;
use std::convert::AsPrimitive;

fn main(
    leaf_index: Field,          
    path: [Field; 18],    

    grade: pub Field,
    major: pub Field,
    pk_x_hi: pub Field, 
    pk_x_lo: pub Field,
    pk_y_hi: pub Field, 
    pk_y_lo: pub Field,
    rootSchool: pub Field,
    professor: pub Field,
    college_idx: pub Field,     
    dept_idx:    pub Field,     
    course_idx:  pub Field      
) {
    let idx_u32: u32 = leaf_index.as_();

    let college = idx_u32 / 32768;               
    assert(Field::from(college) == college_idx);

    let rem1     = idx_u32 - college * 32768;
    let dept     = rem1 / 4096;                   
    assert(Field::from(dept) == dept_idx);

    let rem2     = rem1 - dept * 4096;
    let course   = rem2 / 512;                    
    assert(Field::from(course) == course_idx);

    let hx    = pedersen_hash([pk_x_lo, pk_x_hi]);     
    let hy    = pedersen_hash([pk_y_lo, pk_y_hi]);
    let h1    = pedersen_hash([hx, hy]);    
    let h2    = pedersen_hash([professor, grade]); 
    let leaf0 = pedersen_hash([h1, h2]);           
    let leaf  = pedersen_hash([leaf0, major]);    

    let computed_root = compute_merkle_root(leaf, leaf_index, path);
    assert(computed_root == rootSchool);
}