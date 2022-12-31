import { createServer, IncomingMessage, ServerResponse } from 'http';
import * as packageJson from '../../package.json';
import { bodyParser } from "./bodyParser";
import * as service from "./ticketService";

const port = process.env.PORT || 7777;

const startTime = Date.now();

interface IInputRequest {
  number: number;
}

const sendNotFoundResponse = (res: ServerResponse): void => {
  res.writeHead(404);
  res.end("not found");
}

const listener = async function (req: IncomingMessage, res: ServerResponse) {
  try {
    const body = await bodyParser(req, res) as IInputRequest;
    res.setHeader("Content-Type", "application/json");

    if (req.url === '/status' && req.method === 'GET') {
      res.writeHead(200);
      res.end(JSON.stringify({
        version: packageJson.version,
        uptime: Date.now() - startTime,
        started: new Date(startTime),
      }));
      return;
    }

    if (req.url === '/input' && req.method === 'POST') {
      if (!body.number) {
        res.writeHead(400);
        res.end(JSON.stringify({
          "error": "you should write fibonacci number position!"
        }));

        return;
      }

      const ticketNumber = await service.createTicket(Number(body.number));

      res.writeHead(200);
      res.end(JSON.stringify({
        ticket: ticketNumber
      }));

      return;
    }

    if (req.url.startsWith('/output/')) {
      const urlPaths = req.url.split('/output/');
      {
        if (urlPaths.length !== 2) {
          return;
        }
      }

      const ticketNumber = Number(urlPaths[1]);

      if (!isFinite(ticketNumber)) {
        return; //fixme
      }

      const ticketResult = await service.getTicketResponse(ticketNumber);

      if (ticketResult) {
        res.writeHead(200);
        res.end(JSON.stringify({
          Fibonacci: ticketResult
        }));
      } else {
        sendNotFoundResponse(res);
      }

      return;
    }

    sendNotFoundResponse(res);
  } catch (err) {
    console.log('FATAL (server)!:,', err);
  }
}

export function start() {
  const server = createServer(listener);

  server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}
