import {createClient, RedisClientType} from '@node-redis/client';
import {readFileSync} from 'fs';
import * as path from "path"

const TICKETS_DB = 0;
const TICKETS_LAST_KEY_DB = 1;
const FIBONACCI_DB = 2;
const FIBONACCI_MAX_POSITION_DB = 3;

export interface ILuaScriptInfo {
  name: string;
  description?: string;
  script: string;
  sha: string;
}

export interface ILuaScripts {
  [key: string]: ILuaScriptInfo ;
}

export interface IRedisClientInfo {
  client: RedisClientType;
  lua?: ILuaScripts
  name: string;
}

export const ticketsHandlerClientInfo: IRedisClientInfo = {
  name: 'ticketsStore',
  client: createClient({
    database: TICKETS_DB,
  }),
}

export const ticketsClientInfo: IRedisClientInfo = {
  name: 'ticketsStore',
  client: createClient({
    database: TICKETS_DB,
  }),
  lua: {
    takeTicket: {
      name: 'takeTicket',
      script: readFileSync(path.join(__dirname, '../public/luaScripts') + '/takeTicket.lua', 'utf8'),
      sha: null,
    }
  },
}
export const ticketsLastKeyClientInfo: IRedisClientInfo = {
  name: 'ticketsLastKeyNumber',
  client: createClient({
    database: TICKETS_LAST_KEY_DB,
  }),
  lua: {
    generateNewTicketKey: {
      name: 'generateNewTicketKey',
      script: readFileSync(path.join(__dirname, '../public/luaScripts') + '/generateNewTicketKey.lua', 'utf8'),
      sha: null,
    }
  },
}

export const fibonacciClientInfo: IRedisClientInfo = {
  name: 'fibonacciStore',
  client: createClient({
    database: FIBONACCI_DB,
  }),
}

export const fibonacciMaxPositionClientInfo: IRedisClientInfo = {
  name: 'fibonacciMaxValueStore',
  client: createClient({
    database: FIBONACCI_MAX_POSITION_DB,
  }),
  lua: {
    rewriteMaxFibonacciPosition: {
      name: 'rewriteMaxFibonacciPosition',
      script: readFileSync(path.join(__dirname, '../public/luaScripts') + '/rewriteMaxFibonacciPosition.lua', 'utf8'),
      sha: null,
    }
  },
}

const clients = [fibonacciMaxPositionClientInfo, fibonacciClientInfo, ticketsClientInfo, ticketsLastKeyClientInfo, ticketsHandlerClientInfo];

clients.forEach(async clientInfo => await connectClient(clientInfo));

async function connectClient(clientInfo: IRedisClientInfo): Promise<void> {
  await clientInfo.client.connect();
  setHandlers(clientInfo);
  await loadScripts(clientInfo);
}

function setHandlers(clientInfo: IRedisClientInfo): void {
  clientInfo.client.on('ready', () => {
    console.log(`🚀 redis ${clientInfo.name} ready`);
  });

  clientInfo.client.on('reconnecting', () => {
    console.log(`🚀 redis ${clientInfo.name} reconnecting`);
  });

  clientInfo.client.on('error', (error) => {
    console.log(`🚀 redis ${clientInfo.name} error: ${error}`);
  });

  clientInfo.client.on('end', () => {
    console.log(`🚀 redis ${clientInfo.name} end`)
  });
}

async function loadScripts(clientInfo: IRedisClientInfo) {
  if (clientInfo.lua) {
    await Promise.all(Object.values(clientInfo.lua).map(async (scriptInfo: ILuaScriptInfo) => {
      try {
        const sha = await clientInfo.client.scriptLoad(scriptInfo.script)
        scriptInfo.sha = sha;
      } catch(err)  {
        console.log('Fatal!: Error on Lua Script Loading:', scriptInfo.name, err);
      }
    }));
  }
}

export async function clearDb(): Promise<void> {
  await Promise.all(clients.map((clientInfo: IRedisClientInfo) => {
    clientInfo.client.FLUSHALL();
  }));
}
