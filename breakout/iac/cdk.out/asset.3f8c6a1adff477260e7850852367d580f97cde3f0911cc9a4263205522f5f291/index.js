"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// node_modules/@aws-lambda-powertools/batch/lib/constants.js
var require_constants = __commonJS({
  "node_modules/@aws-lambda-powertools/batch/lib/constants.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.DATA_CLASS_MAPPING = exports2.DEFAULT_RESPONSE = exports2.EventType = void 0;
    var EventType2 = {
      SQS: "SQS",
      KinesisDataStreams: "KinesisDataStreams",
      DynamoDBStreams: "DynamoDBStreams"
    };
    exports2.EventType = EventType2;
    var DEFAULT_RESPONSE = {
      batchItemFailures: []
    };
    exports2.DEFAULT_RESPONSE = DEFAULT_RESPONSE;
    var DATA_CLASS_MAPPING = {
      [EventType2.SQS]: (record) => record,
      [EventType2.KinesisDataStreams]: (record) => record,
      [EventType2.DynamoDBStreams]: (record) => record
    };
    exports2.DATA_CLASS_MAPPING = DATA_CLASS_MAPPING;
  }
});

// node_modules/@aws-lambda-powertools/batch/lib/errors.js
var require_errors = __commonJS({
  "node_modules/@aws-lambda-powertools/batch/lib/errors.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.UnexpectedBatchTypeError = exports2.SqsFifoShortCircuitError = exports2.FullBatchFailureError = exports2.BatchProcessingError = void 0;
    var constants_1 = require_constants();
    var BatchProcessingError = class extends Error {
      constructor(message) {
        super(message);
        this.name = "BatchProcessingError";
      }
    };
    exports2.BatchProcessingError = BatchProcessingError;
    var FullBatchFailureError = class extends BatchProcessingError {
      constructor(childErrors) {
        super("All records failed processing. See individual errors below.");
        this.recordErrors = childErrors;
        this.name = "FullBatchFailureError";
      }
    };
    exports2.FullBatchFailureError = FullBatchFailureError;
    var SqsFifoShortCircuitError = class extends BatchProcessingError {
      constructor() {
        super("A previous record failed processing. The remaining records were not processed to avoid out-of-order delivery.");
        this.name = "SqsFifoShortCircuitError";
      }
    };
    exports2.SqsFifoShortCircuitError = SqsFifoShortCircuitError;
    var UnexpectedBatchTypeError = class extends BatchProcessingError {
      constructor() {
        super(`Unexpected batch type. Possible values are: ${Object.values(constants_1.EventType).join(", ")}`);
        this.name = "UnexpectedBatchTypeError";
      }
    };
    exports2.UnexpectedBatchTypeError = UnexpectedBatchTypeError;
  }
});

// node_modules/@aws-lambda-powertools/batch/lib/types.js
var require_types = __commonJS({
  "node_modules/@aws-lambda-powertools/batch/lib/types.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
  }
});

// node_modules/@aws-lambda-powertools/batch/lib/BasePartialProcessor.js
var require_BasePartialProcessor = __commonJS({
  "node_modules/@aws-lambda-powertools/batch/lib/BasePartialProcessor.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.BasePartialProcessor = void 0;
    var BasePartialProcessor = class {
      /**
       * Initializes base processor class
       */
      constructor() {
        this.successMessages = [];
        this.failureMessages = [];
        this.errors = [];
        this.records = [];
        this.handler = new Function();
      }
      /**
       * Keeps track of batch records that failed processing
       * @param record record that failed processing
       * @param exception exception that was thrown
       * @returns FailureResponse object with ["fail", exception, original record]
       */
      failureHandler(record, exception) {
        const entry = ["fail", exception.message, record];
        this.errors.push(exception);
        this.failureMessages.push(record);
        return entry;
      }
      /**
       * Call instance's handler for each record
       * @returns List of processed records
       */
      async process() {
        if (this.constructor.name === "BatchProcessorSync") {
          await this.processRecord(this.records[0]);
        }
        this.prepare();
        const processingPromises = this.records.map((record) => this.processRecord(record));
        const processedRecords = await Promise.all(processingPromises);
        this.clean();
        return processedRecords;
      }
      /**
       * Call instance's handler for each record
       * @returns List of processed records
       */
      processSync() {
        if (this.constructor.name === "BatchProcessor") {
          this.processRecordSync(this.records[0]);
        }
        this.prepare();
        const processedRecords = [];
        for (const record of this.records) {
          processedRecords.push(this.processRecordSync(record));
        }
        this.clean();
        return processedRecords;
      }
      /**
       * Set class instance attributes before execution
       * @param records List of records to be processed
       * @param handler CallableFunction to process entries of "records"
       * @param options Options to be used during processing
       * @returns this object
       */
      register(records, handler2, options) {
        this.records = records;
        this.handler = handler2;
        if (options) {
          this.options = options;
        }
        return this;
      }
      /**
       * Keeps track of batch records that were processed successfully
       * @param record record that succeeded processing
       * @param result result from record handler
       * @returns SuccessResponse object with ["success", result, original record]
       */
      successHandler(record, result) {
        const entry = ["success", result, record];
        this.successMessages.push(record);
        return entry;
      }
    };
    exports2.BasePartialProcessor = BasePartialProcessor;
  }
});

// node_modules/@aws-lambda-powertools/batch/lib/BasePartialBatchProcessor.js
var require_BasePartialBatchProcessor = __commonJS({
  "node_modules/@aws-lambda-powertools/batch/lib/BasePartialBatchProcessor.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.BasePartialBatchProcessor = void 0;
    var BasePartialProcessor_1 = require_BasePartialProcessor();
    var constants_1 = require_constants();
    var errors_1 = require_errors();
    var BasePartialBatchProcessor = class extends BasePartialProcessor_1.BasePartialProcessor {
      /**
       * Initializes base batch processing class
       * @param eventType Whether this is SQS, DynamoDB stream, or Kinesis data stream event
       */
      constructor(eventType) {
        super();
        this.eventType = eventType;
        this.batchResponse = constants_1.DEFAULT_RESPONSE;
        this.COLLECTOR_MAPPING = {
          [constants_1.EventType.SQS]: () => this.collectSqsFailures(),
          [constants_1.EventType.KinesisDataStreams]: () => this.collectKinesisFailures(),
          [constants_1.EventType.DynamoDBStreams]: () => this.collectDynamoDBFailures()
        };
      }
      /**
       * Report messages to be deleted in case of partial failures
       */
      clean() {
        if (!this.hasMessagesToReport()) {
          return;
        }
        if (this.entireBatchFailed()) {
          throw new errors_1.FullBatchFailureError(this.errors);
        }
        const messages = this.getMessagesToReport();
        this.batchResponse = { batchItemFailures: messages };
      }
      /**
       * Collects identifiers of failed items for a DynamoDB stream
       * @returns list of identifiers for failed items
       */
      collectDynamoDBFailures() {
        const failures = [];
        for (const msg of this.failureMessages) {
          const msgId = msg.dynamodb?.SequenceNumber;
          if (msgId) {
            failures.push({ itemIdentifier: msgId });
          }
        }
        return failures;
      }
      /**
       * Collects identifiers of failed items for a Kinesis stream
       * @returns list of identifiers for failed items
       */
      collectKinesisFailures() {
        const failures = [];
        for (const msg of this.failureMessages) {
          const msgId = msg.kinesis.sequenceNumber;
          failures.push({ itemIdentifier: msgId });
        }
        return failures;
      }
      /**
       * Collects identifiers of failed items for an SQS batch
       * @returns list of identifiers for failed items
       */
      collectSqsFailures() {
        const failures = [];
        for (const msg of this.failureMessages) {
          const msgId = msg.messageId;
          failures.push({ itemIdentifier: msgId });
        }
        return failures;
      }
      /**
       * Determines whether all records in a batch failed to process
       * @returns true if all records resulted in exception results
       */
      entireBatchFailed() {
        return this.errors.length == this.records.length;
      }
      /**
       * Collects identifiers for failed batch items
       * @returns formatted messages to use in batch deletion
       */
      getMessagesToReport() {
        return this.COLLECTOR_MAPPING[this.eventType]();
      }
      /**
       * Determines if any records failed to process
       * @returns true if any records resulted in exception
       */
      hasMessagesToReport() {
        return this.failureMessages.length != 0;
      }
      /**
       * Remove results from previous execution
       */
      prepare() {
        this.successMessages.length = 0;
        this.failureMessages.length = 0;
        this.errors.length = 0;
        this.batchResponse = constants_1.DEFAULT_RESPONSE;
      }
      /**
       * @returns Batch items that failed processing, if any
       */
      response() {
        return this.batchResponse;
      }
      toBatchType(record, eventType) {
        return constants_1.DATA_CLASS_MAPPING[eventType](record);
      }
    };
    exports2.BasePartialBatchProcessor = BasePartialBatchProcessor;
  }
});

// node_modules/@aws-lambda-powertools/batch/lib/BatchProcessorSync.js
var require_BatchProcessorSync = __commonJS({
  "node_modules/@aws-lambda-powertools/batch/lib/BatchProcessorSync.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.BatchProcessorSync = void 0;
    var BasePartialBatchProcessor_1 = require_BasePartialBatchProcessor();
    var errors_1 = require_errors();
    var BatchProcessorSync = class extends BasePartialBatchProcessor_1.BasePartialBatchProcessor {
      async processRecord(_record) {
        throw new errors_1.BatchProcessingError("Not implemented. Use process() instead.");
      }
      /**
       * Process a record with instance's handler
       * @param record Batch record to be processed
       * @returns response of success or failure
       */
      processRecordSync(record) {
        try {
          const data = this.toBatchType(record, this.eventType);
          const result = this.handler(data, this.options?.context);
          return this.successHandler(record, result);
        } catch (error) {
          return this.failureHandler(record, error);
        }
      }
    };
    exports2.BatchProcessorSync = BatchProcessorSync;
  }
});

// node_modules/@aws-lambda-powertools/batch/lib/BatchProcessor.js
var require_BatchProcessor = __commonJS({
  "node_modules/@aws-lambda-powertools/batch/lib/BatchProcessor.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.BatchProcessor = void 0;
    var BasePartialBatchProcessor_1 = require_BasePartialBatchProcessor();
    var errors_1 = require_errors();
    var BatchProcessor2 = class extends BasePartialBatchProcessor_1.BasePartialBatchProcessor {
      async processRecord(record) {
        try {
          const data = this.toBatchType(record, this.eventType);
          const result = await this.handler(data, this.options?.context);
          return this.successHandler(record, result);
        } catch (error) {
          return this.failureHandler(record, error);
        }
      }
      /**
       * Process a record with instance's handler
       * @param _record Batch record to be processed
       * @returns response of success or failure
       */
      processRecordSync(_record) {
        throw new errors_1.BatchProcessingError("Not implemented. Use asyncProcess() instead.");
      }
    };
    exports2.BatchProcessor = BatchProcessor2;
  }
});

// node_modules/@aws-lambda-powertools/batch/lib/processPartialResponseSync.js
var require_processPartialResponseSync = __commonJS({
  "node_modules/@aws-lambda-powertools/batch/lib/processPartialResponseSync.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.processPartialResponseSync = void 0;
    var errors_1 = require_errors();
    var processPartialResponseSync = (event, recordHandler2, processor2, options) => {
      if (!event.Records || !Array.isArray(event.Records)) {
        throw new errors_1.UnexpectedBatchTypeError();
      }
      processor2.register(event.Records, recordHandler2, options);
      processor2.processSync();
      return processor2.response();
    };
    exports2.processPartialResponseSync = processPartialResponseSync;
  }
});

// node_modules/@aws-lambda-powertools/batch/lib/processPartialResponse.js
var require_processPartialResponse = __commonJS({
  "node_modules/@aws-lambda-powertools/batch/lib/processPartialResponse.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.processPartialResponse = void 0;
    var errors_1 = require_errors();
    var processPartialResponse2 = async (event, recordHandler2, processor2, options) => {
      if (!event.Records || !Array.isArray(event.Records)) {
        throw new errors_1.UnexpectedBatchTypeError();
      }
      processor2.register(event.Records, recordHandler2, options);
      await processor2.process();
      return processor2.response();
    };
    exports2.processPartialResponse = processPartialResponse2;
  }
});

// node_modules/@aws-lambda-powertools/batch/lib/SqsFifoPartialProcessor.js
var require_SqsFifoPartialProcessor = __commonJS({
  "node_modules/@aws-lambda-powertools/batch/lib/SqsFifoPartialProcessor.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.SqsFifoPartialProcessor = void 0;
    var BatchProcessorSync_1 = require_BatchProcessorSync();
    var constants_1 = require_constants();
    var errors_1 = require_errors();
    var SqsFifoPartialProcessor = class extends BatchProcessorSync_1.BatchProcessorSync {
      constructor() {
        super(constants_1.EventType.SQS);
      }
      /**
       * Call instance's handler for each record.
       * When the first failed message is detected, the process is short-circuited
       * And the remaining messages are reported as failed items
       */
      processSync() {
        this.prepare();
        const processedRecords = [];
        let currentIndex = 0;
        for (const record of this.records) {
          if (this.failureMessages.length != 0) {
            return this.shortCircuitProcessing(currentIndex, processedRecords);
          }
          processedRecords.push(this.processRecordSync(record));
          currentIndex++;
        }
        this.clean();
        return processedRecords;
      }
      /**
       * Starting from the first failure index, fail all remaining messages and append them to the result list
       * @param firstFailureIndex Index of first message that failed
       * @param result List of success and failure responses with remaining messages failed
       */
      shortCircuitProcessing(firstFailureIndex, processedRecords) {
        const remainingRecords = this.records.slice(firstFailureIndex);
        for (const record of remainingRecords) {
          const data = this.toBatchType(record, this.eventType);
          processedRecords.push(this.failureHandler(data, new errors_1.SqsFifoShortCircuitError()));
        }
        this.clean();
        return processedRecords;
      }
    };
    exports2.SqsFifoPartialProcessor = SqsFifoPartialProcessor;
  }
});

// node_modules/@aws-lambda-powertools/batch/lib/index.js
var require_lib = __commonJS({
  "node_modules/@aws-lambda-powertools/batch/lib/index.js"(exports2) {
    "use strict";
    var __createBinding2 = exports2 && exports2.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __exportStar2 = exports2 && exports2.__exportStar || function(m, exports3) {
      for (var p in m)
        if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports3, p))
          __createBinding2(exports3, m, p);
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    __exportStar2(require_constants(), exports2);
    __exportStar2(require_errors(), exports2);
    __exportStar2(require_types(), exports2);
    __exportStar2(require_BasePartialProcessor(), exports2);
    __exportStar2(require_BasePartialBatchProcessor(), exports2);
    __exportStar2(require_BatchProcessorSync(), exports2);
    __exportStar2(require_BatchProcessor(), exports2);
    __exportStar2(require_processPartialResponseSync(), exports2);
    __exportStar2(require_processPartialResponse(), exports2);
    __exportStar2(require_SqsFifoPartialProcessor(), exports2);
  }
});

