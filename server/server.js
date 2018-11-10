const WebSocket = require('ws');
const Automerge = require('automerge');
 
const wss = new WebSocket.Server({ port: 8080 });
 
const clients = new Set();

// The state of the app
let stickies = Automerge.init();

wss.on('connection', ws => {
  clients.add(ws);

  // Send the entire document
  ws.send(JSON.stringify({
    id: stickies._actorId,
    changes: Automerge.getChanges(Automerge.init(), stickies),
  }));

  ws.on('message', message => {
    console.log('received: %s', message);
    const {changes, id} = JSON.parse(message);

    clients.forEach(client => {
      if (client === ws) {
        return;
      }
      client.send(message);
    });

    stickies = Automerge.applyChanges(stickies, changes);
  });
 
  ws.on('close', () => {
    console.log('Disconnected client');
    clients.delete(ws);
  });

  ws.on('error', () => {
    console.log('Client error');
    clients.delete(ws);
  });
});