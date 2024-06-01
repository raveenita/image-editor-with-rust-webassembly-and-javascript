const wasmFile = './target/wasm32-unknown-unknown/release/main.wasm';

let operationSum;

addEventListener('message', async(event) => {
    if(event.data.operation === 'INITIALIZE') {
        result = await WebAssembly.instantiateStreaming(fetch(wasmFile), event.data.importations);

        operationSum = result.instance.exports.sum;
    }

    if(event.data.operation === 'EXECUTE') {
        const result = sum(event.data.value);

        console.log(result);
    }

    postMessage(event.data);
}, false);
