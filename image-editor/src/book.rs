extern crate core;

use std::ptr;
use core::slice::from_raw_parts_mut;

fn my_book() -> String {
    String::from("Na planície avermelhada os juazeiros alargavam
    duas manchas verdes. Os infelizes tinham caminhado o dia inteiro,
    estavam cansados e famintos. Ordinariamente andavam pouco, mas c
    omo haviam repousado bastante na areia do rio seco, a viagem prog
    redira bem três léguas. Fazia horas que procuravam uma sombra. A
    folhagem dos juazeiros apareceu longe, através dos galhos pelados
    da catinga rala. Arrastaram-se para lá, devagar, sinhá Vitória c
    om o filho mais novo escanchado no quarto e o baú de folha na cab
    eça, Fabiano sombrio, cambaio, o aió a tiracolo, a cuia pendurada
    numa correia presa ao cinturão, a espingarda de pederneira no om
    bro. O menino mais velho e a cachorra Baleia iam atrás.")
}

#[no_mangle]
pub fn save_book_in_memory() {
    let slice_memory: &mut [u8];
    let null_pointer: *mut u8 = ptr::null_mut();

    let book: String = my_book();
    let book_bytes: &[u8] = book.as_bytes();

    unsafe {
        slice_memory = from_raw_parts_mut::<u8>(null_pointer, book_bytes.len());
        
        for pos in 0..book_bytes.len() {
            slice_memory[pos] = book_bytes[pos];
        }
    }
}