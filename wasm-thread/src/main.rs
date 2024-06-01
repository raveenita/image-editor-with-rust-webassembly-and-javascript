use std::slice::from_raw_parts_mut;

#[no_mangle] 
fn sum(value: u8) -> u8 {
    // get a specific slice localized in memory
    let slice: &mut [u8] = unsafe { from_raw_parts_mut(1 as *mut u8, 255) };
    slice[0] = slice[0] + value;
    slice[0]
}
