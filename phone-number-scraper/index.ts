import * as readline from 'node:readline';
import WorkerPool from './workerPool';
import fs from 'fs';
import { scrapedData } from './interfaces';

// const urlFile = './tinyData.txt';
const urlFile = './newData.txt';
const queue: scrapedData[] = [];
const lineCounter = ((i = 0) => () => ++i)();
const workerPool = new WorkerPool(10, './worker.js');

const readLines = () => {
    const rl = readline.createInterface({
        input: fs.createReadStream(urlFile),
    });

    rl.on('line', (line, lineNum = lineCounter()) => {
        const data = {
            index: lineNum,
            url: line,
            numbers: [],
        };

        queue.push(data);
    });

    return new Promise<void>((resolve) => {
        rl.on('close', () => {
            console.log('Finished Reading File!');
            resolve();
        });
    });
};

const processQueue = async () => {
    await readLines();

    while (queue.length > 0) {
        const poppedData = queue.pop();
        if (poppedData) {
            console.log(`Processing URL ${poppedData.url}`);
            await workerPool.postMessage(poppedData, workerPool.finishedQueue);
        }
    }

    // Wait for the worker pool to complete all tasks and the initial queue to be empty
    await workerPool.queueCompletionPromise();

    // Code to run after all threads completed their work and there's nothing left in the queue
    console.log('All workers completed their tasks.');
    console.log('Processed data:', workerPool.finishedQueue);

    // Additional processing or termination steps
    const uniqueResults = Array.from(
        new Set(workerPool.finishedQueue.map((value: scrapedData) => JSON.stringify(value)))
    ).map((value: string) => JSON.parse(value) as scrapedData);

    console.log('Processed data:', uniqueResults);
    await workerPool.terminate();

    const data = await workerPool.returnData();

    // console.log(data);
    const formatToCsv = uniqueResults.map(returnedValues => {
        return {
            index: returnedValues.index,
            csvLine: returnedValues.url + '|' + returnedValues.numbers.join('|')
        }
    });

    const sortedCsvData = formatToCsv.sort((a, b) => a.index > b.index ? 1 : -1);

    const finalCsvData = sortedCsvData.map(line => {
        return line.csvLine;
    });

    // console.log(finalCsvData);

    // Format and Write to File
    const formatFile = finalCsvData.join('\n');
    fs.writeFileSync('./phoneNumbers.csv', formatFile);

};

// Call the processQueue function to start the entire process
processQueue();