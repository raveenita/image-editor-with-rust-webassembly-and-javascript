const wasmFile = '../target/wasm32-unknown-unknown/release/image_editor.wasm';

const input = document.querySelector('input[type="file"]');
const resetButton = document.getElementById('removeFilter');
const jsFilterBlackAndWhite = document.getElementById('preto-e-branco-js');
const wasmFilter = document.getElementById('preto-e-branco-wasm');

let originalImage = document.getElementById('image').src;

input.addEventListener('change', (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    const image = document.getElementById('image');
    image.title = file.name;

    reader.onload = (event) => {
        image.src = event.target.result;
        originalImage = event.target.result;
    }

    reader.readAsDataURL(file);
});

resetButton.addEventListener('click', () => {
    const image = document.getElementById('image');
    
    image.src = originalImage;
});


WebAssembly
.instantiateStreaming(fetch(wasmFile))
.then(wasm => {
    const { instance } = wasm;
    const { subtraction, create_initial_memory, malloc, accumulate, memory } = instance.exports;

    create_initial_memory();

    const arrayMemory = new Uint8Array(memory.buffer, 0).slice(0, 10);
    
    console.log(arrayMemory); // 85
    console.log(subtraction(28, 10)); // 18

    const list = Uint8Array.from([20, 50, 80]);
    const wasmListFirstPointer = malloc(list.length);
    const wasmList = new Uint8Array(memory.buffer, wasmListFirstPointer, list.length);
    wasmList.set(list);

    const sumBetweenItemsFromList = accumulate(wasmListFirstPointer, list.length);

    console.log(sumBetweenItemsFromList);
}); 