// node_modules/@aws-lambda-powertools/logger/lib/helpers.js
var require_helpers = __commonJS({
  "node_modules/@aws-lambda-powertools/logger/lib/helpers.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.createLogger = void 0;
    var _1 = require_lib3();
    var createLogger = (options = {}) => new _1.Logger(options);
    exports2.createLogger = createLogger;
  }
});

// node_modules/@aws-lambda-powertools/commons/lib/utils/lambda/LambdaInterface.js
var require_LambdaInterface = __commonJS({
  "node_modules/@aws-lambda-powertools/commons/lib/utils/lambda/LambdaInterface.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
  }
});

// node_modules/@aws-lambda-powertools/commons/lib/utils/lambda/index.js
var require_lambda = __commonJS({
  "node_modules/@aws-lambda-powertools/commons/lib/utils/lambda/index.js"(exports2) {
    "use strict";
    var __createBinding2 = exports2 && exports2.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __exportStar2 = exports2 && exports2.__exportStar || function(m, exports3) {
      for (var p in m)
        if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports3, p))
          __createBinding2(exports3, m, p);
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    __exportStar2(require_LambdaInterface(), exports2);
  }
});

// node_modules/@aws-lambda-powertools/commons/lib/Utility.js
var require_Utility = __commonJS({
  "node_modules/@aws-lambda-powertools/commons/lib/Utility.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Utility = void 0;
    var Utility = class {
      constructor() {
        this.coldStart = true;
        this.defaultServiceName = "service_undefined";
      }
      getColdStart() {
        if (this.coldStart) {
          this.coldStart = false;
          return true;
        }
        return false;
      }
      isColdStart() {
        return this.getColdStart();
      }
      getDefaultServiceName() {
        return this.defaultServiceName;
      }
      /**
       * Validate that the service name provided is valid.
       * Used internally during initialization.
       *
       * @param serviceName - Service name to validate
       */
      isValidServiceName(serviceName) {
        return typeof serviceName === "string" && serviceName.trim().length > 0;
      }
    };
    exports2.Utility = Utility;
  }
});

// node_modules/@aws-lambda-powertools/commons/lib/config/ConfigService.js
var require_ConfigService = __commonJS({
  "node_modules/@aws-lambda-powertools/commons/lib/config/ConfigService.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ConfigService = void 0;
    var ConfigService = class {
    };
    exports2.ConfigService = ConfigService;
  }
});

// node_modules/@aws-lambda-powertools/commons/lib/config/EnvironmentVariablesService.js
var require_EnvironmentVariablesService = __commonJS({
  "node_modules/@aws-lambda-powertools/commons/lib/config/EnvironmentVariablesService.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.EnvironmentVariablesService = void 0;
    var EnvironmentVariablesService = class {
      constructor() {
        this.devModeVariable = "POWERTOOLS_DEV";
        this.serviceNameVariable = "POWERTOOLS_SERVICE_NAME";
        this.xRayTraceIdVariable = "_X_AMZN_TRACE_ID";
      }
      /**
       * It returns the value of an environment variable that has given name.
       *
       * @param {string} name
       * @returns {string}
       */
      get(name) {
        return process.env[name]?.trim() || "";
      }
      /**
       * It returns the value of the POWERTOOLS_SERVICE_NAME environment variable.
       *
       * @returns {string}
       */
      getServiceName() {
        return this.get(this.serviceNameVariable);
      }
      /**
       * It returns the value of the _X_AMZN_TRACE_ID environment variable.
       *
       * The AWS X-Ray Trace data available in the environment variable has this format:
       * `Root=1-5759e988-bd862e3fe1be46a994272793;Parent=557abcec3ee5a047;Sampled=1`,
       *
       * The actual Trace ID is: `1-5759e988-bd862e3fe1be46a994272793`.
       *
       * @returns {string}
       */
      getXrayTraceId() {
        const xRayTraceData = this.getXrayTraceData();
        return xRayTraceData?.Root;
      }
      /**
       * It returns true if the Sampled flag is set in the _X_AMZN_TRACE_ID environment variable.
       *
       * The AWS X-Ray Trace data available in the environment variable has this format:
       * `Root=1-5759e988-bd862e3fe1be46a994272793;Parent=557abcec3ee5a047;Sampled=1`,
       *
       * @returns {boolean}
       */
      getXrayTraceSampled() {
        const xRayTraceData = this.getXrayTraceData();
        return xRayTraceData?.Sampled === "1";
      }
      /**
       * It returns true if the `POWERTOOLS_DEV` environment variable is set to truthy value.
       *
       * @returns {boolean}
       */
      isDevMode() {
        return this.isValueTrue(this.get(this.devModeVariable));
      }
      /**
       * It returns true if the string value represents a boolean true value.
       *
       * @param {string} value
       * @returns boolean
       */
      isValueTrue(value) {
        const truthyValues = ["1", "y", "yes", "t", "true", "on"];
        return truthyValues.includes(value.toLowerCase());
      }
      /**
       * It parses the key/value data present in the _X_AMZN_TRACE_ID environment variable
       * and returns it as an object when available.
       */
      getXrayTraceData() {
        const xRayTraceEnv = this.get(this.xRayTraceIdVariable);
        if (xRayTraceEnv === "")
          return void 0;
        if (!xRayTraceEnv.includes("="))
          return { Root: xRayTraceEnv };
        const xRayTraceData = {};
        xRayTraceEnv.split(";").forEach((field) => {
          const [key, value] = field.split("=");
          xRayTraceData[key] = value;
        });
        return xRayTraceData;
      }
    };
    exports2.EnvironmentVariablesService = EnvironmentVariablesService;
  }
});

// node_modules/@aws-lambda-powertools/commons/lib/config/index.js
var require_config = __commonJS({
  "node_modules/@aws-lambda-powertools/commons/lib/config/index.js"(exports2) {
    "use strict";
    var __createBinding2 = exports2 && exports2.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __exportStar2 = exports2 && exports2.__exportStar || function(m, exports3) {
      for (var p in m)
        if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports3, p))
          __createBinding2(exports3, m, p);
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    __exportStar2(require_ConfigService(), exports2);
    __exportStar2(require_EnvironmentVariablesService(), exports2);
  }
});

// node_modules/@aws-lambda-powertools/commons/lib/samples/resources/contexts/hello-world.js
var require_hello_world = __commonJS({
  "node_modules/@aws-lambda-powertools/commons/lib/samples/resources/contexts/hello-world.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.helloworldContext = void 0;
    var helloworldContext = {
      callbackWaitsForEmptyEventLoop: true,
      functionVersion: "$LATEST",
      functionName: "foo-bar-function",
      memoryLimitInMB: "128",
      logGroupName: "/aws/lambda/foo-bar-function-123456abcdef",
      logStreamName: "2021/03/09/[$LATEST]abcdef123456abcdef123456abcdef123456",
      invokedFunctionArn: "arn:aws:lambda:eu-west-1:123456789012:function:foo-bar-function",
      awsRequestId: "c6af9ac6-7b61-11e6-9a41-93e812345678",
      getRemainingTimeInMillis: () => 1234,
      done: () => console.log("Done!"),
      fail: () => console.log("Failed!"),
      succeed: () => console.log("Succeeded!")
    };
    exports2.helloworldContext = helloworldContext;
  }
});

// node_modules/@aws-lambda-powertools/commons/lib/samples/resources/contexts/index.js
var require_contexts = __commonJS({
  "node_modules/@aws-lambda-powertools/commons/lib/samples/resources/contexts/index.js"(exports2) {
    "use strict";
    var __createBinding2 = exports2 && exports2.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __exportStar2 = exports2 && exports2.__exportStar || function(m, exports3) {
      for (var p in m)
        if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports3, p))
          __createBinding2(exports3, m, p);
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    __exportStar2(require_hello_world(), exports2);
  }
});

// node_modules/@aws-lambda-powertools/commons/lib/samples/resources/events/custom/index.js
var require_custom = __commonJS({
  "node_modules/@aws-lambda-powertools/commons/lib/samples/resources/events/custom/index.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.CustomEvent = void 0;
    exports2.CustomEvent = {
      key1: "value1",
      key2: "value2",
      key3: "value3"
    };
  }
});

// node_modules/@aws-lambda-powertools/commons/lib/samples/resources/events/index.js
var require_events = __commonJS({
  "node_modules/@aws-lambda-powertools/commons/lib/samples/resources/events/index.js"(exports2) {
    "use strict";
    var __createBinding2 = exports2 && exports2.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault = exports2 && exports2.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar2 = exports2 && exports2.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
            __createBinding2(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Custom = void 0;
    exports2.Custom = __importStar2(require_custom());
  }
});

// node_modules/@aws-lambda-powertools/commons/lib/types/middy.js
var require_middy = __commonJS({
  "node_modules/@aws-lambda-powertools/commons/lib/types/middy.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
  }
});

// node_modules/@aws-lambda-powertools/commons/lib/types/utils.js
var require_utils = __commonJS({
  "node_modules/@aws-lambda-powertools/commons/lib/types/utils.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.isNullOrUndefined = exports2.isTruthy = exports2.isString = exports2.isRecord = void 0;
    var isRecord = (value) => {
      return Object.prototype.toString.call(value) === "[object Object]" && !Object.is(value, null);
    };
    exports2.isRecord = isRecord;
    var isTruthy = (value) => {
      if (typeof value === "string") {
        return value !== "";
      } else if (typeof value === "number") {
        return value !== 0;
      } else if (typeof value === "boolean") {
        return value;
      } else if (Array.isArray(value)) {
        return value.length > 0;
      } else if (isRecord(value)) {
        return Object.keys(value).length > 0;
      } else {
        return false;
      }
    };
    exports2.isTruthy = isTruthy;
    var isNullOrUndefined = (value) => {
      return Object.is(value, null) || Object.is(value, void 0);
    };
    exports2.isNullOrUndefined = isNullOrUndefined;
    var isString = (value) => {
      return typeof value === "string";
    };
    exports2.isString = isString;
  }
});

// node_modules/@aws-lambda-powertools/commons/lib/version.js
var require_version = __commonJS({
  "node_modules/@aws-lambda-powertools/commons/lib/version.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.PT_VERSION = void 0;
    exports2.PT_VERSION = "1.15.0";
  }
});

// node_modules/@aws-lambda-powertools/commons/lib/awsSdk/utils.js
var require_utils2 = __commonJS({
  "node_modules/@aws-lambda-powertools/commons/lib/awsSdk/utils.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.isSdkClient = void 0;
    var isSdkClient = (client) => typeof client === "object" && client !== null && "send" in client && typeof client.send === "function" && "config" in client && client.config !== void 0 && typeof client.config === "object" && client.config !== null && "middlewareStack" in client && client.middlewareStack !== void 0 && typeof client.middlewareStack === "object" && client.middlewareStack !== null && "identify" in client.middlewareStack && typeof client.middlewareStack.identify === "function" && "addRelativeTo" in client.middlewareStack && typeof client.middlewareStack.addRelativeTo === "function";
    exports2.isSdkClient = isSdkClient;
  }
});

// node_modules/@aws-lambda-powertools/commons/lib/awsSdk/userAgentMiddleware.js
var require_userAgentMiddleware = __commonJS({
  "node_modules/@aws-lambda-powertools/commons/lib/awsSdk/userAgentMiddleware.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.addUserAgentMiddleware = exports2.customUserAgentMiddleware = void 0;
    var version_1 = require_version();
    var utils_1 = require_utils2();
    var EXEC_ENV = process.env.AWS_EXECUTION_ENV || "NA";
    var middlewareOptions = {
      relation: "after",
      toMiddleware: "getUserAgentMiddleware",
      name: "addPowertoolsToUserAgent",
      tags: ["POWERTOOLS", "USER_AGENT"]
    };
    var customUserAgentMiddleware = (feature) => {
      return (next) => async (args) => {
        const powertoolsUserAgent = `PT/${feature}/${version_1.PT_VERSION} PTEnv/${EXEC_ENV}`;
        args.request.headers["user-agent"] = `${args.request.headers["user-agent"]} ${powertoolsUserAgent}`;
        return await next(args);
      };
    };
    exports2.customUserAgentMiddleware = customUserAgentMiddleware;
    var hasPowertools = (middlewareStack) => {
      let found = false;
      for (const middleware of middlewareStack) {
        if (middleware.includes("addPowertoolsToUserAgent")) {
          found = true;
        }
      }
      return found;
    };
    var addUserAgentMiddleware = (client, feature) => {
      try {
        if ((0, utils_1.isSdkClient)(client)) {
          if (hasPowertools(client.middlewareStack.identify())) {
            return;
          }
          client.middlewareStack.addRelativeTo(customUserAgentMiddleware(feature), middlewareOptions);
        } else {
          throw new Error(`The client provided does not match the expected interface`);
        }
      } catch (error) {
        console.warn("Failed to add user agent middleware", error);
      }
    };
    exports2.addUserAgentMiddleware = addUserAgentMiddleware;
  }
});

// node_modules/@aws-lambda-powertools/commons/lib/awsSdk/index.js
var require_awsSdk = __commonJS({
  "node_modules/@aws-lambda-powertools/commons/lib/awsSdk/index.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.isSdkClient = exports2.addUserAgentMiddleware = void 0;
    var userAgentMiddleware_1 = require_userAgentMiddleware();
    Object.defineProperty(exports2, "addUserAgentMiddleware", { enumerable: true, get: function() {
      return userAgentMiddleware_1.addUserAgentMiddleware;
    } });
    var utils_1 = require_utils2();
    Object.defineProperty(exports2, "isSdkClient", { enumerable: true, get: function() {
      return utils_1.isSdkClient;
    } });
  }
});

// node_modules/@aws-lambda-powertools/commons/lib/index.js
var require_lib2 = __commonJS({
  "node_modules/@aws-lambda-powertools/commons/lib/index.js"(exports2) {
    "use strict";
    var __createBinding2 = exports2 && exports2.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault = exports2 && exports2.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __exportStar2 = exports2 && exports2.__exportStar || function(m, exports3) {
      for (var p in m)
        if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports3, p))
          __createBinding2(exports3, m, p);
    };
    var __importStar2 = exports2 && exports2.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
            __createBinding2(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Events = exports2.ContextExamples = void 0;
    __exportStar2(require_lambda(), exports2);
    __exportStar2(require_Utility(), exports2);
    __exportStar2(require_config(), exports2);
    exports2.ContextExamples = __importStar2(require_contexts());
    exports2.Events = __importStar2(require_events());
    __exportStar2(require_middy(), exports2);
    __exportStar2(require_utils(), exports2);
    __exportStar2(require_awsSdk(), exports2);
  }
});

