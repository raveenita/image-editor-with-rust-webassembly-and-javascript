use core::slice::from_raw_parts_mut;
use std::alloc::{alloc, Layout};
use std::mem;

// Don't mangle the name of this function in order to be exported to the wasm module
#[no_mangle] 
fn subtraction(a: u8, b: u8) -> u8 {
    return a - b;
}

#[no_mangle]
fn create_initial_memory() {
    let slice: &mut [u8];
    let pointer = 5 as *mut u8;
    let length = 10;

    unsafe {
        slice = from_raw_parts_mut::<u8>(pointer, length);
    }

    slice[0] = 85;
}

#[no_mangle]
extern fn alloc_memory(length: usize) -> *mut u8 {
    let alignment = mem::align_of::<usize>();

    if let Ok(layout) = Layout::from_size_align(length, alignment) {
        unsafe {
            if layout.size() > 0 {
                let pointer = alloc(layout);
    
                if !pointer.is_null() {
                    return pointer;
                } else {
                    return alignment as *mut u8;
                }
            }
            
        }
    }

    std::process::abort()
}

#[no_mangle]
extern fn accumulate(pointer: *mut u8, length: usize) -> i32 {
    let slice = unsafe { from_raw_parts_mut(pointer as *mut u8, length) };
    let mut sum = 0;

    for i in 0..length {
        sum += slice[i] as i32;
    }

    sum as i32
}

#[no_mangle]
extern fn filter_black_and_white(pointer: *mut u8, length: usize) {
    let pixels = unsafe { from_raw_parts_mut(pointer as *mut u8, length) };
    let mut i = 0;
    loop {
        if i >= length - 1 {
            break;
        }

        let filter = pixels[i] / 3 + pixels[i + 1] / 3 + pixels[i + 2]  / 3;

        pixels[i] = filter;
        pixels[i + 1] = filter;
        pixels[i + 2] = filter;

        i += 4;
    }

}

#[no_mangle]
extern fn filter_red(data: *mut u8,  len: usize) {
    let pixels = unsafe { from_raw_parts_mut(data as *mut u8, len) };
    let mut i = 0;
    loop {
        if i >= len - 1 {
            break;
        }

        pixels[i + 1] = pixels[i + 1] / 2;
        pixels[i + 2] = pixels[i + 2] / 2;
        pixels[i + 5] = pixels[i + 5] / 2;
        pixels[i + 6] = pixels[i + 6] / 2;

        i += 8;
    }
}

#[no_mangle]
extern fn filter_green(data: *mut u8,  len: usize) {
    let pixels = unsafe { from_raw_parts_mut(data as *mut u8, len) };
    let mut i = 0;
    loop {
        if i >= len - 1 {
            break;
        }

        pixels[i] = pixels[i] / 2;
        pixels[i + 1] = pixels[i + 1] / 2;
        pixels[i + 2] = pixels[i + 2] / 2;
        pixels[i + 4] = pixels[i + 4] / 2;
        pixels[i + 6] = pixels[i + 6] / 2;

        i += 8;
    }
}

#[no_mangle]
extern fn filter_blue(data: *mut u8,  len: usize) {
    let pixels = unsafe { from_raw_parts_mut(data as *mut u8, len) };
    let mut i = 0;
    loop {
        if i >= len - 1 {
            break;
        }

        pixels[i] = pixels[i] / 2;
        pixels[i + 1] = pixels[i + 1] / 2;
        pixels[i + 4] = pixels[i + 4] / 2;
        pixels[i + 5] = pixels[i + 5] / 2;

        i += 8;
    }
}