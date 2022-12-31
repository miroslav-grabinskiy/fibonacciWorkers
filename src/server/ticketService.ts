import * as redis from '../redis/redis';
import {ITicket} from "../types";

export async function createTicket(fibonacciPosition: number): Promise<number> {
  await clearRedis();
  const newTicketNumberResult = await redis.ticketsLastKeyClientInfo.client.evalSha(
    redis.ticketsLastKeyClientInfo.lua.generateNewTicketKey.sha, {
      keys: ['lastKey']
    }
  ) as number[];

  const newTicketNumber = newTicketNumberResult[0];

  const ticket = JSON.stringify(<ITicket>{
    id: newTicketNumber,
    position: fibonacciPosition,
    status: 0
  });

  await redis.ticketsClientInfo.client.set(String(newTicketNumber), ticket);
  await redis.ticketsClientInfo.client.publish('newTicket', ticket);

  return newTicketNumber;
}

export async function getTicketResponse(ticketNumber: number): Promise<string | void> {
  const ticket = await redis.ticketsClientInfo.client.get(String(ticketNumber));

  if (!ticket) {
    return;
  }

  const position = JSON.parse(ticket).position;

  const fibonacci = await redis.fibonacciClientInfo.client.get(String(position));

  return fibonacci;
}

export async function clearRedis() {
  await Promise.all([
    redis.ticketsLastKeyClientInfo.client.FLUSHALL(),
    redis.ticketsClientInfo.client.FLUSHALL(),
    redis.fibonacciClientInfo.client.FLUSHALL(),
    redis.fibonacciMaxPositionClientInfo.client.FLUSHALL(),
  ]);
}
