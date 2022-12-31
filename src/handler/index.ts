import * as fibonacci from "./fibonacci";
import {ITicket} from "../types";
import * as redis from "../redis/redis";
import cluster from 'node:cluster';
import { cpus } from 'node:os';

export function start(): void {
  if (cluster.isPrimary) {
    console.log(`Primary ${process.pid} is running`);

    const numCPUs = cpus().length;
    console.log('number of CPUs: ', numCPUs);

    // Fork workers.
    for (let i = 0; i < numCPUs; i++) {
      cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
      console.log(`worker ${worker.process.pid} died`);
    });
  } else {
    console.log(`Worker ${process.pid} is running`);
    subscribe();
  }

  process.on('SIGINT', () => {
    console.log(`process ${process.pid} died`);
    process.exit()
  });

  process.on('SIGTERM', () => {
    console.log(`process ${process.pid} died`);
    process.exit()
  });
}

function subscribe(): void {
  redis.ticketsHandlerClientInfo.client.subscribe('newTicket', async message => {
    const ticket = JSON.parse(message) as ITicket;

    const isTicketToProcess = await getTicket(ticket.id);

    if (isTicketToProcess) {
      const result = await fibonacci.create(ticket.position);
      //TODO: if it need - there is can rewrite ticket status
    }
  });
}

async function getTicket(ticketId: number): Promise<boolean> {
  try {
    const isTicketToProcessResult = await redis.ticketsClientInfo.client.evalSha(
      redis.ticketsClientInfo.lua.takeTicket.sha, {
        keys: [String(ticketId)],
      }
    );

    return isTicketToProcessResult[2] === 1;
  } catch(err) {
    throw err;
  }
}
