const workersList = [];
const processors = window.navigator.hardwareConcurrency;
const memory = new WebAssembly.Memory({
    initial: 320, // 20 MiB
    maximum: 3200, // 200 MiB
    shared: true
});
const importations = { env: { memory } };

for (let i = 0; i < processors; i++) {
    let worker = new Worker('./assets/js/worker.js');
    worker.addEventListener('message', event => {
    if (event.data.operation === 'INITIALIZE') {
        workersList.push(worker);
    }
}, false);

    worker.dispatchEvent('INITIALIZE',{ operation: 'INITIALIZE', importations });
}

const interval = setInterval(executeWorkers, 100);

function executeWorkers() {
    if (workersList.length === processors) {
        clearInterval(interval);

        for (leti = 0; i < processors; i++) {
            const value = i++;

            workersList[i].dispatchEvent('EXECUTE',{ operation: 'EXECUTE', value });
        }
    }
}