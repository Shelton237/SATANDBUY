"use strict";

const { EventEmitter } = require("events");
const { connect: connectNats, StringCodec } = require("nats");

const emitter = new EventEmitter();
const codec = StringCodec();

let nc = null;
let connectingPromise = null;

const log = (message, ...args) => {
  if (process.env.NODE_ENV !== "test") {
    console.log(`[shared-events] ${message}`, ...args);
  }
};

const connect = async (url) => {
  if (nc) {
    return nc;
  }

  const target = url || process.env.NATS_URL || "nats://nats:4222";
  if (!connectingPromise) {
    connectingPromise = connectNats({ servers: target })
      .then((client) => {
        nc = client;
        log(`connected to NATS (${target})`);
        (async () => {
          const closed = await client.closed();
          nc = null;
          connectingPromise = null;
          if (closed) {
            console.error(
              "[shared-events] NATS connection closed",
              closed.message
            );
          } else {
            log("NATS connection closed");
          }
        })();
        return client;
      })
      .catch((err) => {
        connectingPromise = null;
        console.error(
          "[shared-events] unable to connect to NATS",
          err.message
        );
        throw err;
      });
  }

  return connectingPromise;
};

const encode = (payload) => {
  try {
    return codec.encode(JSON.stringify(payload || {}));
  } catch (error) {
    return codec.encode("{}");
  }
};

const decode = (data) => {
  if (!data || !data.length) return undefined;
  try {
    return JSON.parse(codec.decode(data));
  } catch (error) {
    console.error("[shared-events] unable to decode payload", error.message);
    return undefined;
  }
};

/**
 * Publie un événement. Utilise NATS si disponible,
 * sinon retombe sur l'EventEmitter local.
 * @param {string} event
 * @param {any} payload
 */
const publish = async (event, payload) => {
  if (!event) return;
  if (nc || connectingPromise) {
    try {
      const client = nc || (await connectingPromise);
      client.publish(event, encode(payload));
      return;
    } catch (err) {
      console.error(
        `[shared-events] publish fallback (${event})`,
        err.message
      );
    }
  }
  emitter.emit(event, payload);
};

/**
 * Souscrit à un événement.
 * @param {string} event
 * @param {(payload: any) => void} handler
 * @returns {() => void} unsubscribe function
 */
const subscribe = (event, handler) => {
  if (!event || typeof handler !== "function") {
    throw new Error("subscribe(event, handler) est obligatoire.");
  }

  if (nc) {
    const sub = nc.subscribe(event);
    (async () => {
      for await (const msg of sub) {
        try {
          handler(decode(msg.data));
        } catch (err) {
          console.error(
            `[shared-events] subscriber error (${event})`,
            err.message
          );
        }
      }
    })();
    return () => sub.unsubscribe();
  }

  emitter.on(event, handler);
  return () => emitter.off(event, handler);
};

module.exports = {
  connect,
  publish,
  subscribe,
};
