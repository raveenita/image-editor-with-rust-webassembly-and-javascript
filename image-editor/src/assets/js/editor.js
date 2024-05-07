const wasmFile = './target/wasm32-unknown-unknown/release/image_editor.wasm';

WebAssembly
.instantiateStreaming(fetch(wasmFile))
.then(wasm => {
    const { instance } = wasm;
    const { subtraction, create_initial_memory, malloc, acumulate, memory } = instance.exports;

    create_initial_memory();

    const arrayMemory = new Uint8Array(memory.buffer, 0).slice(0, 10);
    
    console.log(arrayMemory); // 85
    console.log(subtraction(28, 10)); // 18

    const list = Uint8Array.from([20, 50, 80]);
    const wasmListFirstPointer = malloc(list.length);
    const wasmList = new Uint8Array(memory.buffer, wasmListFirstPointer, list.length);
    wasmList.set(list);

    const sumBetweenItemsFromList = acumulate(wasmListFirstPointer, list.length);
}); 