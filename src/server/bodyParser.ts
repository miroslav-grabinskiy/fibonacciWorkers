import {IncomingMessage, ServerResponse} from "http";

export async function bodyParser(req: IncomingMessage, res: ServerResponse): Promise<object | void> {
  return new Promise((resolve, reject) => {
    try {
      if (req.method !== "POST" && req.method !== "PUT" && req.method !== "DELETE") {
        return resolve();
      }

      const chunks = [];

      req.on("data", (chunk) => {
        chunks.push(chunk);
      });

      req.on("end", () => {
        const data = Buffer.concat(chunks);
        const stringData = data.toString();

        return resolve(JSON.parse(stringData));
      });
    } catch(err) {
      return reject(err);
    }
  });
}
