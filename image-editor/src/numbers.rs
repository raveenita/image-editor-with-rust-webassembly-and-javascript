
static TEN: i32 = 10;

#[export_name = "return_ten"]
pub extern fn return_10() -> i32 {
    TEN
}

#[no_mangle]
pub extern fn square(x: i32) -> i32 {
    x * x
}