// node_modules/@aws-lambda-powertools/logger/lib/formatter/LogFormatter.js
var require_LogFormatter = __commonJS({
  "node_modules/@aws-lambda-powertools/logger/lib/formatter/LogFormatter.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.LogFormatter = void 0;
    var isErrorWithCause = (error) => {
      return "cause" in error;
    };
    var LogFormatter = class {
      /**
       * It formats a given Error parameter.
       *
       * @param {Error} error
       * @returns {LogAttributes}
       */
      formatError(error) {
        return {
          name: error.name,
          location: this.getCodeLocation(error.stack),
          message: error.message,
          stack: error.stack,
          cause: isErrorWithCause(error) ? error.cause instanceof Error ? this.formatError(error.cause) : error.cause : void 0
        };
      }
      /**
       * It formats a date into a string in simplified extended ISO format (ISO 8601).
       *
       * @param {Date} now
       * @returns {string}
       */
      formatTimestamp(now) {
        return now.toISOString();
      }
      /**
       * It returns a string containing the location of an error, given a particular stack trace.
       *
       * @param stack
       * @returns {string}
       */
      getCodeLocation(stack) {
        if (!stack) {
          return "";
        }
        const stackLines = stack.split("\n");
        const regex = /\((.*):(\d+):(\d+)\)\\?$/;
        let i;
        for (i = 0; i < stackLines.length; i++) {
          const match = regex.exec(stackLines[i]);
          if (Array.isArray(match)) {
            return `${match[1]}:${Number(match[2])}`;
          }
        }
        return "";
      }
    };
    exports2.LogFormatter = LogFormatter;
  }
});

// node_modules/@aws-lambda-powertools/logger/lib/formatter/LogFormatterInterface.js
var require_LogFormatterInterface = __commonJS({
  "node_modules/@aws-lambda-powertools/logger/lib/formatter/LogFormatterInterface.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
  }
});

// node_modules/@aws-lambda-powertools/logger/lib/formatter/PowertoolLogFormatter.js
var require_PowertoolLogFormatter = __commonJS({
  "node_modules/@aws-lambda-powertools/logger/lib/formatter/PowertoolLogFormatter.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.PowertoolLogFormatter = void 0;
    var _1 = require_formatter();
    var PowertoolLogFormatter = class extends _1.LogFormatter {
      /**
       * It formats key-value pairs of log attributes.
       *
       * @param {UnformattedAttributes} attributes
       * @returns {PowertoolLog}
       */
      formatAttributes(attributes) {
        return {
          cold_start: attributes.lambdaContext?.coldStart,
          function_arn: attributes.lambdaContext?.invokedFunctionArn,
          function_memory_size: attributes.lambdaContext?.memoryLimitInMB,
          function_name: attributes.lambdaContext?.functionName,
          function_request_id: attributes.lambdaContext?.awsRequestId,
          level: attributes.logLevel,
          message: attributes.message,
          sampling_rate: attributes.sampleRateValue,
          service: attributes.serviceName,
          timestamp: this.formatTimestamp(attributes.timestamp),
          xray_trace_id: attributes.xRayTraceId
        };
      }
    };
    exports2.PowertoolLogFormatter = PowertoolLogFormatter;
  }
});

// node_modules/@aws-lambda-powertools/logger/lib/formatter/index.js
var require_formatter = __commonJS({
  "node_modules/@aws-lambda-powertools/logger/lib/formatter/index.js"(exports2) {
    "use strict";
    var __createBinding2 = exports2 && exports2.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __exportStar2 = exports2 && exports2.__exportStar || function(m, exports3) {
      for (var p in m)
        if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports3, p))
          __createBinding2(exports3, m, p);
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    __exportStar2(require_LogFormatter(), exports2);
    __exportStar2(require_LogFormatterInterface(), exports2);
    __exportStar2(require_PowertoolLogFormatter(), exports2);
  }
});

