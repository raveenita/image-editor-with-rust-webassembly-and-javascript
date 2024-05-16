const wasmFile = '../target/wasm32-unknown-unknown/release/image_editor.wasm';

const input = document.querySelector('input[type="file"]');
const resetButton = document.getElementById('removeFilter');
const nativeFilterButton = document.getElementById('nativeFilterButton');
const wasmFilterButton = document.getElementById('wasmFilterBlackAndWhite');

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

    logTimeExecution(startTime, endTime, 'Filtro preto e branco nativo');

    image.src = base64Url;
});

function logTimeExecution(startTime, endTime, operationName) {
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
    const { 
        create_initial_memory, 
        alloc_memory, 
        filter_black_and_white,
        filter_red,
        filter_green,
        filter_blue,
        memory
    } = instance.exports;

    create_initial_memory();

    const list = Uint8Array.from([20, 50, 80]);
    const wasmListFirstPointer = alloc_memory(list.length);
    const wasmList = new Uint8Array(memory.buffer, wasmListFirstPointer, list.length);
    wasmList.set(list);

    addFilter('Preto e Branco WASM', '#wasmFilterBlackAndWhite', {
        instance, filter: filter_black_and_white
    });
    addFilter('Vermelho WASM', '#wasmFilterRed', {
        instance, filter: filter_red
    });
    addFilter('Azul WASM', '#wasmFilterBlue', {
        instance, filter: filter_blue
    });
    addFilter('Verde WASM', '#wasmFilterGreen', {
        instance, filter: filter_green
    });
}); 

function executeFilter(image, processImageFn) {
    const { canvas, context } = convertImageToCanvas(image);
    
    if (!processImageFn) {
        return canvas.toDataURL();
    }

    if (typeof processImageFn === 'function') {
        processImageFn(canvas, context);
        
        return canvas.toDataURL('image/jpeg');
    }

}

function addFilter(text, selector, { instance, filter }) {
    const button = document.querySelector(selector);
    const image = document.getElementById('image');

    button.addEventListener('click', () => {
        executeFilter(image, (canvas, context) => {
            const image = document.getElementById('image');
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            const buffer = imageData.data.buffer;

            const u8Array = new Uint8Array(buffer);

            let wasmClampedPtr = instance.exports.alloc_memory(u8Array.length);
            let wasmClampedArray = new Uint8ClampedArray(instance.exports.memory.buffer, wasmClampedPtr, u8Array.length);
            wasmClampedArray.set(u8Array);

            const startTime = performance.now();

            filter(wasmClampedPtr, u8Array.length);

            const endTime = performance.now();

            logTimeExecution(startTime, endTime, text);

            const width = image.naturalWidth | image.width;
            const height = image.naturalHeight | image.height;
            const newImageData = context.createImageData(width, height);

            newImageData.data.set(wasmClampedArray);
            
            context.putImageData(newImageData, 0, 0);

            image.src = canvas.toDataURL('image/jpeg');
        });
    });
}