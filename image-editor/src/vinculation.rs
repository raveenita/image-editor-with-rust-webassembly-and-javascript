extern "C" {
    #[link_name = "console_log"]
    fn log(x: i32) -> i32;
    
    #[link_name = "alert"]
    fn alert(x: i32) -> i32;
}

#[link(name = "numbers", kind = "static")]
extern "C" {
    fn return_ten() -> i32;
    fn square(x: i32) -> i32;
}

#[no_mangle]
pub fn execute() {
    unsafe {
        let dez = return_ten();
        log(20); // 20
        log(87654321); // 87654321
        log(dez); // 10
        log(square(dez)); // 100
        alert(85); // 85 com window.alert
    }
}