// node_modules/lodash.merge/index.js
var require_lodash = __commonJS({
  "node_modules/lodash.merge/index.js"(exports2, module2) {
    var LARGE_ARRAY_SIZE = 200;
    var HASH_UNDEFINED = "__lodash_hash_undefined__";
    var HOT_COUNT = 800;
    var HOT_SPAN = 16;
    var MAX_SAFE_INTEGER = 9007199254740991;
    var argsTag = "[object Arguments]";
    var arrayTag = "[object Array]";
    var asyncTag = "[object AsyncFunction]";
    var boolTag = "[object Boolean]";
    var dateTag = "[object Date]";
    var errorTag = "[object Error]";
    var funcTag = "[object Function]";
    var genTag = "[object GeneratorFunction]";
    var mapTag = "[object Map]";
    var numberTag = "[object Number]";
    var nullTag = "[object Null]";
    var objectTag = "[object Object]";
    var proxyTag = "[object Proxy]";
    var regexpTag = "[object RegExp]";
    var setTag = "[object Set]";
    var stringTag = "[object String]";
    var undefinedTag = "[object Undefined]";
    var weakMapTag = "[object WeakMap]";
    var arrayBufferTag = "[object ArrayBuffer]";
    var dataViewTag = "[object DataView]";
    var float32Tag = "[object Float32Array]";
    var float64Tag = "[object Float64Array]";
    var int8Tag = "[object Int8Array]";
    var int16Tag = "[object Int16Array]";
    var int32Tag = "[object Int32Array]";
    var uint8Tag = "[object Uint8Array]";
    var uint8ClampedTag = "[object Uint8ClampedArray]";
    var uint16Tag = "[object Uint16Array]";
    var uint32Tag = "[object Uint32Array]";
    var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
    var reIsHostCtor = /^\[object .+?Constructor\]$/;
    var reIsUint = /^(?:0|[1-9]\d*)$/;
    var typedArrayTags = {};
    typedArrayTags[float32Tag] = typedArrayTags[float64Tag] = typedArrayTags[int8Tag] = typedArrayTags[int16Tag] = typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] = typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] = typedArrayTags[uint32Tag] = true;
    typedArrayTags[argsTag] = typedArrayTags[arrayTag] = typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] = typedArrayTags[dataViewTag] = typedArrayTags[dateTag] = typedArrayTags[errorTag] = typedArrayTags[funcTag] = typedArrayTags[mapTag] = typedArrayTags[numberTag] = typedArrayTags[objectTag] = typedArrayTags[regexpTag] = typedArrayTags[setTag] = typedArrayTags[stringTag] = typedArrayTags[weakMapTag] = false;
    var freeGlobal = typeof global == "object" && global && global.Object === Object && global;
    var freeSelf = typeof self == "object" && self && self.Object === Object && self;
    var root = freeGlobal || freeSelf || Function("return this")();
    var freeExports = typeof exports2 == "object" && exports2 && !exports2.nodeType && exports2;
    var freeModule = freeExports && typeof module2 == "object" && module2 && !module2.nodeType && module2;
    var moduleExports = freeModule && freeModule.exports === freeExports;
    var freeProcess = moduleExports && freeGlobal.process;
    var nodeUtil = function() {
      try {
        var types = freeModule && freeModule.require && freeModule.require("util").types;
        if (types) {
          return types;
        }
        return freeProcess && freeProcess.binding && freeProcess.binding("util");
      } catch (e) {
      }
    }();
    var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;
    function apply(func, thisArg, args) {
      switch (args.length) {
        case 0:
          return func.call(thisArg);
        case 1:
          return func.call(thisArg, args[0]);
        case 2:
          return func.call(thisArg, args[0], args[1]);
        case 3:
          return func.call(thisArg, args[0], args[1], args[2]);
      }
      return func.apply(thisArg, args);
    }
    function baseTimes(n, iteratee) {
      var index = -1, result = Array(n);
      while (++index < n) {
        result[index] = iteratee(index);
      }
      return result;
    }
    function baseUnary(func) {
      return function(value) {
        return func(value);
      };
    }
    function getValue(object, key) {
      return object == null ? void 0 : object[key];
    }
    function overArg(func, transform) {
      return function(arg) {
        return func(transform(arg));
      };
    }
    var arrayProto = Array.prototype;
    var funcProto = Function.prototype;
    var objectProto = Object.prototype;
    var coreJsData = root["__core-js_shared__"];
    var funcToString = funcProto.toString;
    var hasOwnProperty = objectProto.hasOwnProperty;
    var maskSrcKey = function() {
      var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || "");
      return uid ? "Symbol(src)_1." + uid : "";
    }();
    var nativeObjectToString = objectProto.toString;
    var objectCtorString = funcToString.call(Object);
    var reIsNative = RegExp(
      "^" + funcToString.call(hasOwnProperty).replace(reRegExpChar, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"
    );
    var Buffer2 = moduleExports ? root.Buffer : void 0;
    var Symbol2 = root.Symbol;
    var Uint8Array2 = root.Uint8Array;
    var allocUnsafe = Buffer2 ? Buffer2.allocUnsafe : void 0;
    var getPrototype = overArg(Object.getPrototypeOf, Object);
    var objectCreate = Object.create;
    var propertyIsEnumerable = objectProto.propertyIsEnumerable;
    var splice = arrayProto.splice;
    var symToStringTag = Symbol2 ? Symbol2.toStringTag : void 0;
    var defineProperty = function() {
      try {
        var func = getNative(Object, "defineProperty");
        func({}, "", {});
        return func;
      } catch (e) {
      }
    }();
    var nativeIsBuffer = Buffer2 ? Buffer2.isBuffer : void 0;
    var nativeMax = Math.max;
    var nativeNow = Date.now;
    var Map = getNative(root, "Map");
    var nativeCreate = getNative(Object, "create");
    var baseCreate = /* @__PURE__ */ function() {
      function object() {
      }
      return function(proto) {
        if (!isObject(proto)) {
          return {};
        }
        if (objectCreate) {
          return objectCreate(proto);
        }
        object.prototype = proto;
        var result = new object();
        object.prototype = void 0;
        return result;
      };
    }();
    function Hash(entries) {
      var index = -1, length = entries == null ? 0 : entries.length;
      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }
    function hashClear() {
      this.__data__ = nativeCreate ? nativeCreate(null) : {};
      this.size = 0;
    }
    function hashDelete(key) {
      var result = this.has(key) && delete this.__data__[key];
      this.size -= result ? 1 : 0;
      return result;
    }
    function hashGet(key) {
      var data = this.__data__;
      if (nativeCreate) {
        var result = data[key];
        return result === HASH_UNDEFINED ? void 0 : result;
      }
      return hasOwnProperty.call(data, key) ? data[key] : void 0;
    }
    function hashHas(key) {
      var data = this.__data__;
      return nativeCreate ? data[key] !== void 0 : hasOwnProperty.call(data, key);
    }
    function hashSet(key, value) {
      var data = this.__data__;
      this.size += this.has(key) ? 0 : 1;
      data[key] = nativeCreate && value === void 0 ? HASH_UNDEFINED : value;
      return this;
    }
    Hash.prototype.clear = hashClear;
    Hash.prototype["delete"] = hashDelete;
    Hash.prototype.get = hashGet;
    Hash.prototype.has = hashHas;
    Hash.prototype.set = hashSet;
    function ListCache(entries) {
      var index = -1, length = entries == null ? 0 : entries.length;
      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }
    function listCacheClear() {
      this.__data__ = [];
      this.size = 0;
    }
    function listCacheDelete(key) {
      var data = this.__data__, index = assocIndexOf(data, key);
      if (index < 0) {
        return false;
      }
      var lastIndex = data.length - 1;
      if (index == lastIndex) {
        data.pop();
      } else {
        splice.call(data, index, 1);
      }
      --this.size;
      return true;
    }
    function listCacheGet(key) {
      var data = this.__data__, index = assocIndexOf(data, key);
      return index < 0 ? void 0 : data[index][1];
    }
    function listCacheHas(key) {
      return assocIndexOf(this.__data__, key) > -1;
    }
    function listCacheSet(key, value) {
      var data = this.__data__, index = assocIndexOf(data, key);
      if (index < 0) {
        ++this.size;
        data.push([key, value]);
      } else {
        data[index][1] = value;
      }
      return this;
    }
    ListCache.prototype.clear = listCacheClear;
    ListCache.prototype["delete"] = listCacheDelete;
    ListCache.prototype.get = listCacheGet;
    ListCache.prototype.has = listCacheHas;
    ListCache.prototype.set = listCacheSet;
    function MapCache(entries) {
      var index = -1, length = entries == null ? 0 : entries.length;
      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }
    function mapCacheClear() {
      this.size = 0;
      this.__data__ = {
        "hash": new Hash(),
        "map": new (Map || ListCache)(),
        "string": new Hash()
      };
    }
    function mapCacheDelete(key) {
      var result = getMapData(this, key)["delete"](key);
      this.size -= result ? 1 : 0;
      return result;
    }
    function mapCacheGet(key) {
      return getMapData(this, key).get(key);
    }
    function mapCacheHas(key) {
      return getMapData(this, key).has(key);
    }
    function mapCacheSet(key, value) {
      var data = getMapData(this, key), size = data.size;
      data.set(key, value);
      this.size += data.size == size ? 0 : 1;
      return this;
    }
    MapCache.prototype.clear = mapCacheClear;
    MapCache.prototype["delete"] = mapCacheDelete;
    MapCache.prototype.get = mapCacheGet;
    MapCache.prototype.has = mapCacheHas;
    MapCache.prototype.set = mapCacheSet;
    function Stack(entries) {
      var data = this.__data__ = new ListCache(entries);
      this.size = data.size;
    }
    function stackClear() {
      this.__data__ = new ListCache();
      this.size = 0;
    }
    function stackDelete(key) {
      var data = this.__data__, result = data["delete"](key);
      this.size = data.size;
      return result;
    }
    function stackGet(key) {
      return this.__data__.get(key);
    }
    function stackHas(key) {
      return this.__data__.has(key);
    }
    function stackSet(key, value) {
      var data = this.__data__;
      if (data instanceof ListCache) {
        var pairs = data.__data__;
        if (!Map || pairs.length < LARGE_ARRAY_SIZE - 1) {
          pairs.push([key, value]);
          this.size = ++data.size;
          return this;
        }
        data = this.__data__ = new MapCache(pairs);
      }
      data.set(key, value);
      this.size = data.size;
      return this;
    }
    Stack.prototype.clear = stackClear;
    Stack.prototype["delete"] = stackDelete;
    Stack.prototype.get = stackGet;
    Stack.prototype.has = stackHas;
    Stack.prototype.set = stackSet;
    function arrayLikeKeys(value, inherited) {
      var isArr = isArray(value), isArg = !isArr && isArguments(value), isBuff = !isArr && !isArg && isBuffer(value), isType = !isArr && !isArg && !isBuff && isTypedArray(value), skipIndexes = isArr || isArg || isBuff || isType, result = skipIndexes ? baseTimes(value.length, String) : [], length = result.length;
      for (var key in value) {
        if ((inherited || hasOwnProperty.call(value, key)) && !(skipIndexes && // Safari 9 has enumerable `arguments.length` in strict mode.
        (key == "length" || // Node.js 0.10 has enumerable non-index properties on buffers.
        isBuff && (key == "offset" || key == "parent") || // PhantomJS 2 has enumerable non-index properties on typed arrays.
        isType && (key == "buffer" || key == "byteLength" || key == "byteOffset") || // Skip index properties.
        isIndex(key, length)))) {
          result.push(key);
        }
      }
      return result;
    }
    function assignMergeValue(object, key, value) {
      if (value !== void 0 && !eq(object[key], value) || value === void 0 && !(key in object)) {
        baseAssignValue(object, key, value);
      }
    }
    function assignValue(object, key, value) {
      var objValue = object[key];
      if (!(hasOwnProperty.call(object, key) && eq(objValue, value)) || value === void 0 && !(key in object)) {
        baseAssignValue(object, key, value);
      }
    }
    function assocIndexOf(array, key) {
      var length = array.length;
      while (length--) {
        if (eq(array[length][0], key)) {
          return length;
        }
      }
      return -1;
    }
    function baseAssignValue(object, key, value) {
      if (key == "__proto__" && defineProperty) {
        defineProperty(object, key, {
          "configurable": true,
          "enumerable": true,
          "value": value,
          "writable": true
        });
      } else {
        object[key] = value;
      }
    }
    var baseFor = createBaseFor();
    function baseGetTag(value) {
      if (value == null) {
        return value === void 0 ? undefinedTag : nullTag;
      }
      return symToStringTag && symToStringTag in Object(value) ? getRawTag(value) : objectToString(value);
    }
    function baseIsArguments(value) {
      return isObjectLike(value) && baseGetTag(value) == argsTag;
    }
    function baseIsNative(value) {
      if (!isObject(value) || isMasked(value)) {
        return false;
      }
      var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
      return pattern.test(toSource(value));
    }
    function baseIsTypedArray(value) {
      return isObjectLike(value) && isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
    }
    function baseKeysIn(object) {
      if (!isObject(object)) {
        return nativeKeysIn(object);
      }
      var isProto = isPrototype(object), result = [];
      for (var key in object) {
        if (!(key == "constructor" && (isProto || !hasOwnProperty.call(object, key)))) {
          result.push(key);
        }
      }
      return result;
    }
    function baseMerge(object, source, srcIndex, customizer, stack) {
      if (object === source) {
        return;
      }
      baseFor(source, function(srcValue, key) {
        stack || (stack = new Stack());
        if (isObject(srcValue)) {
          baseMergeDeep(object, source, key, srcIndex, baseMerge, customizer, stack);
        } else {
          var newValue = customizer ? customizer(safeGet(object, key), srcValue, key + "", object, source, stack) : void 0;
          if (newValue === void 0) {
            newValue = srcValue;
          }
          assignMergeValue(object, key, newValue);
        }
      }, keysIn);
    }
    function baseMergeDeep(object, source, key, srcIndex, mergeFunc, customizer, stack) {
      var objValue = safeGet(object, key), srcValue = safeGet(source, key), stacked = stack.get(srcValue);
      if (stacked) {
        assignMergeValue(object, key, stacked);
        return;
      }
      var newValue = customizer ? customizer(objValue, srcValue, key + "", object, source, stack) : void 0;
      var isCommon = newValue === void 0;
      if (isCommon) {
        var isArr = isArray(srcValue), isBuff = !isArr && isBuffer(srcValue), isTyped = !isArr && !isBuff && isTypedArray(srcValue);
        newValue = srcValue;
        if (isArr || isBuff || isTyped) {
          if (isArray(objValue)) {
            newValue = objValue;
          } else if (isArrayLikeObject(objValue)) {
            newValue = copyArray(objValue);
          } else if (isBuff) {
            isCommon = false;
            newValue = cloneBuffer(srcValue, true);
          } else if (isTyped) {
            isCommon = false;
            newValue = cloneTypedArray(srcValue, true);
          } else {
            newValue = [];
          }
        } else if (isPlainObject(srcValue) || isArguments(srcValue)) {
          newValue = objValue;
          if (isArguments(objValue)) {
            newValue = toPlainObject(objValue);
          } else if (!isObject(objValue) || isFunction(objValue)) {
            newValue = initCloneObject(srcValue);
          }
        } else {
          isCommon = false;
        }
      }
      if (isCommon) {
        stack.set(srcValue, newValue);
        mergeFunc(newValue, srcValue, srcIndex, customizer, stack);
        stack["delete"](srcValue);
      }
      assignMergeValue(object, key, newValue);
    }
    function baseRest(func, start) {
      return setToString(overRest(func, start, identity), func + "");
    }
    var baseSetToString = !defineProperty ? identity : function(func, string) {
      return defineProperty(func, "toString", {
        "configurable": true,
        "enumerable": false,
        "value": constant(string),
        "writable": true
      });
    };
    function cloneBuffer(buffer, isDeep) {
      if (isDeep) {
        return buffer.slice();
      }
      var length = buffer.length, result = allocUnsafe ? allocUnsafe(length) : new buffer.constructor(length);
      buffer.copy(result);
      return result;
    }
    function cloneArrayBuffer(arrayBuffer) {
      var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
      new Uint8Array2(result).set(new Uint8Array2(arrayBuffer));
      return result;
    }
    function cloneTypedArray(typedArray, isDeep) {
      var buffer = isDeep ? cloneArrayBuffer(typedArray.buffer) : typedArray.buffer;
      return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
    }
    function copyArray(source, array) {
      var index = -1, length = source.length;
      array || (array = Array(length));
      while (++index < length) {
        array[index] = source[index];
      }
      return array;
    }
    function copyObject(source, props, object, customizer) {
      var isNew = !object;
      object || (object = {});
      var index = -1, length = props.length;
      while (++index < length) {
        var key = props[index];
        var newValue = customizer ? customizer(object[key], source[key], key, object, source) : void 0;
        if (newValue === void 0) {
          newValue = source[key];
        }
        if (isNew) {
          baseAssignValue(object, key, newValue);
        } else {
          assignValue(object, key, newValue);
        }
      }
      return object;
    }
    function createAssigner(assigner) {
      return baseRest(function(object, sources) {
        var index = -1, length = sources.length, customizer = length > 1 ? sources[length - 1] : void 0, guard = length > 2 ? sources[2] : void 0;
        customizer = assigner.length > 3 && typeof customizer == "function" ? (length--, customizer) : void 0;
        if (guard && isIterateeCall(sources[0], sources[1], guard)) {
          customizer = length < 3 ? void 0 : customizer;
          length = 1;
        }
        object = Object(object);
        while (++index < length) {
          var source = sources[index];
          if (source) {
            assigner(object, source, index, customizer);
          }
        }
        return object;
      });
    }
    function createBaseFor(fromRight) {
      return function(object, iteratee, keysFunc) {
        var index = -1, iterable = Object(object), props = keysFunc(object), length = props.length;
        while (length--) {
          var key = props[fromRight ? length : ++index];
          if (iteratee(iterable[key], key, iterable) === false) {
            break;
          }
        }
        return object;
      };
    }
    function getMapData(map, key) {
      var data = map.__data__;
      return isKeyable(key) ? data[typeof key == "string" ? "string" : "hash"] : data.map;
    }
    function getNative(object, key) {
      var value = getValue(object, key);
      return baseIsNative(value) ? value : void 0;
    }
    function getRawTag(value) {
      var isOwn = hasOwnProperty.call(value, symToStringTag), tag = value[symToStringTag];
      try {
        value[symToStringTag] = void 0;
        var unmasked = true;
      } catch (e) {
      }
      var result = nativeObjectToString.call(value);
      if (unmasked) {
        if (isOwn) {
          value[symToStringTag] = tag;
        } else {
          delete value[symToStringTag];
        }
      }
      return result;
    }
    function initCloneObject(object) {
      return typeof object.constructor == "function" && !isPrototype(object) ? baseCreate(getPrototype(object)) : {};
    }
    function isIndex(value, length) {
      var type = typeof value;
      length = length == null ? MAX_SAFE_INTEGER : length;
      return !!length && (type == "number" || type != "symbol" && reIsUint.test(value)) && (value > -1 && value % 1 == 0 && value < length);
    }
    function isIterateeCall(value, index, object) {
      if (!isObject(object)) {
        return false;
      }
      var type = typeof index;
      if (type == "number" ? isArrayLike(object) && isIndex(index, object.length) : type == "string" && index in object) {
        return eq(object[index], value);
      }
      return false;
    }
    function isKeyable(value) {
      var type = typeof value;
      return type == "string" || type == "number" || type == "symbol" || type == "boolean" ? value !== "__proto__" : value === null;
    }
    function isMasked(func) {
      return !!maskSrcKey && maskSrcKey in func;
    }
    function isPrototype(value) {
      var Ctor = value && value.constructor, proto = typeof Ctor == "function" && Ctor.prototype || objectProto;
      return value === proto;
    }
    function nativeKeysIn(object) {
      var result = [];
      if (object != null) {
        for (var key in Object(object)) {
          result.push(key);
        }
      }
      return result;
    }
    function objectToString(value) {
      return nativeObjectToString.call(value);
    }
    function overRest(func, start, transform) {
      start = nativeMax(start === void 0 ? func.length - 1 : start, 0);
      return function() {
        var args = arguments, index = -1, length = nativeMax(args.length - start, 0), array = Array(length);
        while (++index < length) {
          array[index] = args[start + index];
        }
        index = -1;
        var otherArgs = Array(start + 1);
        while (++index < start) {
          otherArgs[index] = args[index];
        }
        otherArgs[start] = transform(array);
        return apply(func, this, otherArgs);
      };
    }
    function safeGet(object, key) {
      if (key === "constructor" && typeof object[key] === "function") {
        return;
      }
      if (key == "__proto__") {
        return;
      }
      return object[key];
    }
    var setToString = shortOut(baseSetToString);
    function shortOut(func) {
      var count = 0, lastCalled = 0;
      return function() {
        var stamp = nativeNow(), remaining = HOT_SPAN - (stamp - lastCalled);
        lastCalled = stamp;
        if (remaining > 0) {
          if (++count >= HOT_COUNT) {
            return arguments[0];
          }
        } else {
          count = 0;
        }
        return func.apply(void 0, arguments);
      };
    }
    function toSource(func) {
      if (func != null) {
        try {
          return funcToString.call(func);
        } catch (e) {
        }
        try {
          return func + "";
        } catch (e) {
        }
      }
      return "";
    }
    function eq(value, other) {
      return value === other || value !== value && other !== other;
    }
    var isArguments = baseIsArguments(/* @__PURE__ */ function() {
      return arguments;
    }()) ? baseIsArguments : function(value) {
      return isObjectLike(value) && hasOwnProperty.call(value, "callee") && !propertyIsEnumerable.call(value, "callee");
    };
    var isArray = Array.isArray;
    function isArrayLike(value) {
      return value != null && isLength(value.length) && !isFunction(value);
    }
    function isArrayLikeObject(value) {
      return isObjectLike(value) && isArrayLike(value);
    }
    var isBuffer = nativeIsBuffer || stubFalse;
    function isFunction(value) {
      if (!isObject(value)) {
        return false;
      }
      var tag = baseGetTag(value);
      return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
    }
    function isLength(value) {
      return typeof value == "number" && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
    }
    function isObject(value) {
      var type = typeof value;
      return value != null && (type == "object" || type == "function");
    }
    function isObjectLike(value) {
      return value != null && typeof value == "object";
    }
    function isPlainObject(value) {
      if (!isObjectLike(value) || baseGetTag(value) != objectTag) {
        return false;
      }
      var proto = getPrototype(value);
      if (proto === null) {
        return true;
      }
      var Ctor = hasOwnProperty.call(proto, "constructor") && proto.constructor;
      return typeof Ctor == "function" && Ctor instanceof Ctor && funcToString.call(Ctor) == objectCtorString;
    }
    var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;
    function toPlainObject(value) {
      return copyObject(value, keysIn(value));
    }
    function keysIn(object) {
      return isArrayLike(object) ? arrayLikeKeys(object, true) : baseKeysIn(object);
    }
    var merge = createAssigner(function(object, source, srcIndex) {
      baseMerge(object, source, srcIndex);
    });
    function constant(value) {
      return function() {
        return value;
      };
    }
    function identity(value) {
      return value;
    }
    function stubFalse() {
      return false;
    }
    module2.exports = merge;
  }
});

// node_modules/@aws-lambda-powertools/logger/lib/log/LogItem.js
var require_LogItem = __commonJS({
  "node_modules/@aws-lambda-powertools/logger/lib/log/LogItem.js"(exports2) {
    "use strict";
    var __importDefault2 = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.LogItem = void 0;
    var lodash_merge_1 = __importDefault2(require_lodash());
    var LogItem = class {
      constructor(params) {
        this.attributes = {};
        this.addAttributes(params.baseAttributes);
        this.addAttributes(params.persistentAttributes);
      }
      addAttributes(attributes) {
        this.attributes = (0, lodash_merge_1.default)(this.attributes, attributes);
        return this;
      }
      getAttributes() {
        return this.attributes;
      }
      prepareForPrint() {
        this.setAttributes(this.removeEmptyKeys(this.getAttributes()));
      }
      removeEmptyKeys(attributes) {
        const newAttributes = {};
        for (const key in attributes) {
          if (attributes[key] !== void 0 && attributes[key] !== "" && attributes[key] !== null) {
            newAttributes[key] = attributes[key];
          }
        }
        return newAttributes;
      }
      setAttributes(attributes) {
        this.attributes = attributes;
      }
    };
    exports2.LogItem = LogItem;
  }
});

// node_modules/@aws-lambda-powertools/logger/lib/log/LogItemInterface.js
var require_LogItemInterface = __commonJS({
  "node_modules/@aws-lambda-powertools/logger/lib/log/LogItemInterface.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
  }
});

