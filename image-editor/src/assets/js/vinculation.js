const wasmFile = '../src/vinculation.wasm';


const importations = {
    env: {
        console_log: (n) => console.log(n),
        alert: (n) => window.alert(n),
    }
}

fetch(wasmFile)
    .then(response => response.arrayBuffer())
    .then(bytes => WebAssembly.compile(bytes))
    .then(module => WebAssembly.instantiate(module, importations))
    .then(({ exports: { execute }}) => {
        execute();
    });