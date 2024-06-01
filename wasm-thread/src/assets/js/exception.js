const tag = new WebAssembly.Tag({
    // Define o tipo dos dois parâmetros como "f32"
    parameters: ["f32"]
});
// Cria a exceção baseada na Tag criada e usa "85.0" e "23.3" com os valores
const options = { trackStack: true };
const exception = new WebAssembly.Exception(tag, [85], options);


const configurations = {
    env: {
    throw_exception: () => {
        const exc = new WebAssembly.Exception(tag, [85.25], { traceStack: true });
            throw exc;
        }
    }
};

fetch('exception.wasm')
    .then(response => response.arrayBuffer())
    .then(bytes => WebAssembly.compile(bytes))
    .then(mod => WebAssembly.instantiate(mod, configurations))
    .then(mod => { mod.exports.exception() })
    .catch((e) => {
    console.error(e);
    // Se a exceção for a tag específica, podemos inspecionar
    // usando o método ".is" no erro
    if (e.is(tag)) {
    // Pega o parâmetro de posição 0 da tag
    // Retorna "85.25"
    console.log(`getArg 0 : ${e.getArg(tag, 0)}`);
    }
    });