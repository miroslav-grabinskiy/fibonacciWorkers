import * as redis from '../redis/redis';

const memoryResultStep = Number(process.env.MEMORY_RESULT_STEP) || 100000;

export async function create(position: number) {
  if (position === 0) {
    return 0;
  }
  if (position === 1) {
    return 1;
  }

  const cacheValue = await redis.fibonacciClientInfo.client.get(String(position));
  if (cacheValue) {
    return cacheValue;
  }

  let x = BigInt(0);
  let y = BigInt(1);
  let fibonacci;
  let start = 2;

  let maxPosition = await redis.fibonacciMaxPositionClientInfo.client.get('max');

  if (maxPosition) {
    if (position > Number(maxPosition)) {
      const maxX = await redis.fibonacciClientInfo.client.get(String(Number(maxPosition) - 1));
      const maxY = await redis.fibonacciClientInfo.client.get(String(maxPosition));
      x = BigInt(maxX);
      y = BigInt(maxY);
      start = Number(maxPosition) + 1;
    } else {
      await setDefaultsWhenMaxPositionGreatThanCurrent();
    }
  }

  for (let i = start; i <= position; i++) {
    fibonacci = x + y;
    x = y;
    y = fibonacci;

    //saving intermediate results, checking parallel workers
    if (i % memoryResultStep === 0) {
      await sleep(0);
      await writeResults(i - 1, x, i, fibonacci);

      let maxPosition = await redis.fibonacciMaxPositionClientInfo.client.get('max');

      if (Number(maxPosition) < i || !maxPosition) {
        await rewriteMaxPosition(i);
      } else {
        //Note:!! This situation - when parallel worker calculated new results, greater than current!
        await setDefaultsWhenMaxPositionGreatThanCurrent();
      }
    }
  }

  await writeResults(position - 1, x, position, fibonacci);
  maxPosition = await redis.fibonacciMaxPositionClientInfo.client.get('max');

  if (Number(maxPosition) < position) {
    await rewriteMaxPosition(position);
  }

  return fibonacci;

  async function setDefaultsWhenMaxPositionGreatThanCurrent() {
    const lastMemoryValuePosition = position - (position % memoryResultStep);
    const maxX = await redis.fibonacciClientInfo.client.get(String(lastMemoryValuePosition - 1));
    const maxY = await redis.fibonacciClientInfo.client.get(String(lastMemoryValuePosition));
    x = BigInt(maxX);
    y = BigInt(maxY);
    start = lastMemoryValuePosition + 1;
  }
}

async function rewriteMaxPosition(position: number): Promise<void> {
  try {
    await redis.fibonacciMaxPositionClientInfo.client.evalSha(
      redis.fibonacciMaxPositionClientInfo.lua.rewriteMaxFibonacciPosition.sha, {
        keys: ['max'],
        arguments: [String(position)],
      }
    );
  } catch(err) {
    throw err;
  }
}

async function writeResults(prevPosition, prevResult, position, result) {
  await redis.fibonacciClientInfo.client.set(String(prevPosition), String(prevResult));
  await redis.fibonacciClientInfo.client.set(String(position), String(result));
}

async function sleep(ms): Promise<void> {
  return new Promise(resolve => {
    setInterval(() =>  resolve(), ms);
  })
}