// node_modules/@aws-lambda-powertools/logger/lib/log/index.js
var require_log = __commonJS({
  "node_modules/@aws-lambda-powertools/logger/lib/log/index.js"(exports2) {
    "use strict";
    var __createBinding2 = exports2 && exports2.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __exportStar2 = exports2 && exports2.__exportStar || function(m, exports3) {
      for (var p in m)
        if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports3, p))
          __createBinding2(exports3, m, p);
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    __exportStar2(require_LogItem(), exports2);
    __exportStar2(require_LogItemInterface(), exports2);
  }
});

// node_modules/@aws-lambda-powertools/logger/lib/config/ConfigServiceInterface.js
var require_ConfigServiceInterface = __commonJS({
  "node_modules/@aws-lambda-powertools/logger/lib/config/ConfigServiceInterface.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
  }
});

// node_modules/@aws-lambda-powertools/logger/lib/config/EnvironmentVariablesService.js
var require_EnvironmentVariablesService2 = __commonJS({
  "node_modules/@aws-lambda-powertools/logger/lib/config/EnvironmentVariablesService.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.EnvironmentVariablesService = void 0;
    var commons_1 = require_lib2();
    var EnvironmentVariablesService = class extends commons_1.EnvironmentVariablesService {
      constructor() {
        super(...arguments);
        this.awsLogLevelVariable = "AWS_LAMBDA_LOG_LEVEL";
        this.awsRegionVariable = "AWS_REGION";
        this.currentEnvironmentVariable = "ENVIRONMENT";
        this.functionNameVariable = "AWS_LAMBDA_FUNCTION_NAME";
        this.functionVersionVariable = "AWS_LAMBDA_FUNCTION_VERSION";
        this.logEventVariable = "POWERTOOLS_LOGGER_LOG_EVENT";
        this.logLevelVariable = "POWERTOOLS_LOG_LEVEL";
        this.logLevelVariableLegacy = "LOG_LEVEL";
        this.memoryLimitInMBVariable = "AWS_LAMBDA_FUNCTION_MEMORY_SIZE";
        this.sampleRateValueVariable = "POWERTOOLS_LOGGER_SAMPLE_RATE";
      }
      /**
       * It returns the value of the `AWS_LAMBDA_LOG_LEVEL` environment variable.
       *
       * The `AWS_LAMBDA_LOG_LEVEL` environment variable is set by AWS Lambda when configuring
       * the function's log level using the Advanced Logging Controls feature. This value always
       * takes precedence over other means of configuring the log level.
       *
       * @note we need to map the `FATAL` log level to `CRITICAL`, see {@link https://docs.aws.amazon.com/lambda/latest/dg/configuration-logging.html#configuration-logging-log-levels AWS Lambda Log Levels}.
       *
       * @returns {string}
       */
      getAwsLogLevel() {
        const awsLogLevelVariable = this.get(this.awsLogLevelVariable);
        return awsLogLevelVariable === "FATAL" ? "CRITICAL" : awsLogLevelVariable;
      }
      /**
       * It returns the value of the AWS_REGION environment variable.
       *
       * @returns {string}
       */
      getAwsRegion() {
        return this.get(this.awsRegionVariable);
      }
      /**
       * It returns the value of the ENVIRONMENT environment variable.
       *
       * @returns {string}
       */
      getCurrentEnvironment() {
        return this.get(this.currentEnvironmentVariable);
      }
      /**
       * It returns the value of the AWS_LAMBDA_FUNCTION_MEMORY_SIZE environment variable.
       *
       * @returns {string}
       */
      getFunctionMemory() {
        const value = this.get(this.memoryLimitInMBVariable);
        return Number(value);
      }
      /**
       * It returns the value of the AWS_LAMBDA_FUNCTION_NAME environment variable.
       *
       * @returns {string}
       */
      getFunctionName() {
        return this.get(this.functionNameVariable);
      }
      /**
       * It returns the value of the AWS_LAMBDA_FUNCTION_VERSION environment variable.
       *
       * @returns {string}
       */
      getFunctionVersion() {
        return this.get(this.functionVersionVariable);
      }
      /**
       * It returns the value of the POWERTOOLS_LOGGER_LOG_EVENT environment variable.
       *
       * @returns {boolean}
       */
      getLogEvent() {
        const value = this.get(this.logEventVariable);
        return this.isValueTrue(value);
      }
      /**
       * It returns the value of the `POWERTOOLS_LOG_LEVEL, or `LOG_LEVEL` (legacy) environment variables
       * when the first one is not set.
       *
       * @note The `LOG_LEVEL` environment variable is considered legacy and will be removed in a future release.
       * @note The `AWS_LAMBDA_LOG_LEVEL` environment variable always takes precedence over the ones above.
       *
       * @returns {string}
       */
      getLogLevel() {
        const logLevelVariable = this.get(this.logLevelVariable);
        const logLevelVariableAlias = this.get(this.logLevelVariableLegacy);
        return logLevelVariable !== "" ? logLevelVariable : logLevelVariableAlias;
      }
      /**
       * It returns the value of the POWERTOOLS_LOGGER_SAMPLE_RATE environment variable.
       *
       * @returns {string|undefined}
       */
      getSampleRateValue() {
        const value = this.get(this.sampleRateValueVariable);
        return value && value.length > 0 ? Number(value) : void 0;
      }
    };
    exports2.EnvironmentVariablesService = EnvironmentVariablesService;
  }
});

// node_modules/@aws-lambda-powertools/logger/lib/config/index.js
var require_config2 = __commonJS({
  "node_modules/@aws-lambda-powertools/logger/lib/config/index.js"(exports2) {
    "use strict";
    var __createBinding2 = exports2 && exports2.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __exportStar2 = exports2 && exports2.__exportStar || function(m, exports3) {
      for (var p in m)
        if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports3, p))
          __createBinding2(exports3, m, p);
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    __exportStar2(require_ConfigServiceInterface(), exports2);
    __exportStar2(require_EnvironmentVariablesService2(), exports2);
  }
});

