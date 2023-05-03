import worker from "node:worker_threads";
import winston from "winston";
import {createFromProtobuf} from "@libp2p/peer-id-factory";
import {expose} from "@chainsafe/threads/worker";
import {chainConfigFromJson, createBeaconConfig} from "@lodestar/config";
import {createWinstonLogger} from "@lodestar/utils";
import type {WorkerModule} from "@chainsafe/threads/dist/types/worker.js";
import {collectNodeJSMetrics, RegistryMetricCreator} from "../../metrics/index.js";
import {AsyncIterableBridgeCaller, AsyncIterableBridgeHandler} from "../../util/asyncIterableToEvents.js";
import {Clock} from "../../util/clock.js";
import {wireEventsOnWorkerThread} from "../../util/workerEvents.js";
import {NetworkEventBus, NetworkEventData, networkEventDirection} from "../events.js";
import {peerIdToString} from "../peerId.js";
import {NetworkWorkerApi, NetworkWorkerData} from "./types.js";
import {NetworkCore} from "./networkCore.js";
import {
  NetworkWorkerThreadEventType,
  ReqRespBridgeEventBus,
  ReqRespBridgeEventData,
  getReqRespBridgeReqEvents,
  getReqRespBridgeRespEvents,
  reqRespBridgeEventDirection,
} from "./events.js";

// Cloned data from instatiation
const workerData = worker.workerData as NetworkWorkerData;
const parentPort = worker.parentPort;
// eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
if (!workerData) throw Error("workerData must be defined");
// eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
if (!parentPort) throw Error("parentPort must be defined");

const config = createBeaconConfig(chainConfigFromJson(workerData.chainConfigJson), workerData.genesisValidatorsRoot);
const peerId = await createFromProtobuf(workerData.peerIdProto);

// TODO: Pass options from main thread for logging
// TODO: Logging won't be visible in file loggers
const logger = createWinstonLogger({module: "libp2p-w", format: "human"}, [
  new winston.transports.Console({debugStdout: true, level: "debug"}),
]);

// Alive and consistency check
logger.info("libp2p worker started", {peer: peerId.toString()});

const abortController = new AbortController();

// Set up metrics, nodejs and discv5-specific
const metricsRegister = workerData.metrics ? new RegistryMetricCreator() : null;
if (metricsRegister) {
  collectNodeJSMetrics(metricsRegister, "network_worker_");
}

// Main event bus shared across the stack
const events = new NetworkEventBus();
const reqRespBridgeEventBus = new ReqRespBridgeEventBus();
const clock = new Clock({config, genesisTime: workerData.genesisTime, signal: abortController.signal});

// ReqResp event bridge
//
// The ReqRespHandler module handles app-level requests / responses from other peers,
// fetching state from the chain and database as needed.
//
// On the worker's side the ReqResp module will call the async generator when the stream
// is ready to send responses to the multiplexed libp2p stream.
//
// - libp2p inbound stream opened for reqresp method
// - request data fully streamed
// - ResResp handler called with request data and started
// - stream calls next() on handler
// - handler fetches block from DB, yields value
// - stream calls next() again
// - handler fetches block from DB, yields value
// (case a)
// - remote peer disconnects, stream aborted, calls return() on handler
// (case b)
// - handler has yielded all blocks, returns
// (case c)
// - handler encounters error, throws
new AsyncIterableBridgeHandler(getReqRespBridgeReqEvents(reqRespBridgeEventBus), (data) =>
  core.sendReqRespRequest(data)
);
const respBridgeCaller = new AsyncIterableBridgeCaller(getReqRespBridgeRespEvents(reqRespBridgeEventBus));

const core = await NetworkCore.init({
  opts: workerData.opts,
  config,
  peerId,
  peerStoreDir: workerData.peerStoreDir,
  logger,
  metricsRegistry: metricsRegister,
  events,
  clock,
  getReqRespHandler: (method) => (req, peerId) =>
    respBridgeCaller.getAsyncIterable({method, req, peerId: peerIdToString(peerId)}),
  activeValidatorCount: workerData.activeValidatorCount,
  initialStatus: workerData.initialStatus,
});

wireEventsOnWorkerThread<NetworkEventData>(
  NetworkWorkerThreadEventType.networkEvent,
  events,
  parentPort,
  networkEventDirection
);
wireEventsOnWorkerThread<ReqRespBridgeEventData>(
  NetworkWorkerThreadEventType.reqRespBridgeEvents,
  reqRespBridgeEventBus,
  parentPort,
  reqRespBridgeEventDirection
);

const libp2pWorkerApi: NetworkWorkerApi = {
  close: () => {
    abortController.abort();
    return core.close();
  },
  scrapeMetrics: () => core.scrapeMetrics(),

  updateStatus: (status) => core.updateStatus(status),

  prepareBeaconCommitteeSubnets: (subscriptions) => core.prepareBeaconCommitteeSubnets(subscriptions),
  prepareSyncCommitteeSubnets: (subscriptions) => core.prepareSyncCommitteeSubnets(subscriptions),
  reportPeer: (peer, action, actionName) => core.reportPeer(peer, action, actionName),
  reStatusPeers: (peers) => core.reStatusPeers(peers),
  subscribeGossipCoreTopics: () => core.subscribeGossipCoreTopics(),
  unsubscribeGossipCoreTopics: () => core.unsubscribeGossipCoreTopics(),

  // sendReqRespRequest - handled via events with AsyncIterableBridgeHandler
  publishGossip: (topic, data, opts) => core.publishGossip(topic, data, opts),

  // Debug

  getNetworkIdentity: () => core.getNetworkIdentity(),
  getConnectedPeers: () => core.getConnectedPeers(),
  getConnectedPeerCount: () => core.getConnectedPeerCount(),
  connectToPeer: (peer, multiaddr) => core.connectToPeer(peer, multiaddr),
  disconnectPeer: (peer) => core.disconnectPeer(peer),
  dumpPeers: () => core.dumpPeers(),
  dumpPeer: (peerIdStr) => core.dumpPeer(peerIdStr),
  dumpPeerScoreStats: () => core.dumpPeerScoreStats(),
  dumpGossipPeerScoreStats: () => core.dumpGossipPeerScoreStats(),
  dumpDiscv5KadValues: () => core.dumpDiscv5KadValues(),
  dumpMeshPeers: () => core.dumpMeshPeers(),
};

expose(libp2pWorkerApi as WorkerModule<keyof NetworkWorkerApi>);
