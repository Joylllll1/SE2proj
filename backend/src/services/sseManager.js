const clients = new Map();
const ipConnectionCounts = new Map();

let nextId = 0;

function getMaxConnectionsPerUser() {
  return Number(process.env.SSE_MAX_CONNECTIONS_PER_USER || 3);
}

function getMaxConnectionsPerIp() {
  return Number(process.env.SSE_MAX_CONNECTIONS_PER_IP || 20);
}

function incrementIpCount(ip) {
  if (!ip) return;
  ipConnectionCounts.set(ip, (ipConnectionCounts.get(ip) || 0) + 1);
}

function decrementIpCount(ip) {
  if (!ip) return;
  const next = (ipConnectionCounts.get(ip) || 1) - 1;
  if (next <= 0) {
    ipConnectionCounts.delete(ip);
    return;
  }
  ipConnectionCounts.set(ip, next);
}

export function canAcceptConnection(userId, ip) {
  const userConnections = clients.get(userId)?.size || 0;
  const ipConnections = ipConnectionCounts.get(ip) || 0;
  return userConnections < getMaxConnectionsPerUser() && ipConnections < getMaxConnectionsPerIp();
}

export function addClient(userId, ip, res) {
  if (!clients.has(userId)) {
    clients.set(userId, new Set());
  }
  const client = { id: ++nextId, ip, res };
  clients.get(userId).add(client);
  incrementIpCount(ip);
  return client;
}

export function removeClient(userId, client) {
  const userClients = clients.get(userId);
  if (!userClients) return;
  if (!userClients.delete(client)) {
    return;
  }
  decrementIpCount(client.ip);
  if (userClients.size === 0) {
    clients.delete(userId);
  }
}

export function broadcast(event, data) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const [userId, userClients] of clients) {
    for (const client of userClients) {
      try {
        client.res.write(payload);
      } catch {
        removeClient(userId, client);
      }
    }
  }
}

export function broadcastToUser(targetUserId, event, data) {
  const userId = targetUserId?.toString();
  if (!userId) return;

  const userClients = clients.get(userId);
  if (!userClients || userClients.size === 0) {
    return;
  }

  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of userClients) {
    try {
      client.res.write(payload);
    } catch {
      removeClient(userId, client);
    }
  }
}

export function getConnectionCount() {
  let count = 0;
  for (const [, userClients] of clients) {
    count += userClients.size;
  }
  return count;
}