// node_modules/@aws-lambda-powertools/logger/lib/Logger.js
var require_Logger = __commonJS({
  "node_modules/@aws-lambda-powertools/logger/lib/Logger.js"(exports2) {
    "use strict";
    var __importDefault2 = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Logger = void 0;
    var node_crypto_1 = require("node:crypto");
    var node_console_1 = require("node:console");
    var node_util_1 = require("node:util");
    var commons_1 = require_lib2();
    var formatter_1 = require_formatter();
    var log_1 = require_log();
    var lodash_merge_1 = __importDefault2(require_lodash());
    var config_1 = require_config2();
    var Logger2 = class _Logger extends commons_1.Utility {
      /**
       * Log level used by the current instance of Logger.
       *
       * Returns the log level as a number. The higher the number, the less verbose the logs.
       * To get the log level name, use the {@link getLevelName()} method.
       */
      get level() {
        return this.logLevel;
      }
      /**
       * It initializes the Logger class with an optional set of options (settings).
       * *
       * @param {ConstructorOptions} options
       */
      constructor(options = {}) {
        super();
        this.logEvent = false;
        this.logIndentation = 0;
        this.logLevel = 12;
        this.logLevelThresholds = {
          DEBUG: 8,
          INFO: 12,
          WARN: 16,
          ERROR: 20,
          CRITICAL: 24,
          SILENT: 28
        };
        this.logsSampled = false;
        this.persistentLogAttributes = {};
        this.powertoolLogData = {};
        this.setOptions(options);
      }
      /**
       * It adds the current Lambda function's invocation context data to the powertoolLogData property of the instance.
       * This context data will be part of all printed log items.
       *
       * @param {Context} context
       * @returns {void}
       */
      addContext(context) {
        const lambdaContext = {
          invokedFunctionArn: context.invokedFunctionArn,
          coldStart: this.getColdStart(),
          awsRequestId: context.awsRequestId,
          memoryLimitInMB: Number(context.memoryLimitInMB),
          functionName: context.functionName,
          functionVersion: context.functionVersion
        };
        this.addToPowertoolLogData({
          lambdaContext
        });
      }
      /**
       * It adds the given attributes (key-value pairs) to all log items generated by this Logger instance.
       *
       * @param {LogAttributes} attributes
       * @returns {void}
       */
      addPersistentLogAttributes(attributes) {
        (0, lodash_merge_1.default)(this.persistentLogAttributes, attributes);
      }
      /**
       * Alias for addPersistentLogAttributes.
       *
       * @param {LogAttributes} attributes
       * @returns {void}
       */
      appendKeys(attributes) {
        this.addPersistentLogAttributes(attributes);
      }
      /**
       * It creates a separate Logger instance, identical to the current one
       * It's possible to overwrite the new instance options by passing them.
       *
       * @param {ConstructorOptions} options
       * @returns {Logger}
       */
      createChild(options = {}) {
        const parentsOptions = {
          logLevel: this.getLevelName(),
          customConfigService: this.getCustomConfigService(),
          logFormatter: this.getLogFormatter()
        };
        const parentsPowertoolsLogData = this.getPowertoolLogData();
        const childLogger = this.createLogger((0, lodash_merge_1.default)(parentsOptions, parentsPowertoolsLogData, options));
        const parentsPersistentLogAttributes = this.getPersistentLogAttributes();
        childLogger.addPersistentLogAttributes(parentsPersistentLogAttributes);
        if (parentsPowertoolsLogData.lambdaContext) {
          childLogger.addContext(parentsPowertoolsLogData.lambdaContext);
        }
        return childLogger;
      }
      /**
       * It prints a log item with level CRITICAL.
       *
       * @param {LogItemMessage} input
       * @param {Error | LogAttributes | string} extraInput
       */
      critical(input, ...extraInput) {
        this.processLogItem(24, input, extraInput);
      }
      /**
       * It prints a log item with level DEBUG.
       *
       * @param {LogItemMessage} input
       * @param {Error | LogAttributes | string} extraInput
       * @returns {void}
       */
      debug(input, ...extraInput) {
        this.processLogItem(8, input, extraInput);
      }
      /**
       * It prints a log item with level ERROR.
       *
       * @param {LogItemMessage} input
       * @param {Error | LogAttributes | string} extraInput
       * @returns {void}
       */
      error(input, ...extraInput) {
        this.processLogItem(20, input, extraInput);
      }
      /**
       * Get the log level name of the current instance of Logger.
       *
       * It returns the log level name, i.e. `INFO`, `DEBUG`, etc.
       * To get the log level as a number, use the {@link Logger.level} property.
       *
       * @returns {Uppercase<LogLevel>} The log level name.
       */
      getLevelName() {
        return this.getLogLevelNameFromNumber(this.logLevel);
      }
      /**
       * It returns a boolean value. True means that the Lambda invocation events
       * are printed in the logs.
       *
       * @returns {boolean}
       */
      getLogEvent() {
        return this.logEvent;
      }
      /**
       * It returns a boolean value, if true all the logs will be printed.
       *
       * @returns {boolean}
       */
      getLogsSampled() {
        return this.logsSampled;
      }
      /**
       * It returns the persistent log attributes, which are the attributes
       * that will be logged in all log items.
       *
       * @private
       * @returns {LogAttributes}
       */
      getPersistentLogAttributes() {
        return this.persistentLogAttributes;
      }
      /**
       * It prints a log item with level INFO.
       *
       * @param {LogItemMessage} input
       * @param {Error | LogAttributes | string} extraInput
       * @returns {void}
       */
      info(input, ...extraInput) {
        this.processLogItem(12, input, extraInput);
      }
      /**
       * Method decorator that adds the current Lambda function context as extra
       * information in all log items.
       *
       * The decorator can be used only when attached to a Lambda function handler which
       * is written as method of a class, and should be declared just before the handler declaration.
       *
       * Note: Currently TypeScript only supports decorators on classes and methods. If you are using the
       * function syntax, you should use the middleware instead.
       *
       * @example
       * ```typescript
       * import { Logger } from '@aws-lambda-powertools/logger';
       * import { LambdaInterface } from '@aws-lambda-powertools/commons';
       *
       * const logger = new Logger();
       *
       * class Lambda implements LambdaInterface {
       *     // Decorate your handler class method
       *     ⁣@logger.injectLambdaContext()
       *     public async handler(_event: unknown, _context: unknown): Promise<void> {
       *         logger.info('This is an INFO log with some context');
       *     }
       * }
       *
       * const handlerClass = new Lambda();
       * export const handler = handlerClass.handler.bind(handlerClass);
       * ```
       *
       * @see https://www.typescriptlang.org/docs/handbook/decorators.html#method-decorators
       * @returns {HandlerMethodDecorator}
       */
      injectLambdaContext(options) {
        return (_target, _propertyKey, descriptor) => {
          const originalMethod = descriptor.value;
          const loggerRef = this;
          descriptor.value = async function(event, context, callback) {
            let initialPersistentAttributes = {};
            if (options && options.clearState === true) {
              initialPersistentAttributes = {
                ...loggerRef.getPersistentLogAttributes()
              };
            }
            _Logger.injectLambdaContextBefore(loggerRef, event, context, options);
            let result;
            try {
              result = await originalMethod.apply(this, [event, context, callback]);
            } catch (error) {
              throw error;
            } finally {
              _Logger.injectLambdaContextAfterOrOnError(loggerRef, initialPersistentAttributes, options);
            }
            return result;
          };
        };
      }
      static injectLambdaContextAfterOrOnError(logger2, initialPersistentAttributes, options) {
        if (options && options.clearState === true) {
          logger2.setPersistentLogAttributes(initialPersistentAttributes);
        }
      }
      static injectLambdaContextBefore(logger2, event, context, options) {
        logger2.addContext(context);
        let shouldLogEvent = void 0;
        if (options && options.hasOwnProperty("logEvent")) {
          shouldLogEvent = options.logEvent;
        }
        logger2.logEventIfEnabled(event, shouldLogEvent);
      }
      /**
       * Logs a Lambda invocation event, if it *should*.
       *
       ** @param {unknown} event
       * @param {boolean} [overwriteValue]
       * @returns {void}
       */
      logEventIfEnabled(event, overwriteValue) {
        if (!this.shouldLogEvent(overwriteValue)) {
          return;
        }
        this.info("Lambda invocation event", { event });
      }
      /**
       * If the sample rate feature is enabled, the calculation that determines whether the logs
       * will actually be printed or not for this invocation is done when the Logger class is
       * initialized.
       * This method will repeat that calculation (with possible different outcome).
       *
       * @returns {void}
       */
      refreshSampleRateCalculation() {
        this.setLogsSampled();
      }
      /**
       * Alias for removePersistentLogAttributes.
       *
       * @param {string[]} keys
       * @returns {void}
       */
      removeKeys(keys) {
        this.removePersistentLogAttributes(keys);
      }
      /**
       * It removes attributes based on provided keys to all log items generated by this Logger instance.
       *
       * @param {string[]} keys
       * @returns {void}
       */
      removePersistentLogAttributes(keys) {
        keys.forEach((key) => {
          if (this.persistentLogAttributes && key in this.persistentLogAttributes) {
            delete this.persistentLogAttributes[key];
          }
        });
      }
      /**
       * Set the log level for this Logger instance.
       *
       * If the log level is set using AWS Lambda Advanced Logging Controls, it sets it
       * instead of the given log level to avoid data loss.
       *
       * @param logLevel The log level to set, i.e. `error`, `warn`, `info`, `debug`, etc.
       */
      setLogLevel(logLevel) {
        if (this.awsLogLevelShortCircuit(logLevel))
          return;
        if (this.isValidLogLevel(logLevel)) {
          this.logLevel = this.logLevelThresholds[logLevel];
        } else {
          throw new Error(`Invalid log level: ${logLevel}`);
        }
      }
      /**
       * It sets the given attributes (key-value pairs) to all log items generated by this Logger instance.
       * Note: this replaces the pre-existing value.
       *
       * @param {LogAttributes} attributes
       * @returns {void}
       */
      setPersistentLogAttributes(attributes) {
        this.persistentLogAttributes = attributes;
      }
      /**
       * It sets the user-provided sample rate value.
       *
       * @param {number} [sampleRateValue]
       * @returns {void}
       */
      setSampleRateValue(sampleRateValue) {
        this.powertoolLogData.sampleRateValue = sampleRateValue || this.getCustomConfigService()?.getSampleRateValue() || this.getEnvVarsService().getSampleRateValue();
      }
      /**
       * It checks whether the current Lambda invocation event should be printed in the logs or not.
       *
       * @private
       * @param {boolean} [overwriteValue]
       * @returns {boolean}
       */
      shouldLogEvent(overwriteValue) {
        if (typeof overwriteValue === "boolean") {
          return overwriteValue;
        }
        return this.getLogEvent();
      }
      /**
       * It prints a log item with level WARN.
       *
       * @param {LogItemMessage} input
       * @param {Error | LogAttributes | string} extraInput
       * @returns {void}
       */
      warn(input, ...extraInput) {
        this.processLogItem(16, input, extraInput);
      }
      /**
       * Creates a new Logger instance.
       *
       * @param {ConstructorOptions} [options]
       * @returns {Logger}
       */
      createLogger(options) {
        return new _Logger(options);
      }
      /**
       * Decides whether the current log item should be printed or not.
       *
       * The decision is based on the log level and the sample rate value.
       * A log item will be printed if:
       * 1. The log level is greater than or equal to the Logger's log level.
       * 2. The log level is less than the Logger's log level, but the
       * current sampling value is set to `true`.
       *
       * @param {number} logLevel
       * @returns {boolean}
       * @protected
       */
      shouldPrint(logLevel) {
        if (logLevel >= this.logLevel) {
          return true;
        }
        return this.getLogsSampled();
      }
      /**
       * It stores information that is printed in all log items.
       *
       * @param {Partial<PowertoolLogData>} attributesArray
       * @private
       * @returns {void}
       */
      addToPowertoolLogData(...attributesArray) {
        attributesArray.forEach((attributes) => {
          (0, lodash_merge_1.default)(this.powertoolLogData, attributes);
        });
      }
      awsLogLevelShortCircuit(selectedLogLevel) {
        const awsLogLevel = this.getEnvVarsService().getAwsLogLevel();
        if (this.isValidLogLevel(awsLogLevel)) {
          this.logLevel = this.logLevelThresholds[awsLogLevel];
          if (this.isValidLogLevel(selectedLogLevel) && this.logLevel > this.logLevelThresholds[selectedLogLevel]) {
            this.warn((0, node_util_1.format)(`Current log level (%s) does not match AWS Lambda Advanced Logging Controls minimum log level (%s). This can lead to data loss, consider adjusting them.`, selectedLogLevel, awsLogLevel));
          }
          return true;
        }
        return false;
      }
      /**
       * It processes a particular log item so that it can be printed to stdout:
       * - Merges ephemeral log attributes with persistent log attributes (printed for all logs) and additional info;
       * - Formats all the log attributes;
       *
       * @private
       * @param {number} logLevel
       * @param {LogItemMessage} input
       * @param {LogItemExtraInput} extraInput
       * @returns {LogItem}
       */
      createAndPopulateLogItem(logLevel, input, extraInput) {
        const unformattedBaseAttributes = (0, lodash_merge_1.default)({
          logLevel: this.getLogLevelNameFromNumber(logLevel),
          timestamp: /* @__PURE__ */ new Date(),
          message: typeof input === "string" ? input : input.message,
          xRayTraceId: this.envVarsService.getXrayTraceId()
        }, this.getPowertoolLogData());
        const logItem = new log_1.LogItem({
          baseAttributes: this.getLogFormatter().formatAttributes(unformattedBaseAttributes),
          persistentAttributes: this.getPersistentLogAttributes()
        });
        if (typeof input !== "string") {
          logItem.addAttributes(input);
        }
        extraInput.forEach((item) => {
          const attributes = item instanceof Error ? { error: item } : typeof item === "string" ? { extra: item } : item;
          logItem.addAttributes(attributes);
        });
        return logItem;
      }
      /**
       * It returns the custom config service, an abstraction used to fetch environment variables.
       *
       * @private
       * @returns {ConfigServiceInterface | undefined}
       */
      getCustomConfigService() {
        return this.customConfigService;
      }
      /**
       * It returns the instance of a service that fetches environment variables.
       *
       * @private
       * @returns {EnvironmentVariablesService}
       */
      getEnvVarsService() {
        return this.envVarsService;
      }
      /**
       * It returns the instance of a service that formats the structure of a
       * log item's keys and values in the desired way.
       *
       * @private
       * @returns {LogFormatterInterface}
       */
      getLogFormatter() {
        return this.logFormatter;
      }
      /**
       * Get the log level name from the log level number.
       *
       * For example, if the log level is 16, it will return 'WARN'.
       *
       * @param logLevel - The log level to get the name of
       * @returns - The name of the log level
       */
      getLogLevelNameFromNumber(logLevel) {
        const found = Object.entries(this.logLevelThresholds).find(([key, value]) => {
          if (value === logLevel) {
            return key;
          }
        });
        return found[0];
      }
      /**
       * It returns information that will be added in all log item by
       * this Logger instance (different from user-provided persistent attributes).
       *
       * @private
       * @returns {LogAttributes}
       */
      getPowertoolLogData() {
        return this.powertoolLogData;
      }
      /**
       * When the data added in the log item contains object references or BigInt values,
       * `JSON.stringify()` can't handle them and instead throws errors:
       * `TypeError: cyclic object value` or `TypeError: Do not know how to serialize a BigInt`.
       * To mitigate these issues, this method will find and remove all cyclic references and convert BigInt values to strings.
       *
       * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#exceptions
       * @private
       */
      getReplacer() {
        const references = /* @__PURE__ */ new WeakSet();
        return (key, value) => {
          let item = value;
          if (item instanceof Error) {
            item = this.getLogFormatter().formatError(item);
          }
          if (typeof item === "bigint") {
            return item.toString();
          }
          if (typeof item === "object" && value !== null) {
            if (references.has(item)) {
              return;
            }
            references.add(item);
          }
          return item;
        };
      }
      /**
       * It returns the numeric sample rate value.
       *
       * @private
       * @returns {number}
       */
      getSampleRateValue() {
        if (!this.powertoolLogData.sampleRateValue) {
          this.setSampleRateValue();
        }
        return this.powertoolLogData.sampleRateValue;
      }
      /**
       * It returns true and type guards the log level if a given log level is valid.
       *
       * @param {LogLevel} logLevel
       * @private
       * @returns {boolean}
       */
      isValidLogLevel(logLevel) {
        return typeof logLevel === "string" && logLevel in this.logLevelThresholds;
      }
      /**
       * It prints a given log with given log level.
       *
       * @param {number} logLevel
       * @param {LogItem} log
       * @private
       */
      printLog(logLevel, log) {
        log.prepareForPrint();
        const consoleMethod = logLevel === 24 ? "error" : this.getLogLevelNameFromNumber(logLevel).toLowerCase();
        this.console[consoleMethod](JSON.stringify(log.getAttributes(), this.getReplacer(), this.logIndentation));
      }
      /**
       * It prints a given log with given log level.
       *
       * @param {number} logLevel
       * @param {LogItemMessage} input
       * @param {LogItemExtraInput} extraInput
       * @private
       */
      processLogItem(logLevel, input, extraInput) {
        if (!this.shouldPrint(logLevel)) {
          return;
        }
        this.printLog(logLevel, this.createAndPopulateLogItem(logLevel, input, extraInput));
      }
      /**
       * It initializes console property as an instance of the internal version of Console() class (PR #748)
       * or as the global node console if the `POWERTOOLS_DEV' env variable is set and has truthy value.
       *
       * @private
       * @returns {void}
       */
      setConsole() {
        if (!this.getEnvVarsService().isDevMode()) {
          this.console = new node_console_1.Console({
            stdout: process.stdout,
            stderr: process.stderr
          });
        } else {
          this.console = console;
        }
      }
      /**
       * Sets the Logger's customer config service instance, which will be used
       * to fetch environment variables.
       *
       * @private
       * @param {ConfigServiceInterface} customConfigService
       * @returns {void}
       */
      setCustomConfigService(customConfigService) {
        this.customConfigService = customConfigService ? customConfigService : void 0;
      }
      /**
       * Sets the Logger's custom config service instance, which will be used
       * to fetch environment variables.
       *
       * @private
       * @returns {void}
       */
      setEnvVarsService() {
        this.envVarsService = new config_1.EnvironmentVariablesService();
      }
      /**
       * Sets the initial Logger log level based on the following order:
       * 1. If a log level is set using AWS Lambda Advanced Logging Controls, it sets it.
       * 2. If a log level is passed to the constructor, it sets it.
       * 3. If a log level is set via custom config service, it sets it.
       * 4. If a log level is set via env variables, it sets it.
       *
       * If none of the above is true, the default log level applies (`INFO`).
       *
       * @private
       * @param {LogLevel} [logLevel] - Log level passed to the constructor
       */
      setInitialLogLevel(logLevel) {
        const constructorLogLevel = logLevel?.toUpperCase();
        if (this.awsLogLevelShortCircuit(constructorLogLevel))
          return;
        if (this.isValidLogLevel(constructorLogLevel)) {
          this.logLevel = this.logLevelThresholds[constructorLogLevel];
          return;
        }
        const customConfigValue = this.getCustomConfigService()?.getLogLevel()?.toUpperCase();
        if (this.isValidLogLevel(customConfigValue)) {
          this.logLevel = this.logLevelThresholds[customConfigValue];
          return;
        }
        const envVarsValue = this.getEnvVarsService()?.getLogLevel()?.toUpperCase();
        if (this.isValidLogLevel(envVarsValue)) {
          this.logLevel = this.logLevelThresholds[envVarsValue];
          return;
        }
      }
      /**
       * If the log event feature is enabled via env variable, it sets a property that tracks whether
       * the event passed to the Lambda function handler should be logged or not.
       *
       * @private
       * @returns {void}
       */
      setLogEvent() {
        if (this.getEnvVarsService().getLogEvent()) {
          this.logEvent = true;
        }
      }
      /**
       * It sets the log formatter instance, in charge of giving a custom format
       * to the structured logs
       *
       * @private
       * @param {LogFormatterInterface} logFormatter
       * @returns {void}
       */
      setLogFormatter(logFormatter) {
        this.logFormatter = logFormatter || new formatter_1.PowertoolLogFormatter();
      }
      /**
       * If the `POWERTOOLS_DEV' env variable is set,
       * it adds JSON indentation for pretty printing logs.
       *
       * @private
       * @returns {void}
       */
      setLogIndentation() {
        if (this.getEnvVarsService().isDevMode()) {
          this.logIndentation = 4;
        }
      }
      /**
       * If the sample rate feature is enabled, it sets a property that tracks whether this Lambda function invocation
       * will print logs or not.
       *
       * @private
       * @returns {void}
       */
      setLogsSampled() {
        const sampleRateValue = this.getSampleRateValue();
        this.logsSampled = sampleRateValue !== void 0 && (sampleRateValue === 1 || (0, node_crypto_1.randomInt)(0, 100) / 100 <= sampleRateValue);
      }
      /**
       * It configures the Logger instance settings that will affect the Logger's behaviour
       * and the content of all logs.
       *
       * @private
       * @param {ConstructorOptions} options
       * @returns {Logger}
       */
      setOptions(options) {
        const { logLevel, serviceName, sampleRateValue, logFormatter, customConfigService, persistentLogAttributes, environment } = options;
        this.setEnvVarsService();
        this.setConsole();
        this.setCustomConfigService(customConfigService);
        this.setInitialLogLevel(logLevel);
        this.setSampleRateValue(sampleRateValue);
        this.setLogsSampled();
        this.setLogFormatter(logFormatter);
        this.setPowertoolLogData(serviceName, environment);
        this.setLogEvent();
        this.setLogIndentation();
        this.addPersistentLogAttributes(persistentLogAttributes);
        return this;
      }
      /**
       * It adds important data to the Logger instance that will affect the content of all logs.
       *
       * @param {string} serviceName
       * @param {Environment} environment
       * @param {LogAttributes} persistentLogAttributes
       * @private
       * @returns {void}
       */
      setPowertoolLogData(serviceName, environment, persistentLogAttributes = {}) {
        this.addToPowertoolLogData({
          awsRegion: this.getEnvVarsService().getAwsRegion(),
          environment: environment || this.getCustomConfigService()?.getCurrentEnvironment() || this.getEnvVarsService().getCurrentEnvironment(),
          sampleRateValue: this.getSampleRateValue(),
          serviceName: serviceName || this.getCustomConfigService()?.getServiceName() || this.getEnvVarsService().getServiceName() || this.getDefaultServiceName()
        }, persistentLogAttributes);
      }
    };
    exports2.Logger = Logger2;
  }
});

// node_modules/@aws-lambda-powertools/commons/lib/middleware/constants.js
var require_constants2 = __commonJS({
  "node_modules/@aws-lambda-powertools/commons/lib/middleware/constants.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.IDEMPOTENCY_KEY = exports2.LOGGER_KEY = exports2.METRICS_KEY = exports2.TRACER_KEY = exports2.PREFIX = void 0;
    var PREFIX = "powertools-for-aws";
    exports2.PREFIX = PREFIX;
    var TRACER_KEY = `${PREFIX}.tracer`;
    exports2.TRACER_KEY = TRACER_KEY;
    var METRICS_KEY = `${PREFIX}.metrics`;
    exports2.METRICS_KEY = METRICS_KEY;
    var LOGGER_KEY = `${PREFIX}.logger`;
    exports2.LOGGER_KEY = LOGGER_KEY;
    var IDEMPOTENCY_KEY = `${PREFIX}.idempotency`;
    exports2.IDEMPOTENCY_KEY = IDEMPOTENCY_KEY;
  }
});

