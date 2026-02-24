"use strict";

const { NodeSDK } = require("@opentelemetry/sdk-node");
const { Resource } = require("@opentelemetry/resources");
const {
  SemanticResourceAttributes,
} = require("@opentelemetry/semantic-conventions");
const {
  getNodeAutoInstrumentations,
} = require("@opentelemetry/auto-instrumentations-node");
const { OTLPTraceExporter } = require("@opentelemetry/exporter-trace-otlp-http");
const { ConsoleSpanExporter } = require("@opentelemetry/sdk-trace-base");

let sdkInstance = null;

const buildResource = (options = {}) =>
  new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]:
      options.serviceName ||
      process.env.OTEL_SERVICE_NAME ||
      process.env.SERVICE_NAME ||
      "satandbuy-service",
    [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]:
      options.environment || process.env.NODE_ENV || "development",
  });

const createTraceExporter = (options = {}) => {
  const url =
    options.otlpUrl ||
    process.env.OTEL_EXPORTER_OTLP_ENDPOINT ||
    process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT;

  if (url) {
    return new OTLPTraceExporter({ url });
  }

  return new ConsoleSpanExporter();
};

const start = async (options = {}) => {
  if (sdkInstance) {
    return sdkInstance;
  }

  if (
    options.enabled === false ||
    process.env.OTEL_ENABLED === "false" ||
    process.env.NODE_ENV === "test"
  ) {
    return null;
  }

  const sdk = new NodeSDK({
    resource: buildResource(options),
    traceExporter: options.traceExporter || createTraceExporter(options),
    instrumentations: [
      getNodeAutoInstrumentations({
        "@opentelemetry/instrumentation-http": {
          ignoreIncomingRequestHook: (req) =>
            req.url?.startsWith("/health") ||
            req.url?.startsWith("/metrics"),
        },
      }),
    ],
  });

  await sdk.start();
  sdkInstance = sdk;
  return sdkInstance;
};

const shutdown = async () => {
  if (!sdkInstance) return;
  try {
    await sdkInstance.shutdown();
  } catch (err) {
    console.error("[shared-telemetry] shutdown error", err.message);
  } finally {
    sdkInstance = null;
  }
};

module.exports = {
  start,
  shutdown,
};
