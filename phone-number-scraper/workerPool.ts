import { Worker } from "worker_threads";
import { scrapedData } from "./interfaces";

class WorkerPool {
    private poolSize: number;
    private workerScript: string;
    private workers: Worker[];
    public finishedQueue: scrapedData[];

    // Track the idle state of each worker
    private workerStates: Map<Worker, boolean>;

    // Queue for tracking completion of worker tasks
    private completionQueue: Promise<void>[];

    constructor(poolSize: number, workerScript: string) {
        this.poolSize = poolSize;
        this.workerScript = workerScript;
        this.workers = [];
        this.finishedQueue = [];
        this.workerStates = new Map();
        this.completionQueue = [];

        this.initializePool();
    }

    private initializePool() {
        for (let i = 0; i < this.poolSize; i++) {
            const worker = new Worker(this.workerScript, {
                workerData: {
                    path: './worker.ts'
                }
            });

            // Initialize worker state as idle
            this.workerStates.set(worker, true);

            this.workers.push(worker);
        }
    }

    postMessage(data: any, completedQueue: scrapedData[]) {
        return new Promise<void>((resolve) => {
            const next = async () => {
                const availableWorker = this.workers.pop();
                if (availableWorker) {
                    this.workerStates.set(availableWorker, false);

                    // Wrap the message event in a Promise to resolve when the worker has finished
                    const messagePromise = new Promise<void>((messageResolve) => {
                        availableWorker.on('message', (result) => {
                            this.workers.push(availableWorker);
                            this.finishedQueue.push(result);
                            this.workerStates.set(availableWorker, true);
                            messageResolve();
                        });
                    });

                    availableWorker.postMessage(data);

                    // Wait for the worker to finish its task before resolving the outer Promise
                    await messagePromise;

                    resolve();
                }
            };

            next();
        });
    }

    async queueCompletionPromise(): Promise<void> {
        await Promise.all(this.completionQueue);
    }

    async returnData() {
        return this.finishedQueue;
    }

    async terminate() {
        const terminationPromises = this.workers.map(worker => {
            return new Promise<void>((resolve) => {
                worker.terminate().then(() => resolve());
            });
        });

        await Promise.all(terminationPromises);
        console.log('All workers terminated');
    }
}

export default WorkerPool;