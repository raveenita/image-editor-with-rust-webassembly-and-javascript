const book = './book.wasm';

WebAssembly.instantiateStreaming(fetch(book))
.then(({ instance }) => {
    const {
        save_book_in_memory,
        memory
    } = instance.exports;

    save_book_in_memory();

    const encodedMemory = new Uint8Array(memory.buffer, 0, 700);
    const decoder = new TextDecoder();

    const decodedText = decoder.decode(encodedMemory);

    const content = document.querySelector('#conteudo');
    content.textContent = decodedText;
});