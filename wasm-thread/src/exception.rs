extern {
    #[link_name = "throw_exception"]
    fn throw_exception();
}

#[no_mangle]
pub extern fn exception() {
    unsafe {
        throw_exception();
    }
}