// node_modules/@aws-lambda-powertools/commons/lib/middleware/cleanupMiddlewares.js
var require_cleanupMiddlewares = __commonJS({
  "node_modules/@aws-lambda-powertools/commons/lib/middleware/cleanupMiddlewares.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.cleanupMiddlewares = void 0;
    var constants_1 = require_constants2();
    var isFunction = (obj) => {
      return typeof obj === "function";
    };
    var cleanupMiddlewares = async (request) => {
      const cleanupFunctionNames = [
        constants_1.TRACER_KEY,
        constants_1.METRICS_KEY,
        constants_1.LOGGER_KEY,
        constants_1.IDEMPOTENCY_KEY
      ];
      for (const functionName of cleanupFunctionNames) {
        if (Object(request.internal).hasOwnProperty(functionName)) {
          const functionReference = request.internal[functionName];
          if (isFunction(functionReference)) {
            await functionReference(request);
          }
        }
      }
    };
    exports2.cleanupMiddlewares = cleanupMiddlewares;
  }
});

// node_modules/@aws-lambda-powertools/commons/lib/middleware/index.js
var require_middleware = __commonJS({
  "node_modules/@aws-lambda-powertools/commons/lib/middleware/index.js"(exports2) {
    "use strict";
    var __createBinding2 = exports2 && exports2.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __exportStar2 = exports2 && exports2.__exportStar || function(m, exports3) {
      for (var p in m)
        if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports3, p))
          __createBinding2(exports3, m, p);
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    __exportStar2(require_cleanupMiddlewares(), exports2);
    __exportStar2(require_constants2(), exports2);
  }
});

// node_modules/@aws-lambda-powertools/logger/lib/middleware/middy.js
var require_middy2 = __commonJS({
  "node_modules/@aws-lambda-powertools/logger/lib/middleware/middy.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.injectLambdaContext = void 0;
    var Logger_1 = require_Logger();
    var middleware_1 = require_middleware();
    var injectLambdaContext = (target, options) => {
      const loggers = target instanceof Array ? target : [target];
      const persistentAttributes = [];
      const isClearState = options && options.clearState === true;
      const setCleanupFunction = (request) => {
        request.internal = {
          ...request.internal,
          [middleware_1.LOGGER_KEY]: injectLambdaContextAfterOrOnError
        };
      };
      const injectLambdaContextBefore = async (request) => {
        loggers.forEach((logger2, index) => {
          if (isClearState) {
            persistentAttributes[index] = {
              ...logger2.getPersistentLogAttributes()
            };
            setCleanupFunction(request);
          }
          Logger_1.Logger.injectLambdaContextBefore(logger2, request.event, request.context, options);
        });
      };
      const injectLambdaContextAfterOrOnError = async () => {
        if (isClearState) {
          loggers.forEach((logger2, index) => {
            Logger_1.Logger.injectLambdaContextAfterOrOnError(logger2, persistentAttributes[index], options);
          });
        }
      };
      return {
        before: injectLambdaContextBefore,
        after: injectLambdaContextAfterOrOnError,
        onError: injectLambdaContextAfterOrOnError
      };
    };
    exports2.injectLambdaContext = injectLambdaContext;
  }
});

// node_modules/@aws-lambda-powertools/logger/lib/middleware/index.js
var require_middleware2 = __commonJS({
  "node_modules/@aws-lambda-powertools/logger/lib/middleware/index.js"(exports2) {
    "use strict";
    var __createBinding2 = exports2 && exports2.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __exportStar2 = exports2 && exports2.__exportStar || function(m, exports3) {
      for (var p in m)
        if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports3, p))
          __createBinding2(exports3, m, p);
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    __exportStar2(require_middy2(), exports2);
  }
});

// node_modules/@aws-lambda-powertools/logger/lib/index.js
var require_lib3 = __commonJS({
  "node_modules/@aws-lambda-powertools/logger/lib/index.js"(exports2) {
    "use strict";
    var __createBinding2 = exports2 && exports2.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __exportStar2 = exports2 && exports2.__exportStar || function(m, exports3) {
      for (var p in m)
        if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports3, p))
          __createBinding2(exports3, m, p);
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    __exportStar2(require_helpers(), exports2);
    __exportStar2(require_Logger(), exports2);
    __exportStar2(require_middleware2(), exports2);
    __exportStar2(require_formatter(), exports2);
  }
});

// node_modules/@aws-crypto/sha256-js/node_modules/tslib/tslib.es6.js
var tslib_es6_exports = {};
__export(tslib_es6_exports, {
  __assign: () => __assign,
  __asyncDelegator: () => __asyncDelegator,
  __asyncGenerator: () => __asyncGenerator,
  __asyncValues: () => __asyncValues,
  __await: () => __await,
  __awaiter: () => __awaiter,
  __classPrivateFieldGet: () => __classPrivateFieldGet,
  __classPrivateFieldSet: () => __classPrivateFieldSet,
  __createBinding: () => __createBinding,
  __decorate: () => __decorate,
  __exportStar: () => __exportStar,
  __extends: () => __extends,
  __generator: () => __generator,
  __importDefault: () => __importDefault,
  __importStar: () => __importStar,
  __makeTemplateObject: () => __makeTemplateObject,
  __metadata: () => __metadata,
  __param: () => __param,
  __read: () => __read,
  __rest: () => __rest,
  __spread: () => __spread,
  __spreadArrays: () => __spreadArrays,
  __values: () => __values
});
function __extends(d, b) {
  extendStatics(d, b);
  function __() {
    this.constructor = d;
  }
  d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}
function __rest(s, e) {
  var t = {};
  for (var p in s)
    if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
      t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function")
    for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
      if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
        t[p[i]] = s[p[i]];
    }
  return t;
}
function __decorate(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
    r = Reflect.decorate(decorators, target, key, desc);
  else
    for (var i = decorators.length - 1; i >= 0; i--)
      if (d = decorators[i])
        r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function __param(paramIndex, decorator) {
  return function(target, key) {
    decorator(target, key, paramIndex);
  };
}
function __metadata(metadataKey, metadataValue) {
  if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
    return Reflect.metadata(metadataKey, metadataValue);
}
function __awaiter(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
}
function __generator(thisArg, body) {
  var _ = { label: 0, sent: function() {
    if (t[0] & 1)
      throw t[1];
    return t[1];
  }, trys: [], ops: [] }, f, y, t, g;
  return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() {
    return this;
  }), g;
  function verb(n) {
    return function(v) {
      return step([n, v]);
    };
  }
  function step(op) {
    if (f)
      throw new TypeError("Generator is already executing.");
    while (_)
      try {
        if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done)
          return t;
        if (y = 0, t)
          op = [op[0] & 2, t.value];
        switch (op[0]) {
          case 0:
          case 1:
            t = op;
            break;
          case 4:
            _.label++;
            return { value: op[1], done: false };
          case 5:
            _.label++;
            y = op[1];
            op = [0];
            continue;
          case 7:
            op = _.ops.pop();
            _.trys.pop();
            continue;
          default:
            if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
              _ = 0;
              continue;
            }
            if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
              _.label = op[1];
              break;
            }
            if (op[0] === 6 && _.label < t[1]) {
              _.label = t[1];
              t = op;
              break;
            }
            if (t && _.label < t[2]) {
              _.label = t[2];
              _.ops.push(op);
              break;
            }
            if (t[2])
              _.ops.pop();
            _.trys.pop();
            continue;
        }
        op = body.call(thisArg, _);
      } catch (e) {
        op = [6, e];
        y = 0;
      } finally {
        f = t = 0;
      }
    if (op[0] & 5)
      throw op[1];
    return { value: op[0] ? op[1] : void 0, done: true };
  }
}
function __createBinding(o, m, k, k2) {
  if (k2 === void 0)
    k2 = k;
  o[k2] = m[k];
}
function __exportStar(m, exports2) {
  for (var p in m)
    if (p !== "default" && !exports2.hasOwnProperty(p))
      exports2[p] = m[p];
}
function __values(o) {
  var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
  if (m)
    return m.call(o);
  if (o && typeof o.length === "number")
    return {
      next: function() {
        if (o && i >= o.length)
          o = void 0;
        return { value: o && o[i++], done: !o };
      }
    };
  throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
}
function __read(o, n) {
  var m = typeof Symbol === "function" && o[Symbol.iterator];
  if (!m)
    return o;
  var i = m.call(o), r, ar = [], e;
  try {
    while ((n === void 0 || n-- > 0) && !(r = i.next()).done)
      ar.push(r.value);
  } catch (error) {
    e = { error };
  } finally {
    try {
      if (r && !r.done && (m = i["return"]))
        m.call(i);
    } finally {
      if (e)
        throw e.error;
    }
  }
  return ar;
}
function __spread() {
  for (var ar = [], i = 0; i < arguments.length; i++)
    ar = ar.concat(__read(arguments[i]));
  return ar;
}
function __spreadArrays() {
  for (var s = 0, i = 0, il = arguments.length; i < il; i++)
    s += arguments[i].length;
  for (var r = Array(s), k = 0, i = 0; i < il; i++)
    for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
      r[k] = a[j];
  return r;
}
function __await(v) {
  return this instanceof __await ? (this.v = v, this) : new __await(v);
}
function __asyncGenerator(thisArg, _arguments, generator) {
  if (!Symbol.asyncIterator)
    throw new TypeError("Symbol.asyncIterator is not defined.");
  var g = generator.apply(thisArg, _arguments || []), i, q = [];
  return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function() {
    return this;
  }, i;
  function verb(n) {
    if (g[n])
      i[n] = function(v) {
        return new Promise(function(a, b) {
          q.push([n, v, a, b]) > 1 || resume(n, v);
        });
      };
  }
  function resume(n, v) {
    try {
      step(g[n](v));
    } catch (e) {
      settle(q[0][3], e);
    }
  }
  function step(r) {
    r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r);
  }
  function fulfill(value) {
    resume("next", value);
  }
  function reject(value) {
    resume("throw", value);
  }
  function settle(f, v) {
    if (f(v), q.shift(), q.length)
      resume(q[0][0], q[0][1]);
  }
}
function __asyncDelegator(o) {
  var i, p;
  return i = {}, verb("next"), verb("throw", function(e) {
    throw e;
  }), verb("return"), i[Symbol.iterator] = function() {
    return this;
  }, i;
  function verb(n, f) {
    i[n] = o[n] ? function(v) {
      return (p = !p) ? { value: __await(o[n](v)), done: n === "return" } : f ? f(v) : v;
    } : f;
  }
}
function __asyncValues(o) {
  if (!Symbol.asyncIterator)
    throw new TypeError("Symbol.asyncIterator is not defined.");
  var m = o[Symbol.asyncIterator], i;
  return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function() {
    return this;
  }, i);
  function verb(n) {
    i[n] = o[n] && function(v) {
      return new Promise(function(resolve, reject) {
        v = o[n](v), settle(resolve, reject, v.done, v.value);
      });
    };
  }
  function settle(resolve, reject, d, v) {
    Promise.resolve(v).then(function(v2) {
      resolve({ value: v2, done: d });
    }, reject);
  }
}
function __makeTemplateObject(cooked, raw) {
  if (Object.defineProperty) {
    Object.defineProperty(cooked, "raw", { value: raw });
  } else {
    cooked.raw = raw;
  }
  return cooked;
}
function __importStar(mod) {
  if (mod && mod.__esModule)
    return mod;
  var result = {};
  if (mod != null) {
    for (var k in mod)
      if (Object.hasOwnProperty.call(mod, k))
        result[k] = mod[k];
  }
  result.default = mod;
  return result;
}
function __importDefault(mod) {
  return mod && mod.__esModule ? mod : { default: mod };
}
function __classPrivateFieldGet(receiver, privateMap) {
  if (!privateMap.has(receiver)) {
    throw new TypeError("attempted to get private field on non-instance");
  }
  return privateMap.get(receiver);
}
function __classPrivateFieldSet(receiver, privateMap, value) {
  if (!privateMap.has(receiver)) {
    throw new TypeError("attempted to set private field on non-instance");
  }
  privateMap.set(receiver, value);
  return value;
}
var extendStatics, __assign;
var init_tslib_es6 = __esm({
  "node_modules/@aws-crypto/sha256-js/node_modules/tslib/tslib.es6.js"() {
    extendStatics = function(d, b) {
      extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
        d2.__proto__ = b2;
      } || function(d2, b2) {
        for (var p in b2)
          if (b2.hasOwnProperty(p))
            d2[p] = b2[p];
      };
      return extendStatics(d, b);
    };
    __assign = function() {
      __assign = Object.assign || function __assign2(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s)
            if (Object.prototype.hasOwnProperty.call(s, p))
              t[p] = s[p];
        }
        return t;
      };
      return __assign.apply(this, arguments);
    };
  }
});

// node_modules/@aws-crypto/sha256-js/build/constants.js
var require_constants3 = __commonJS({
  "node_modules/@aws-crypto/sha256-js/build/constants.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.MAX_HASHABLE_LENGTH = exports2.INIT = exports2.KEY = exports2.DIGEST_LENGTH = exports2.BLOCK_SIZE = void 0;
    exports2.BLOCK_SIZE = 64;
    exports2.DIGEST_LENGTH = 32;
    exports2.KEY = new Uint32Array([
      1116352408,
      1899447441,
      3049323471,
      3921009573,
      961987163,
      1508970993,
      2453635748,
      2870763221,
      3624381080,
      310598401,
      607225278,
      1426881987,
      1925078388,
      2162078206,
      2614888103,
      3248222580,
      3835390401,
      4022224774,
      264347078,
      604807628,
      770255983,
      1249150122,
      1555081692,
      1996064986,
      2554220882,
      2821834349,
      2952996808,
      3210313671,
      3336571891,
      3584528711,
      113926993,
      338241895,
      666307205,
      773529912,
      1294757372,
      1396182291,
      1695183700,
      1986661051,
      2177026350,
      2456956037,
      2730485921,
      2820302411,
      3259730800,
      3345764771,
      3516065817,
      3600352804,
      4094571909,
      275423344,
      430227734,
      506948616,
      659060556,
      883997877,
      958139571,
      1322822218,
      1537002063,
      1747873779,
      1955562222,
      2024104815,
      2227730452,
      2361852424,
      2428436474,
      2756734187,
      3204031479,
      3329325298
    ]);
    exports2.INIT = [
      1779033703,
      3144134277,
      1013904242,
      2773480762,
      1359893119,
      2600822924,
      528734635,
      1541459225
    ];
    exports2.MAX_HASHABLE_LENGTH = Math.pow(2, 53) - 1;
  }
});

