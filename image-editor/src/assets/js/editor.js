const wasmFile = '../target/wasm32-unknown-unknown/release/image_editor.wasm';

const input = document.querySelector('input[type="file"]');
const resetButton = document.getElementById('removeFilter');
const nativeFilterButton = document.getElementById('nativeFilterButton');
const wasmFilterButton = document.getElementById('wasmFilterButton');

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
    console.log('Imagem voltou ao original');
});

nativeFilterButton.addEventListener('click', () => {
    const image = document.getElementById('image');
    const { canvas, context } = convertImageToCanvas(image);

    const startTime = performance.now();
    const base64Url = nativeFilterBlackAndWhite(canvas, context);
    const endTime = performance.now();

    timeToExecute(startTime, endTime, 'Filtro preto e branco nativo');

    image.src = base64Url;
});

function timeToExecute(startTime, endTime, operationName) {
    const performance = document.querySelector('#performance');

    performance.textContent = `${operationName}: ${endTime - startTime} ms`;
}


function convertImageToCanvas(image) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    canvas.width = image.naturalWidth | image.width;
    canvas.height = image.naturalHeight | image.height;

    context.drawImage(image, 0, 0);

    return { canvas, context };
}

function nativeFilterBlackAndWhite(canvas, context) {
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    const divideByThree = (divider) => divider / 3;

    for (let i = 0; i < pixels.length; i += 4) {
        const filter = divideByThree(pixels[i]) + divideByThree(pixels[i] + 1) + divideByThree(pixels[i + 2]);
        pixels[i] = filter;
        pixels[i + 1] = filter;
        pixels[i + 2] = filter;
    }

    context.putImageData(imageData, 0, 0);

    return canvas.toDataURL('image/jpeg');

}

WebAssembly
.instantiateStreaming(fetch(wasmFile))
.then(wasm => {
    const { instance } = wasm;
    const { subtraction, create_initial_memory, malloc, black_and_white_filter, accumulate, memory } = instance.exports;

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

    wasmFilterButton.addEventListener('click', () => {
        const image = document.getElementById('image');
        const { canvas, context } = convertImageToCanvas(image);
        const getImageData = context.getImageData(0, 0, canvas.width, canvas.height);

        const buffer = getImageData.data.buffer;
        const u8Array = new Uint8Array(buffer); // from 0 to 255
        const pointer = malloc(u8Array.length); // creates a pointer to the memory

        let wasmArray = new Uint8ClampedArray(instance.exports.memory.buffer, pointer, u8Array.length);
        
        wasmArray.set(u8Array);

        const startTime = performance.now();
        black_and_white_filter(pointer, u8Array.length);
        const endTime = performance.now();

        timeToExecute(startTime, endTime, 'Filtro preto e branco com WASM');

        const width = image.naturalWidth | image.width;
        const height = image.naturalHeight | image.height;

        const newImageData = context.createImageData(width, height);

        newImageData.data.set(wasmArray);
        context.putImageData(newImageData, 0, 0);

        image.src = canvas.toDataURL('image/jpeg');
    });
    

}); 