// node_modules/@aws-crypto/sha256-js/build/RawSha256.js
var require_RawSha256 = __commonJS({
  "node_modules/@aws-crypto/sha256-js/build/RawSha256.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.RawSha256 = void 0;
    var constants_1 = require_constants3();
    var RawSha256 = (
      /** @class */
      function() {
        function RawSha2562() {
          this.state = Int32Array.from(constants_1.INIT);
          this.temp = new Int32Array(64);
          this.buffer = new Uint8Array(64);
          this.bufferLength = 0;
          this.bytesHashed = 0;
          this.finished = false;
        }
        RawSha2562.prototype.update = function(data) {
          if (this.finished) {
            throw new Error("Attempted to update an already finished hash.");
          }
          var position = 0;
          var byteLength = data.byteLength;
          this.bytesHashed += byteLength;
          if (this.bytesHashed * 8 > constants_1.MAX_HASHABLE_LENGTH) {
            throw new Error("Cannot hash more than 2^53 - 1 bits");
          }
          while (byteLength > 0) {
            this.buffer[this.bufferLength++] = data[position++];
            byteLength--;
            if (this.bufferLength === constants_1.BLOCK_SIZE) {
              this.hashBuffer();
              this.bufferLength = 0;
            }
          }
        };
        RawSha2562.prototype.digest = function() {
          if (!this.finished) {
            var bitsHashed = this.bytesHashed * 8;
            var bufferView = new DataView(this.buffer.buffer, this.buffer.byteOffset, this.buffer.byteLength);
            var undecoratedLength = this.bufferLength;
            bufferView.setUint8(this.bufferLength++, 128);
            if (undecoratedLength % constants_1.BLOCK_SIZE >= constants_1.BLOCK_SIZE - 8) {
              for (var i = this.bufferLength; i < constants_1.BLOCK_SIZE; i++) {
                bufferView.setUint8(i, 0);
              }
              this.hashBuffer();
              this.bufferLength = 0;
            }
            for (var i = this.bufferLength; i < constants_1.BLOCK_SIZE - 8; i++) {
              bufferView.setUint8(i, 0);
            }
            bufferView.setUint32(constants_1.BLOCK_SIZE - 8, Math.floor(bitsHashed / 4294967296), true);
            bufferView.setUint32(constants_1.BLOCK_SIZE - 4, bitsHashed);
            this.hashBuffer();
            this.finished = true;
          }
          var out = new Uint8Array(constants_1.DIGEST_LENGTH);
          for (var i = 0; i < 8; i++) {
            out[i * 4] = this.state[i] >>> 24 & 255;
            out[i * 4 + 1] = this.state[i] >>> 16 & 255;
            out[i * 4 + 2] = this.state[i] >>> 8 & 255;
            out[i * 4 + 3] = this.state[i] >>> 0 & 255;
          }
          return out;
        };
        RawSha2562.prototype.hashBuffer = function() {
          var _a = this, buffer = _a.buffer, state = _a.state;
          var state0 = state[0], state1 = state[1], state2 = state[2], state3 = state[3], state4 = state[4], state5 = state[5], state6 = state[6], state7 = state[7];
          for (var i = 0; i < constants_1.BLOCK_SIZE; i++) {
            if (i < 16) {
              this.temp[i] = (buffer[i * 4] & 255) << 24 | (buffer[i * 4 + 1] & 255) << 16 | (buffer[i * 4 + 2] & 255) << 8 | buffer[i * 4 + 3] & 255;
            } else {
              var u = this.temp[i - 2];
              var t1_1 = (u >>> 17 | u << 15) ^ (u >>> 19 | u << 13) ^ u >>> 10;
              u = this.temp[i - 15];
              var t2_1 = (u >>> 7 | u << 25) ^ (u >>> 18 | u << 14) ^ u >>> 3;
              this.temp[i] = (t1_1 + this.temp[i - 7] | 0) + (t2_1 + this.temp[i - 16] | 0);
            }
            var t1 = (((state4 >>> 6 | state4 << 26) ^ (state4 >>> 11 | state4 << 21) ^ (state4 >>> 25 | state4 << 7)) + (state4 & state5 ^ ~state4 & state6) | 0) + (state7 + (constants_1.KEY[i] + this.temp[i] | 0) | 0) | 0;
            var t2 = ((state0 >>> 2 | state0 << 30) ^ (state0 >>> 13 | state0 << 19) ^ (state0 >>> 22 | state0 << 10)) + (state0 & state1 ^ state0 & state2 ^ state1 & state2) | 0;
            state7 = state6;
            state6 = state5;
            state5 = state4;
            state4 = state3 + t1 | 0;
            state3 = state2;
            state2 = state1;
            state1 = state0;
            state0 = t1 + t2 | 0;
          }
          state[0] += state0;
          state[1] += state1;
          state[2] += state2;
          state[3] += state3;
          state[4] += state4;
          state[5] += state5;
          state[6] += state6;
          state[7] += state7;
        };
        return RawSha2562;
      }()
    );
    exports2.RawSha256 = RawSha256;
  }
});

// node_modules/@aws-crypto/util/build/convertToBuffer.js
var require_convertToBuffer = __commonJS({
  "node_modules/@aws-crypto/util/build/convertToBuffer.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.convertToBuffer = void 0;
    var util_utf8_browser_1 = require("@aws-sdk/util-utf8-browser");
    var fromUtf8 = typeof Buffer !== "undefined" && Buffer.from ? function(input) {
      return Buffer.from(input, "utf8");
    } : util_utf8_browser_1.fromUtf8;
    function convertToBuffer(data) {
      if (data instanceof Uint8Array)
        return data;
      if (typeof data === "string") {
        return fromUtf8(data);
      }
      if (ArrayBuffer.isView(data)) {
        return new Uint8Array(data.buffer, data.byteOffset, data.byteLength / Uint8Array.BYTES_PER_ELEMENT);
      }
      return new Uint8Array(data);
    }
    exports2.convertToBuffer = convertToBuffer;
  }
});

// node_modules/@aws-crypto/util/build/isEmptyData.js
var require_isEmptyData = __commonJS({
  "node_modules/@aws-crypto/util/build/isEmptyData.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.isEmptyData = void 0;
    function isEmptyData(data) {
      if (typeof data === "string") {
        return data.length === 0;
      }
      return data.byteLength === 0;
    }
    exports2.isEmptyData = isEmptyData;
  }
});

// node_modules/@aws-crypto/util/build/numToUint8.js
var require_numToUint8 = __commonJS({
  "node_modules/@aws-crypto/util/build/numToUint8.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.numToUint8 = void 0;
    function numToUint8(num) {
      return new Uint8Array([
        (num & 4278190080) >> 24,
        (num & 16711680) >> 16,
        (num & 65280) >> 8,
        num & 255
      ]);
    }
    exports2.numToUint8 = numToUint8;
  }
});

// node_modules/@aws-crypto/util/build/uint32ArrayFrom.js
var require_uint32ArrayFrom = __commonJS({
  "node_modules/@aws-crypto/util/build/uint32ArrayFrom.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.uint32ArrayFrom = void 0;
    function uint32ArrayFrom(a_lookUpTable) {
      if (!Uint32Array.from) {
        var return_array = new Uint32Array(a_lookUpTable.length);
        var a_index = 0;
        while (a_index < a_lookUpTable.length) {
          return_array[a_index] = a_lookUpTable[a_index];
          a_index += 1;
        }
        return return_array;
      }
      return Uint32Array.from(a_lookUpTable);
    }
    exports2.uint32ArrayFrom = uint32ArrayFrom;
  }
});

// node_modules/@aws-crypto/util/build/index.js
var require_build = __commonJS({
  "node_modules/@aws-crypto/util/build/index.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.uint32ArrayFrom = exports2.numToUint8 = exports2.isEmptyData = exports2.convertToBuffer = void 0;
    var convertToBuffer_1 = require_convertToBuffer();
    Object.defineProperty(exports2, "convertToBuffer", { enumerable: true, get: function() {
      return convertToBuffer_1.convertToBuffer;
    } });
    var isEmptyData_1 = require_isEmptyData();
    Object.defineProperty(exports2, "isEmptyData", { enumerable: true, get: function() {
      return isEmptyData_1.isEmptyData;
    } });
    var numToUint8_1 = require_numToUint8();
    Object.defineProperty(exports2, "numToUint8", { enumerable: true, get: function() {
      return numToUint8_1.numToUint8;
    } });
    var uint32ArrayFrom_1 = require_uint32ArrayFrom();
    Object.defineProperty(exports2, "uint32ArrayFrom", { enumerable: true, get: function() {
      return uint32ArrayFrom_1.uint32ArrayFrom;
    } });
  }
});

// node_modules/@aws-crypto/sha256-js/build/jsSha256.js
var require_jsSha256 = __commonJS({
  "node_modules/@aws-crypto/sha256-js/build/jsSha256.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Sha256 = void 0;
    var tslib_1 = (init_tslib_es6(), __toCommonJS(tslib_es6_exports));
    var constants_1 = require_constants3();
    var RawSha256_1 = require_RawSha256();
    var util_1 = require_build();
    var Sha2562 = (
      /** @class */
      function() {
        function Sha2563(secret) {
          this.secret = secret;
          this.hash = new RawSha256_1.RawSha256();
          this.reset();
        }
        Sha2563.prototype.update = function(toHash) {
          if ((0, util_1.isEmptyData)(toHash) || this.error) {
            return;
          }
          try {
            this.hash.update((0, util_1.convertToBuffer)(toHash));
          } catch (e) {
            this.error = e;
          }
        };
        Sha2563.prototype.digestSync = function() {
          if (this.error) {
            throw this.error;
          }
          if (this.outer) {
            if (!this.outer.finished) {
              this.outer.update(this.hash.digest());
            }
            return this.outer.digest();
          }
          return this.hash.digest();
        };
        Sha2563.prototype.digest = function() {
          return tslib_1.__awaiter(this, void 0, void 0, function() {
            return tslib_1.__generator(this, function(_a) {
              return [2, this.digestSync()];
            });
          });
        };
        Sha2563.prototype.reset = function() {
          this.hash = new RawSha256_1.RawSha256();
          if (this.secret) {
            this.outer = new RawSha256_1.RawSha256();
            var inner = bufferFromSecret(this.secret);
            var outer = new Uint8Array(constants_1.BLOCK_SIZE);
            outer.set(inner);
            for (var i = 0; i < constants_1.BLOCK_SIZE; i++) {
              inner[i] ^= 54;
              outer[i] ^= 92;
            }
            this.hash.update(inner);
            this.outer.update(outer);
            for (var i = 0; i < inner.byteLength; i++) {
              inner[i] = 0;
            }
          }
        };
        return Sha2563;
      }()
    );
    exports2.Sha256 = Sha2562;
    function bufferFromSecret(secret) {
      var input = (0, util_1.convertToBuffer)(secret);
      if (input.byteLength > constants_1.BLOCK_SIZE) {
        var bufferHash = new RawSha256_1.RawSha256();
        bufferHash.update(input);
        input = bufferHash.digest();
      }
      var buffer = new Uint8Array(constants_1.BLOCK_SIZE);
      buffer.set(input);
      return buffer;
    }
  }
});

// node_modules/@aws-crypto/sha256-js/build/index.js
var require_build2 = __commonJS({
  "node_modules/@aws-crypto/sha256-js/build/index.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var tslib_1 = (init_tslib_es6(), __toCommonJS(tslib_es6_exports));
    tslib_1.__exportStar(require_jsSha256(), exports2);
  }
});

// lib/chatbot-api/functions/outgoing-message-appsync/index.ts
var outgoing_message_appsync_exports = {};
__export(outgoing_message_appsync_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(outgoing_message_appsync_exports);
var import_batch = __toESM(require_lib());
var import_logger = __toESM(require_lib3());

// lib/chatbot-api/functions/outgoing-message-appsync/graphql.ts
var crypto = __toESM(require_build2());
var import_credential_provider_node = require("@aws-sdk/credential-provider-node");
var import_signature_v4 = require("@aws-sdk/signature-v4");
var import_protocol_http = require("@aws-sdk/protocol-http");
var { Sha256 } = crypto;
var AWS_REGION = process.env.AWS_REGION || "eu-west-1";
var endpoint = new URL(process.env.GRAPHQL_ENDPOINT ?? "");
var graphQlQuery = async (query) => {
  const signer = new import_signature_v4.SignatureV4({
    credentials: (0, import_credential_provider_node.defaultProvider)(),
    region: AWS_REGION,
    service: "appsync",
    sha256: Sha256
  });
  const requestToBeSigned = new import_protocol_http.HttpRequest({
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      host: endpoint.host
    },
    hostname: endpoint.host,
    body: JSON.stringify({ query }),
    path: endpoint.pathname
  });
  const signed = await signer.sign(requestToBeSigned);
  const request = new Request(endpoint, signed);
  const response = await fetch(request);
  const body = await response.json();
  return body;
};

// lib/chatbot-api/functions/outgoing-message-appsync/index.ts
var processor = new import_batch.BatchProcessor(import_batch.EventType.SQS);
var logger = new import_logger.Logger();
var recordHandler = async (record) => {
  const payload = record.body;
  if (payload) {
    const item = JSON.parse(payload);
    const req = JSON.parse(item.Message);
    logger.debug("Processed message", req);
    const query = (
      /* GraphQL */
      `
        mutation Mutation {
          publishResponse (data: ${JSON.stringify(item.Message)}, sessionId: "${req.data.sessionId}", userId: "${req.userId}") {
            data
            sessionId
            userId
          }
        }
    `
    );
    await graphQlQuery(query);
  }
};
var handler = async (event, context) => {
  logger.debug("Event", { event });
  event.Records = event.Records.sort((a, b) => {
    try {
      const x = JSON.parse(JSON.parse(a.body).Message).data?.token?.sequenceNumber;
      const y = JSON.parse(JSON.parse(b.body).Message).data?.token?.sequenceNumber;
      return x - y;
    } catch {
      return 0;
    }
  });
  return (0, import_batch.processPartialResponse)(event, recordHandler, processor, {
    context
  });
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
/*! Bundled license information:

tslib/tslib.es6.js:
  (*! *****************************************************************************
  Copyright (c) Microsoft Corporation.
  
  Permission to use, copy, modify, and/or distribute this software for any
  purpose with or without fee is hereby granted.
  
  THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
  REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
  AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
  INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
  LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
  OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
  PERFORMANCE OF THIS SOFTWARE.
  ***************************************************************************** *)
*/
