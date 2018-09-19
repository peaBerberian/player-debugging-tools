(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.PlayerTools = {})));
}(this, (function (exports) { 'use strict';

  /**
   * Spy on a function:
   *   - display logs each time the function is called with its arguments and the
   *     result
   *   - add the possibility to add a debugger statement to have a breakpoint each
   *     time it is called.
   *
   * @param {Object} obj - Object in which the function you want to spy on is in.
   * @param {string} fnName - name of the function in `obj`
   * @param {boolean|undefined} [addDebugger] - If true, a debugger statement is
   * added for each time the function is called.
   * @returns {Function} - This function cancel the spy when called.
   */
  function addSpy(obj, fnName, addDebugger) {
    if (!obj) {
      throw new Error("Invalid object.");
    }
    const oldFn = obj[fnName];
    if (typeof oldFn != "function") {
      throw new Error("No function with that name.");
    }

    obj[fnName] = function (...args) {
      /* eslint-disable no-console */
      console.debug("calling", fnName, "with args", args);
      /* eslint-enable no-console */
      if (addDebugger) {
        /* eslint-disable no-debugger */
        debugger;
        /* eslint-enable no-debugger */
      }

      const res = oldFn.apply(obj, args);

      /* eslint-disable no-console */
      console.debug("returning result of ", fnName, ". Result:", res);
      /* eslint-enable no-console */
      return res;
    };

    return function removeSpy() {
      obj[fnName] = oldFn;
    };
  }

  var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

  function unwrapExports (x) {
  	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
  }

  function createCommonjsModule(fn, module) {
  	return module = { exports: {} }, fn(module, module.exports), module.exports;
  }

  var bundle = createCommonjsModule(function (module, exports) {
  (function (global, factory) {
    factory(exports);
  }(commonjsGlobal, (function (exports) {
    /**
     * Store information about every EME Calls stubbed in this file.
     * @type {Object}
     */
    var EME_CALLS = {};

    function getEMECalls() {
      return EME_CALLS;
    }

    function resetEMECalls() {
      Object.keys(EME_CALLS).forEach(function (key) {
        delete EME_CALLS[key];
      });
    }

    var NativeMediaKeys = window.MediaKeys;
    var NativeMediaKeySession = window.MediaKeySession;
    var NativeMediaKeySystemAccess = window.MediaKeySystemAccess;

    /**
     * Define the logger for the MSE-spy.
     * Allows to re-define a specific logger on runtime / before applying this
     * script.
     * @type {Object}
     */
    var Logger = window.MSESpyLogger || {
      /* eslint-disable no-console */

      /**
       * Triggered each time a property is accessed.
       * @param {string} pathString - human-readable path to the property.
       * @param {*} value - the value it currently has.
       */
      onPropertyAccess: function onPropertyAccess(pathString, value) {
        console.debug(">>> Getting " + pathString + ":", value);
      },


      /**
       * Triggered each time a property is set.
       * @param {string} pathString - human-readable path to the property.
       * @param {*} value - the value it is set to.
       */
      onSettingProperty: function onSettingProperty(pathString, value) {
        console.debug(">> Setting " + pathString + ":", value);
      },


      /**
       * Triggered when some object is instanciated (just before).
       * @param {string} objectName - human-readable name for the concerned object.
       * @param {Array.<*>} args - Arguments given to the constructor
       */
      onObjectInstanciation: function onObjectInstanciation(objectName, args) {
        if (args.length) {
          console.debug(">>> Creating " + objectName + " with arguments:", args);
        } else {
          console.debug(">>> Creating " + objectName);
        }
      },


      /**
       * Triggered when an Object instanciation failed.
       * @param {string} objectName - human-readable name for the concerned object.
       * @param {Error} error - Error thrown by the constructor
       */
      onObjectInstanciationError: function onObjectInstanciationError(objectName, error) {
        console.error(">> " + objectName + " creation failed:", error);
      },


      /**
       * Triggered when an Object instanciation succeeded.
       * @param {string} objectName - human-readable name for the concerned object.
       * @param {*} value - The corresponding object instanciated.
       */
      onObjectInstanciationSuccess: function onObjectInstanciationSuccess(objectName, value) {
        console.debug(">>> " + objectName + " created:", value);
      },


      /**
       * Triggered when some method/function is called.
       * @param {string} pathName - human-readable path for the concerned function.
       * @param {Array.<*>} args - Arguments given to this function.
       */
      onFunctionCall: function onFunctionCall(pathName, args) {
        if (args.length) {
          console.debug(">>> " + pathName + " called with arguments:", args);
        } else {
          console.debug(">>> " + pathName + " called");
        }
      },


      /**
       * Triggered when a function call fails.
       * @param {string} pathName - human-readable path for the concerned function.
       * @param {Error} error - Error thrown by the call
       */
      onFunctionCallError: function onFunctionCallError(pathName, error) {
        console.error(">> " + pathName + " failed:", error);
      },


      /**
       * Triggered when a function call succeeded.
       * @param {string} pathName - human-readable path for the concerned function.
       * @param {*} value - The result of the function
       */
      onFunctionCallSuccess: function onFunctionCallSuccess(pathName, value) {
        console.info(">>> " + pathName + " succeeded:", value);
      },


      /**
       * Triggered when a function returned a Promise and that promise resolved.
       * @param {string} pathName - human-readable path for the concerned function.
       * @param {*} value - The value when the function resolved.
       */
      onFunctionPromiseResolve: function onFunctionPromiseResolve(pathName, value) {
        console.info(">>> " + pathName + " resolved:", value);
      },


      /**
       * Triggered when a function returned a Promise and that promise rejected.
       * @param {string} pathName - human-readable path for the concerned function.
       * @param {*} value - The error when the function's promise rejected.
       */
      onFunctionPromiseReject: function onFunctionPromiseReject(pathName, value) {
        console.error(">>> " + pathName + " rejected:", value);
      }
    };

    var id = 0;

    /**
     * Generate a new number each time it is called.
     * /!\ Never check for an upper-bound. Please do not use if you can reach
     * `Number.MAX_VALUE`
     * @returns {number}
     */
    function generateId() {
      return id++;
    }

    /**
     * Log multiple method calls for an object.
     * Also populates an object with multiple data at the time of the call.
     *
     * @param {Object} baseObject - Object in which the method/function is.
     * For example to spy on the Date method `toLocaleDateString`, you will have to
     * set here `Date.prototype`.
     * @param {Array.<string>} methodNames - Every methods you want to spy on
     * @param {string} humanReadablePath - Path to the method. Used for logging
     * purposes.
     * For example `"Date.prototype"`, for spies of Date's methods.
     * @param {Object} logObject - Object where infos about the method calls will be
     * added.
     * The methods' name will be the key of the object.
     *
     * The values will be an array of object with the following properties:
     *
     *   - self {Object}: Reference to the baseObject argument.
     *
     *   - id {number}: a uniquely generated ascending ID for any stubbed
     *    property/methods with this library.
     *
     *   - date {number}: Timestamp at the time of the call.
     *
     *   - args {Array}: Array of arguments given to the function
     *
     *   - response {*}: Response of the function.
     *     The property is not defined if the function did not respond yet or was on
     *     error.
     *
     *   - responseDate {number}: Timestamp at the time of the response.
     *     The property is not defined if the function did not respond yet or was on
     *     error.
     *
     *   - error {*}: Error thrown by the function, if one.
     *     The property is not defined if the function did not throw.
     *
     *   - errorDate {number} Timestamp at the time of the error.
     *     The property is not defined if the function did not throw.
     *
     *   - responseResolved {*}: When the returned value (the response) is a promise
     *     and that promise resolved, this property contains the value emitted by
     *     the resolve. Else, that property is not set.
     *
     *   - responseResolvedDate {number}: When the returned value (the response) is
     *     a promise and that promise resolved, this property contains the date at
     *     which the promise resolved. Else, that property is not set.
     *
     *   - responseRejected {*}: When the returned value (the response) is a promise
     *     and that promise rejected, this property contains the error emitted by
     *     the reject. Else, that property is not set.
     *
     *   - responseRejectedDate {number}: When the returned value (the response) is
     *     a promise and that promise rejected, this property contains the date at
     *     which the promise rejected. Else, that property is not set.
     *
     * @returns {Function} - function which deactivates the spy when called.
     */
    function spyOnMethods(baseObject, methodNames, humanReadablePath, logObject) {
      var baseObjectMethods = methodNames.reduce(function (acc, methodName) {
        acc[methodName] = baseObject[methodName];
        return acc;
      }, {});

      var _loop = function _loop(i) {
        var methodName = methodNames[i];
        var completePath = humanReadablePath + "." + methodName;
        var oldMethod = baseObject[methodName];

        if (!oldMethod) {
          throw new Error("No method in " + completePath);
        }

        baseObject[methodName] = function () {
          for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }

          Logger.onFunctionCall(completePath, args);
          var currentLogObject = {
            self: baseObject,
            id: generateId(),
            date: Date.now(),
            args: args
          };

          if (!logObject[methodName]) {
            logObject[methodName] = [];
          }
          logObject[methodName].push(currentLogObject);

          var res = void 0;
          try {
            res = oldMethod.apply(this, args);
          } catch (e) {
            Logger.onFunctionCallError(completePath, e);
            currentLogObject.error = e;
            currentLogObject.errorDate = Date.now();
            throw e;
          }
          Logger.onFunctionCallSuccess(completePath, res);
          currentLogObject.response = res;
          currentLogObject.responseDate = Date.now();

          if (res instanceof Promise) {
            res.then(
            // on success
            function (value) {
              Logger.onFunctionPromiseResolve(completePath, value);
              currentLogObject.responseResolved = value;
              currentLogObject.responseResolvedDate = Date.now();
            },

            // on error
            function (err) {
              Logger.onFunctionPromiseReject(completePath, err);
              currentLogObject.responseRejected = err;
              currentLogObject.responseRejectedDate = Date.now();
            });
          }
          return res;
        };
      };

      for (var i = 0; i < methodNames.length; i++) {
        _loop(i);
      }

      return function stopSpyingOnMethods() {
        for (var i = 0; i < methodNames.length; i++) {
          var _methodName = methodNames[i];
          baseObject[_methodName] = baseObjectMethods[_methodName];
        }
      };
    }

    /**
     * Spy access and updates of an Object's read-only properties:
     *   - log every access/updates
     *   - add entries in a logging object
     *
     * @param {Object} baseObject - Object in which the property is.
     * For example to spy on the HTMLMediaElement property `currentTime`, you will
     * have to set here `HTMLMediaElement.prototype`.
     * @param {Object} baseDescriptors - Descriptors for the spied properties.
     * The keys are the properties' names, the values are the properties'
     * descriptors.
     * @param {Array.<string>} propertyNames - Every properties you want to spy on.
     * @param {string} humanReadablePath - Path to the property. Used for logging
     * purposes.
     * For example `"HTMLMediaElement.prototype"`, for spies of HTMLMediaElement's
     * class properties.
     * @param {Object} logObject - Object where infos about the properties access
     * will be added.
     * The methods' name will be the key of the object.
     *
     * The values will be an object with a single key ``get``, corresponding to
     * property accesses
     *
     * This key will then have as value an array of object.
     *
     *  - self {Object}: Reference to the baseObject argument.
     *
     *  - id {number}: a uniquely generated ID for any stubbed property/methods with
     *    this library.
     *
     *  - date {number}: Timestamp at the time of the property access.
     *
     *  - value {*}: value of the property at the time of access.
     *
     * @returns {Function} - function which deactivates the spy when called.
     */
    function spyOnReadOnlyProperties(baseObject, baseDescriptors, propertyNames, humanReadablePath, logObject) {
      var _loop = function _loop(i) {
        var propertyName = propertyNames[i];
        var baseDescriptor = baseDescriptors[propertyName];
        var completePath = humanReadablePath + "." + propertyName;

        if (!baseDescriptor) {
          throw new Error("No descriptor for property " + completePath);
        }

        Object.defineProperty(baseObject, propertyName, {
          get: function get() {
            var value = baseDescriptor.get.bind(this)();
            Logger.onPropertyAccess(completePath, value);
            var currentLogObject = {
              self: this,
              id: generateId(),
              date: Date.now(),
              value: value
            };
            if (!logObject[propertyName]) {
              logObject[propertyName] = {
                get: []
              };
            }
            logObject[propertyName].get.push(currentLogObject);
            return value;
          }
        });
      };

      for (var i = 0; i < propertyNames.length; i++) {
        _loop(i);
      }

      return function stopSpyingOnReadOnlyProperties() {
        Object.defineProperties(baseObject, propertyNames.reduce(function (acc, propertyName) {
          acc[propertyName] = baseDescriptors[propertyName];
          return acc;
        }, {}));
      };
    }

    /**
     * Spy access and updates of an Object's read & write properties:
     *   - log every access/updates
     *   - add entries in a logging object
     *
     * @param {Object} baseObject - Object in which the property is.
     * For example to spy on the HTMLMediaElement property `currentTime`, you will
     * have to set here `HTMLMediaElement.prototype`.
     * @param {Object} baseDescriptors - Descriptors for the spied properties.
     * The keys are the properties' names, the values are the properties'
     * descriptors.
     * @param {Array.<string>} propertyNames - Every properties you want to spy on.
     * @param {string} humanReadablePath - Path to the property. Used for logging
     * purposes.
     * For example `"HTMLMediaElement.prototype"`, for spies of HTMLMediaElement's
     * class properties.
     * @param {Object} logObject - Object where infos about the properties access
     * will be added.
     * The methods' name will be the key of the object.
     *
     * The values will be an object with two keys ``get`` and ``set``, respectively
     * for property accesses and property updates.
     *
     * Each one of those properties will then have as values an array of object.
     * Those objects are under the following form:
     *
     *  1. for `get` (property access):
     *
     *   - self {Object}: Reference to the baseObject argument.
     *
     *  - id {number}: a uniquely generated ascending ID for any stubbed
     *    property/methods with this library.
     *
     *   - date {number}: Timestamp at the time of the property access.
     *
     *   - value {*}: value of the property at the time of access.
     *
     *
     *  2. for `set` (property updates):
     *
     *   - self {Object}: Reference to the baseObject argument.
     *
     *  - id {number}: a uniquely generated ascending ID for any stubbed
     *    property/methods with this library.
     *
     *   - date {number}: Timestamp at the time of the property update.
     *
     *   - value {*}: new value the property is set to
     *
     * @returns {Function} - function which deactivates the spy when called.
     */
    function spyOnProperties(baseObject, baseDescriptors, propertyNames, humanReadablePath, logObject) {
      var _loop = function _loop(i) {
        var propertyName = propertyNames[i];
        var baseDescriptor = baseDescriptors[propertyName];
        var completePath = humanReadablePath + "." + propertyName;

        if (!baseDescriptor) {
          throw new Error("No descriptor for property " + completePath);
        }

        Object.defineProperty(baseObject, propertyName, {
          get: function get() {
            var value = baseDescriptor.get.bind(this)();
            Logger.onPropertyAccess(completePath, value);
            var currentLogObject = {
              self: this,
              id: generateId(),
              date: Date.now(),
              value: value
            };

            if (!logObject[propertyName]) {
              logObject[propertyName] = {
                set: [],
                get: []
              };
            }
            logObject[propertyName].get.push(currentLogObject);

            return value;
          },
          set: function set(value) {
            Logger.onSettingProperty(completePath, value);
            var currentLogObject = {
              self: this,
              id: generateId(),
              date: Date.now(),
              value: value
            };

            if (!logObject[propertyName]) {
              logObject[propertyName] = {
                set: [],
                get: []
              };
            }
            logObject[propertyName].set.push(currentLogObject);
            baseDescriptor.set.bind(this)(value);
          }
        });
      };

      for (var i = 0; i < propertyNames.length; i++) {
        _loop(i);
      }

      return function stopSpyingOnProperties() {
        Object.defineProperties(baseObject, propertyNames.reduce(function (acc, propertyName) {
          acc[propertyName] = baseDescriptors[propertyName];
          return acc;
        }, {}));
      };
    }

    function spyOnWholeObject(BaseObject, objectName, readOnlyPropertyNames, propertyNames, staticMethodNames, methodNames, loggingObject) {
      if (BaseObject == null || !BaseObject.prototype) {
        throw new Error("Invalid object");
      }

      if (loggingObject[objectName] == null) {
        loggingObject[objectName] = {
          new: [],
          methods: {},
          staticMethods: {},
          properties: {},
          eventListeners: {} // TODO
        };
      }

      function StubbedObject() {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        Logger.onObjectInstanciation(objectName, args);
        var now = Date.now();
        var spyObj = {
          date: now,
          args: args
        };
        loggingObject[objectName].new.push(spyObj);
        var baseObject = void 0;
        try {
          baseObject = new (Function.prototype.bind.apply(BaseObject, [null].concat(args)))();
        } catch (e) {
          Logger.onObjectInstanciationError(objectName, e);
          spyObj.error = e;
          spyObj.errorDate = Date.now();
          throw e;
        }
        Logger.onObjectInstanciationSuccess(objectName, baseObject);
        spyObj.response = baseObject;
        spyObj.responseDate = Date.now();
        return baseObject;
      }

      var unspyStaticMethods = spyOnMethods(BaseObject, staticMethodNames, objectName, loggingObject[objectName].staticMethods);
      staticMethodNames.forEach(function (method) {
        StubbedObject[method] = BaseObject[method].bind(BaseObject);
      });

      var BaseObjectProtoDescriptors = Object.getOwnPropertyDescriptors(BaseObject.prototype);

      var unspyReadOnlyProps = spyOnReadOnlyProperties(BaseObject.prototype, BaseObjectProtoDescriptors, readOnlyPropertyNames, objectName + ".prototype", loggingObject[objectName].properties);
      var unspyProps = spyOnProperties(BaseObject.prototype, BaseObjectProtoDescriptors, propertyNames, objectName + ".prototype", loggingObject[objectName].properties);
      var unspyMethods = spyOnMethods(BaseObject.prototype, methodNames, objectName + ".prototype", loggingObject[objectName].methods);
      window[objectName] = StubbedObject;

      return function stopSpying() {
        unspyReadOnlyProps();
        unspyProps();
        unspyStaticMethods();
        unspyMethods();
        window[objectName] = BaseObject;
      };
    }

    function spyOnMediaKeys() {
      return spyOnWholeObject(
      // Object to spy on
      NativeMediaKeys,

      // name in window
      "MediaKeys",

      // read-only properties
      [],

      // regular properties
      [],

      // static methods
      [],

      // methods
      ["createSession", "setServerCertificate"],

      // global logging object
      EME_CALLS);
    }

    function spyOnMediaKeySession() {
      return spyOnWholeObject(
      // Object to spy on
      NativeMediaKeySession,

      // name in window
      "MediaKeySession",

      // read-only properties
      ["sessionId", "expiration", "closed", "keyStatuses"],

      // regular properties
      [],

      // static methods
      [],

      // methods
      ["generateRequest", "load", "update", "close", "remove"],

      // global logging object
      EME_CALLS);
    }

    function spyOnMediaKeySystemAccess() {
      return spyOnWholeObject(
      // Object to spy on
      NativeMediaKeySystemAccess,

      // name in window
      "MediaKeySystemAccess",

      // read-only properties
      ["keySystem"],

      // regular properties
      [],

      // static methods
      [],

      // methods
      ["getConfiguration", "createMediaKeys"],

      // global logging object
      EME_CALLS);
    }

    function spyOnRequestMediaKeySystemAccess() {
      return spyOnMethods(navigator, ["requestMediaKeySystemAccess"], "navigator", EME_CALLS);
    }

    function spyOnSetMediaKeys() {
      return spyOnMethods(HTMLMediaElement.prototype, ["setMediaKeys"], "HTMLMediaElement.prototype", EME_CALLS);
    }

    var resetSpies = null;

    /**
     * Start/restart spying on EME API calls.
     */
    function start() {
      if (resetSpies != null) {
        resetSpies();
      }

      var resetSpyFunctions = [spyOnMediaKeys(), spyOnMediaKeySession(), spyOnMediaKeySystemAccess(), spyOnRequestMediaKeySystemAccess(), spyOnSetMediaKeys()].filter(function (cb) {
        return cb;
      });

      resetSpies = function resetEverySpies() {
        resetSpyFunctions.forEach(function (fn) {
          fn && fn();
        });
        resetSpyFunctions.length = 0;
        resetSpies = null;
      };
    }

    /**
     * Stop spying on EME API calls.
     */
    function stop() {
      if (resetSpies != null) {
        resetSpies();
      }
    }

    exports.getEMECalls = getEMECalls;
    exports.resetEMECalls = resetEMECalls;
    exports.Logger = Logger;
    exports.start = start;
    exports.stop = stop;

    Object.defineProperty(exports, '__esModule', { value: true });

  })));
  });

  var EMESpy = unwrapExports(bundle);

  var bundle$1 = createCommonjsModule(function (module, exports) {
  (function (global, factory) {
    factory(exports);
  }(commonjsGlobal, (function (exports) {
    /**
     * Store information about every MSE Calls stubbed in this file.
     * @type {Object}
     */
    var MSE_CALLS = {};

    function getMSECalls() {
      return MSE_CALLS;
    }

    function resetMSECalls() {
      Object.keys(MSE_CALLS).forEach(function (key) {
        delete MSE_CALLS[key];
      });
    }
    var NativeMediaSource = window.MediaSource;
    var NativeSourceBuffer = window.SourceBuffer;

    /**
     * Define the logger for the MSE-spy.
     * Allows to re-define a specific logger on runtime / before applying this
     * script.
     * @type {Object}
     */
    var Logger = window.MSESpyLogger || {
      /* eslint-disable no-console */

      /**
       * Triggered each time a property is accessed.
       * @param {string} pathString - human-readable path to the property.
       * @param {*} value - the value it currently has.
       */
      onPropertyAccess: function onPropertyAccess(pathString, value) {
        console.debug(">>> Getting " + pathString + ":", value);
      },


      /**
       * Triggered each time a property is set.
       * @param {string} pathString - human-readable path to the property.
       * @param {*} value - the value it is set to.
       */
      onSettingProperty: function onSettingProperty(pathString, value) {
        console.debug(">> Setting " + pathString + ":", value);
      },


      /**
       * Triggered when some object is instanciated (just before).
       * @param {string} objectName - human-readable name for the concerned object.
       * @param {Array.<*>} args - Arguments given to the constructor
       */
      onObjectInstanciation: function onObjectInstanciation(objectName, args) {
        if (args.length) {
          console.debug(">>> Creating " + objectName + " with arguments:", args);
        } else {
          console.debug(">>> Creating " + objectName);
        }
      },


      /**
       * Triggered when an Object instanciation failed.
       * @param {string} objectName - human-readable name for the concerned object.
       * @param {Error} error - Error thrown by the constructor
       */
      onObjectInstanciationError: function onObjectInstanciationError(objectName, error) {
        console.error(">> " + objectName + " creation failed:", error);
      },


      /**
       * Triggered when an Object instanciation succeeded.
       * @param {string} objectName - human-readable name for the concerned object.
       * @param {*} value - The corresponding object instanciated.
       */
      onObjectInstanciationSuccess: function onObjectInstanciationSuccess(objectName, value) {
        console.debug(">>> " + objectName + " created:", value);
      },


      /**
       * Triggered when some method/function is called.
       * @param {string} pathName - human-readable path for the concerned function.
       * @param {Array.<*>} args - Arguments given to this function.
       */
      onFunctionCall: function onFunctionCall(pathName, args) {
        if (args.length) {
          console.debug(">>> " + pathName + " called with arguments:", args);
        } else {
          console.debug(">>> " + pathName + " called");
        }
      },


      /**
       * Triggered when a function call fails.
       * @param {string} pathName - human-readable path for the concerned function.
       * @param {Error} error - Error thrown by the call
       */
      onFunctionCallError: function onFunctionCallError(pathName, error) {
        console.error(">> " + pathName + " failed:", error);
      },


      /**
       * Triggered when a function call succeeded.
       * @param {string} pathName - human-readable path for the concerned function.
       * @param {*} value - The result of the function
       */
      onFunctionCallSuccess: function onFunctionCallSuccess(pathName, value) {
        console.info(">>> " + pathName + " succeeded:", value);
      },


      /**
       * Triggered when a function returned a Promise and that promise resolved.
       * @param {string} pathName - human-readable path for the concerned function.
       * @param {*} value - The value when the function resolved.
       */
      onFunctionPromiseResolve: function onFunctionPromiseResolve(pathName, value) {
        console.info(">>> " + pathName + " resolved:", value);
      },


      /**
       * Triggered when a function returned a Promise and that promise rejected.
       * @param {string} pathName - human-readable path for the concerned function.
       * @param {*} value - The error when the function's promise rejected.
       */
      onFunctionPromiseReject: function onFunctionPromiseReject(pathName, value) {
        console.error(">>> " + pathName + " rejected:", value);
      }
    };

    var id = 0;

    /**
     * Generate a new number each time it is called.
     * /!\ Never check for an upper-bound. Please do not use if you can reach
     * `Number.MAX_VALUE`
     * @returns {number}
     */
    function generateId() {
      return id++;
    }

    /**
     * Log multiple method calls for an object.
     * Also populates an object with multiple data at the time of the call.
     *
     * @param {Object} baseObject - Object in which the method/function is.
     * For example to spy on the Date method `toLocaleDateString`, you will have to
     * set here `Date.prototype`.
     * @param {Array.<string>} methodNames - Every methods you want to spy on
     * @param {string} humanReadablePath - Path to the method. Used for logging
     * purposes.
     * For example `"Date.prototype"`, for spies of Date's methods.
     * @param {Object} logObject - Object where infos about the method calls will be
     * added.
     * The methods' name will be the key of the object.
     *
     * The values will be an array of object with the following properties:
     *
     *   - self {Object}: Reference to the baseObject argument.
     *
     *   - id {number}: a uniquely generated ascending ID for any stubbed
     *    property/methods with this library.
     *
     *   - date {number}: Timestamp at the time of the call.
     *
     *   - args {Array}: Array of arguments given to the function
     *
     *   - response {*}: Response of the function.
     *     The property is not defined if the function did not respond yet or was on
     *     error.
     *
     *   - responseDate {number}: Timestamp at the time of the response.
     *     The property is not defined if the function did not respond yet or was on
     *     error.
     *
     *   - error {*}: Error thrown by the function, if one.
     *     The property is not defined if the function did not throw.
     *
     *   - errorDate {number} Timestamp at the time of the error.
     *     The property is not defined if the function did not throw.
     *
     *   - responseResolved {*}: When the returned value (the response) is a promise
     *     and that promise resolved, this property contains the value emitted by
     *     the resolve. Else, that property is not set.
     *
     *   - responseResolvedDate {number}: When the returned value (the response) is
     *     a promise and that promise resolved, this property contains the date at
     *     which the promise resolved. Else, that property is not set.
     *
     *   - responseRejected {*}: When the returned value (the response) is a promise
     *     and that promise rejected, this property contains the error emitted by
     *     the reject. Else, that property is not set.
     *
     *   - responseRejectedDate {number}: When the returned value (the response) is
     *     a promise and that promise rejected, this property contains the date at
     *     which the promise rejected. Else, that property is not set.
     *
     * @returns {Function} - function which deactivates the spy when called.
     */
    function spyOnMethods(baseObject, methodNames, humanReadablePath, logObject) {
      var baseObjectMethods = methodNames.reduce(function (acc, methodName) {
        acc[methodName] = baseObject[methodName];
        return acc;
      }, {});

      var _loop = function _loop(i) {
        var methodName = methodNames[i];
        var completePath = humanReadablePath + "." + methodName;
        var oldMethod = baseObject[methodName];

        if (!oldMethod) {
          throw new Error("No method in " + completePath);
        }

        baseObject[methodName] = function () {
          for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }

          Logger.onFunctionCall(completePath, args);
          var currentLogObject = {
            self: baseObject,
            id: generateId(),
            date: Date.now(),
            args: args
          };

          if (!logObject[methodName]) {
            logObject[methodName] = [];
          }
          logObject[methodName].push(currentLogObject);

          var res = void 0;
          try {
            res = oldMethod.apply(this, args);
          } catch (e) {
            Logger.onFunctionCallError(completePath, e);
            currentLogObject.error = e;
            currentLogObject.errorDate = Date.now();
            throw e;
          }
          Logger.onFunctionCallSuccess(completePath, res);
          currentLogObject.response = res;
          currentLogObject.responseDate = Date.now();

          if (res instanceof Promise) {
            res.then(
            // on success
            function (value) {
              Logger.onFunctionPromiseResolve(completePath, value);
              currentLogObject.responseResolved = value;
              currentLogObject.responseResolvedDate = Date.now();
            },

            // on error
            function (err) {
              Logger.onFunctionPromiseReject(completePath, err);
              currentLogObject.responseRejected = err;
              currentLogObject.responseRejectedDate = Date.now();
            });
          }
          return res;
        };
      };

      for (var i = 0; i < methodNames.length; i++) {
        _loop(i);
      }

      return function stopSpyingOnMethods() {
        for (var i = 0; i < methodNames.length; i++) {
          var _methodName = methodNames[i];
          baseObject[_methodName] = baseObjectMethods[_methodName];
        }
      };
    }

    /**
     * Spy access and updates of an Object's read-only properties:
     *   - log every access/updates
     *   - add entries in a logging object
     *
     * @param {Object} baseObject - Object in which the property is.
     * For example to spy on the HTMLMediaElement property `currentTime`, you will
     * have to set here `HTMLMediaElement.prototype`.
     * @param {Object} baseDescriptors - Descriptors for the spied properties.
     * The keys are the properties' names, the values are the properties'
     * descriptors.
     * @param {Array.<string>} propertyNames - Every properties you want to spy on.
     * @param {string} humanReadablePath - Path to the property. Used for logging
     * purposes.
     * For example `"HTMLMediaElement.prototype"`, for spies of HTMLMediaElement's
     * class properties.
     * @param {Object} logObject - Object where infos about the properties access
     * will be added.
     * The methods' name will be the key of the object.
     *
     * The values will be an object with a single key ``get``, corresponding to
     * property accesses
     *
     * This key will then have as value an array of object.
     *
     *  - self {Object}: Reference to the baseObject argument.
     *
     *  - id {number}: a uniquely generated ID for any stubbed property/methods with
     *    this library.
     *
     *  - date {number}: Timestamp at the time of the property access.
     *
     *  - value {*}: value of the property at the time of access.
     *
     * @returns {Function} - function which deactivates the spy when called.
     */
    function spyOnReadOnlyProperties(baseObject, baseDescriptors, propertyNames, humanReadablePath, logObject) {
      var _loop = function _loop(i) {
        var propertyName = propertyNames[i];
        var baseDescriptor = baseDescriptors[propertyName];
        var completePath = humanReadablePath + "." + propertyName;

        if (!baseDescriptor) {
          throw new Error("No descriptor for property " + completePath);
        }

        Object.defineProperty(baseObject, propertyName, {
          get: function get() {
            var value = baseDescriptor.get.bind(this)();
            Logger.onPropertyAccess(completePath, value);
            var currentLogObject = {
              self: this,
              id: generateId(),
              date: Date.now(),
              value: value
            };
            if (!logObject[propertyName]) {
              logObject[propertyName] = {
                get: []
              };
            }
            logObject[propertyName].get.push(currentLogObject);
            return value;
          }
        });
      };

      for (var i = 0; i < propertyNames.length; i++) {
        _loop(i);
      }

      return function stopSpyingOnReadOnlyProperties() {
        Object.defineProperties(baseObject, propertyNames.reduce(function (acc, propertyName) {
          acc[propertyName] = baseDescriptors[propertyName];
          return acc;
        }, {}));
      };
    }

    /**
     * Spy access and updates of an Object's read & write properties:
     *   - log every access/updates
     *   - add entries in a logging object
     *
     * @param {Object} baseObject - Object in which the property is.
     * For example to spy on the HTMLMediaElement property `currentTime`, you will
     * have to set here `HTMLMediaElement.prototype`.
     * @param {Object} baseDescriptors - Descriptors for the spied properties.
     * The keys are the properties' names, the values are the properties'
     * descriptors.
     * @param {Array.<string>} propertyNames - Every properties you want to spy on.
     * @param {string} humanReadablePath - Path to the property. Used for logging
     * purposes.
     * For example `"HTMLMediaElement.prototype"`, for spies of HTMLMediaElement's
     * class properties.
     * @param {Object} logObject - Object where infos about the properties access
     * will be added.
     * The methods' name will be the key of the object.
     *
     * The values will be an object with two keys ``get`` and ``set``, respectively
     * for property accesses and property updates.
     *
     * Each one of those properties will then have as values an array of object.
     * Those objects are under the following form:
     *
     *  1. for `get` (property access):
     *
     *   - self {Object}: Reference to the baseObject argument.
     *
     *  - id {number}: a uniquely generated ascending ID for any stubbed
     *    property/methods with this library.
     *
     *   - date {number}: Timestamp at the time of the property access.
     *
     *   - value {*}: value of the property at the time of access.
     *
     *
     *  2. for `set` (property updates):
     *
     *   - self {Object}: Reference to the baseObject argument.
     *
     *  - id {number}: a uniquely generated ascending ID for any stubbed
     *    property/methods with this library.
     *
     *   - date {number}: Timestamp at the time of the property update.
     *
     *   - value {*}: new value the property is set to
     *
     * @returns {Function} - function which deactivates the spy when called.
     */
    function spyOnProperties(baseObject, baseDescriptors, propertyNames, humanReadablePath, logObject) {
      var _loop = function _loop(i) {
        var propertyName = propertyNames[i];
        var baseDescriptor = baseDescriptors[propertyName];
        var completePath = humanReadablePath + "." + propertyName;

        if (!baseDescriptor) {
          throw new Error("No descriptor for property " + completePath);
        }

        Object.defineProperty(baseObject, propertyName, {
          get: function get() {
            var value = baseDescriptor.get.bind(this)();
            Logger.onPropertyAccess(completePath, value);
            var currentLogObject = {
              self: this,
              id: generateId(),
              date: Date.now(),
              value: value
            };

            if (!logObject[propertyName]) {
              logObject[propertyName] = {
                set: [],
                get: []
              };
            }
            logObject[propertyName].get.push(currentLogObject);

            return value;
          },
          set: function set(value) {
            Logger.onSettingProperty(completePath, value);
            var currentLogObject = {
              self: this,
              id: generateId(),
              date: Date.now(),
              value: value
            };

            if (!logObject[propertyName]) {
              logObject[propertyName] = {
                set: [],
                get: []
              };
            }
            logObject[propertyName].set.push(currentLogObject);
            baseDescriptor.set.bind(this)(value);
          }
        });
      };

      for (var i = 0; i < propertyNames.length; i++) {
        _loop(i);
      }

      return function stopSpyingOnProperties() {
        Object.defineProperties(baseObject, propertyNames.reduce(function (acc, propertyName) {
          acc[propertyName] = baseDescriptors[propertyName];
          return acc;
        }, {}));
      };
    }

    var stubbedObjects = [];
    function spyOnWholeObject(BaseObject, objectName, readOnlyPropertyNames, propertyNames, staticMethodNames, methodNames, loggingObject) {
      if (BaseObject == null || !BaseObject.prototype) {
        throw new Error("Invalid object");
      }
      if (stubbedObjects.includes(BaseObject)) {
        return;
      }

      if (loggingObject[objectName] == null) {
        loggingObject[objectName] = {
          new: [],
          methods: {},
          staticMethods: {},
          properties: {},
          eventListeners: {} // TODO
        };
      }

      function StubbedObject() {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        Logger.onObjectInstanciation(objectName, args);
        var now = Date.now();
        var spyObj = {
          date: now,
          args: args
        };
        loggingObject[objectName].new.push(spyObj);
        var baseObject = void 0;
        try {
          baseObject = new (Function.prototype.bind.apply(BaseObject, [null].concat(args)))();
        } catch (e) {
          Logger.onObjectInstanciationError(objectName, e);
          spyObj.error = e;
          spyObj.errorDate = Date.now();
          throw e;
        }
        Logger.onObjectInstanciationSuccess(objectName, baseObject);
        spyObj.response = baseObject;
        spyObj.responseDate = Date.now();
        return baseObject;
      }

      var unspyStaticMethods = spyOnMethods(BaseObject, staticMethodNames, objectName, loggingObject[objectName].staticMethods);
      staticMethodNames.forEach(function (method) {
        StubbedObject[method] = BaseObject[method].bind(BaseObject);
      });

      var BaseObjectProtoDescriptors = Object.getOwnPropertyDescriptors(BaseObject.prototype);

      var unspyReadOnlyProps = spyOnReadOnlyProperties(BaseObject.prototype, BaseObjectProtoDescriptors, readOnlyPropertyNames, objectName + ".prototype", loggingObject[objectName].properties);
      var unspyProps = spyOnProperties(BaseObject.prototype, BaseObjectProtoDescriptors, propertyNames, objectName + ".prototype", loggingObject[objectName].properties);
      var unspyMethods = spyOnMethods(BaseObject.prototype, methodNames, objectName + ".prototype", loggingObject[objectName].methods);
      window[objectName] = StubbedObject;
      stubbedObjects.push(BaseObject);

      return function stopSpying() {
        unspyReadOnlyProps();
        unspyProps();
        unspyStaticMethods();
        unspyMethods();
        window[objectName] = BaseObject;
      };
    }

    function spyOnMediaSource() {
      return spyOnWholeObject(
      // Object to spy on
      NativeMediaSource,

      // name in window
      "MediaSource",

      // read-only properties
      ["sourceBuffers", "activeSourceBuffers", "readyState"],

      // regular properties
      ["duration", "onsourceopen", "onsourceended", "onsourceclose"],

      // static methods
      ["isTypeSupported"],

      // methods
      ["addEventListener", "removeEventListener", "dispatchEvent", "addSourceBuffer", "removeSourceBuffer", "endOfStream", "setLiveSeekableRange", "clearLiveSeekableRange"],

      // global logging object
      MSE_CALLS);
    }

    function spyOnMediaSource$1() {
      return spyOnWholeObject(
      // Object to spy on
      NativeSourceBuffer,

      // name in window
      "SourceBuffer",

      // read-only properties
      ["updating", "buffered"],

      // regular properties
      ["mode", "timestampOffset", "appendWindowStart", "appendWindowEnd", "onupdate", "onupdatestart", "onupdateend", "onerror", "onabort"],

      // static methods
      [],

      // methods
      ["addEventListener", "removeEventListener", "dispatchEvent", "appendBuffer", "abort", "remove"],

      // global logging object
      MSE_CALLS);
    }

    var resetSpies = null;

    /**
     * Start/restart spying on MSE API calls.
     */
    function start() {
      if (resetSpies) {
        resetSpies();
      }

      var resetSpyFunctions = [];
      var resetMediaSource = spyOnMediaSource();
      if (resetMediaSource) {
        resetSpyFunctions.push(resetMediaSource);
      }

      var resetSourceBuffer = spyOnMediaSource$1();
      if (resetSourceBuffer) {
        resetSpyFunctions.push(resetSourceBuffer);
      }

      resetSpies = function resetEverySpies() {
        resetSpyFunctions.forEach(function (fn) {
          fn && fn();
        });
        resetSpyFunctions.length = 0;
        resetSpies = null;
      };
    }

    /**
     * Stop spying on MSE API calls.
     */
    function stop() {
      if (resetSpies) {
        resetSpies();
      }
    }

    exports.getMSECalls = getMSECalls;
    exports.resetMSECalls = resetMSECalls;
    exports.Logger = Logger;
    exports.start = start;
    exports.stop = stop;

    Object.defineProperty(exports, '__esModule', { value: true });

  })));
  });

  var MSESpy = unwrapExports(bundle$1);

  var bundle$2 = createCommonjsModule(function (module, exports) {
  (function (global, factory) {
    module.exports = factory();
  }(commonjsGlobal, (function () {
    /**
     * Translate groups of 2 big-endian bytes to Integer (from 0 up to 65535).
     * @param {TypedArray} bytes
     * @param {Number} off - The offset (from the start of the given array)
     * @returns {Number}
     */
    function be2toi(bytes, off) {
      return (bytes[0 + off] << 8) + bytes[1 + off];
    }

    /**
     * Translate groups of 3 big-endian bytes to Integer.
     * @param {TypedArray} bytes
     * @param {Number} off - The offset (from the start of the given array)
     * @returns {Number}
     */
    function be3toi(bytes, off) {
      return bytes[0 + off] * 0x0010000 + bytes[1 + off] * 0x0000100 + bytes[2 + off];
    }

    /**
     * Translate groups of 4 big-endian bytes to Integer.
     * @param {TypedArray} bytes
     * @param {Number} off - The offset (from the start of the given array)
     * @returns {Number}
     */
    function be4toi(bytes, off) {
      return bytes[0 + off] * 0x1000000 + bytes[1 + off] * 0x0010000 + bytes[2 + off] * 0x0000100 + bytes[3 + off];
    }

    /**
     * Translate groups of 4 big-endian bytes to Integer.
     * @param {TypedArray} bytes
     * @param {Number} off - The offset (from the start of the given array)
     * @returns {Number}
     */
    function be5toi(bytes, off) {
      return bytes[0 + off] * 0x100000000 + bytes[1 + off] * 0x001000000 + bytes[2 + off] * 0x000010000 + bytes[3 + off] * 0x000000100 + bytes[4 + off];
    }

    /**
     * Translate groups of 8 big-endian bytes to Integer.
     * @param {TypedArray} bytes
     * @param {Number} off - The offset (from the start of the given array)
     * @returns {Number}
     */
    function be8toi(bytes, off) {
      return (bytes[0 + off] * 0x1000000 + bytes[1 + off] * 0x0010000 + bytes[2 + off] * 0x0000100 + bytes[3 + off]) * 0x100000000 + bytes[4 + off] * 0x1000000 + bytes[5 + off] * 0x0010000 + bytes[6 + off] * 0x0000100 + bytes[7 + off];
    }

    function bytesToHex(uint8arr, off, nbBytes) {
      if (!uint8arr) {
        return "";
      }

      var arr = uint8arr.slice(off, nbBytes + off);
      var hexStr = "";
      for (var i = 0; i < arr.length; i++) {
        var hex = (arr[i] & 0xff).toString(16);
        hex = hex.length === 1 ? "0" + hex : hex;
        hexStr += hex;
      }

      return hexStr.toUpperCase();
    }

    // XXX TODO test that
    function betoa(uint8arr, off, nbBytes) {
      if (!uint8arr) {
        return "";
      }

      var arr = uint8arr.slice(off, nbBytes + off);
      return String.fromCharCode.apply(String, arr);
    }

    /**
     * Create object allowing to easily parse an ISOBMFF box.
     *
     * The BufferReader saves in its state the current offset after each method
     * call, allowing to easily parse contiguous bytes in box parsers.
     *
     * @param {Uint8Array} buffer
     * @returns {Object}
     */
    function createBufferReader(buffer) {
      var currentOffset = 0;

      return {
        /**
         * Returns the following byte, as a number between 0 and 255.
         * @returns {number}
         */
        getNextByte: function getNextByte() {
          this.getNextBytes(1);
        },


        /**
         * Returns the N next bytes, as an Uint8Array
         * @param {number} nb
         * @returns {Uint8Array}
         */
        getNextBytes: function getNextBytes(nb) {
          if (this.getRemainingLength() < nb) {
            return;
          }
          currentOffset += nb;
          return buffer.slice(0, nb);
        },


        /**
         * Returns the N next bytes, as a single number.
         *
         * /!\ only work for now for 1, 2, 3, 4, 5 or 8 bytes.
         * TODO Define a more global solution.
         *
         * /!\ Depending on the size of the number, it may be larger than JS'
         * limit.
         *
         * @param {number} nb
         * @returns {number}
         */
        bytesToInt: function bytesToInt(nbBytes) {
          if (this.getRemainingLength() < nbBytes) {
            return;
          }
          var res = void 0;
          switch (nbBytes) {
            case 1:
              res = buffer[currentOffset];
              break;
            case 2:
              res = be2toi(buffer, currentOffset);
              break;
            case 3:
              res = be3toi(buffer, currentOffset);
              break;
            case 4:
              res = be4toi(buffer, currentOffset);
              break;
            case 5:
              res = be5toi(buffer, currentOffset);
              break;
            case 8:
              res = be8toi(buffer, currentOffset);
              break;
            default:
              throw new Error("not implemented yet.");
          }

          currentOffset += nbBytes;
          return res;
        },


        /**
         * Returns the N next bytes into a string of Hexadecimal values.
         * @param {number}
         * @returns {string}
         */
        bytesToHex: function bytesToHex$$1(nbBytes) {
          if (this.getRemainingLength() < nbBytes) {
            return;
          }
          var res = bytesToHex(buffer, currentOffset, nbBytes);
          currentOffset += nbBytes;
          return res;
        },


        /**
         * Returns the N next bytes into a string.
         * @param {number}
         * @returns {string}
         */
        bytesToASCII: function bytesToASCII(nbBytes) {
          if (this.getRemainingLength() < nbBytes) {
            return;
          }
          var res = betoa(buffer, currentOffset, nbBytes);

          currentOffset += nbBytes;
          return res;
        },


        /**
         * Returns the total length of the buffer
         * @returns {number}
         */
        getTotalLength: function getTotalLength() {
          return buffer.length;
        },


        /**
         * Returns the length of the buffer which is not yet parsed.
         * @returns {number}
         */
        getRemainingLength: function getRemainingLength() {
          return Math.max(0, buffer.length - currentOffset);
        },


        /**
         * Returns true if this buffer is entirely parsed.
         * @returns {boolean}
         */
        isFinished: function isFinished() {
          return buffer.length <= currentOffset;
        }
      };
    }

    var dinf = {
      name: "Data Information Box",
      description: "Objects that declare the location of the media information in a track.",
      container: true
    };

    var dref = {
      name: "Data Reference Box",
      description: "",
      container: true,

      parser: function parser(reader) {
        var version = reader.bytesToInt(1);
        var flags = reader.bytesToInt(3);
        if (version !== 0) {
          throw new Error("invalid version");
        }
        if (flags !== 0) {
          throw new Error("invalid flags");
        }

        var entry_count = reader.bytesToInt(4);

        return { version: version, flags: flags, entry_count: entry_count };
      }
    };

    var edts = {
      name: "Edit Box",
      description: "Maps the presentation time‐line to the media time‐line as it is stored in the file.",
      container: true
    };

    var free = {
      name: "Free Space Box",
      description: "This box can be completely ignored"
    };

    var ftypBox = {
      name: "File Type Box",
      description: "File type and compatibility",
      content: [{
        /* name: "major brand", */ // optional name
        key: "major_brand",
        description: "Brand identifier."
      }, {
        key: "minor_version",
        description: "informative integer for the minor version of the major brand"
      }, {
        key: "compatible_brands",
        description: "List of brands"
      }],

      parser: function parser(reader) {
        var len = reader.getTotalLength();
        var major_brand = reader.bytesToASCII(4);
        var minor_version = reader.bytesToInt(4);

        var compatArr = [];
        for (var i = 8; i < len; i += 4) {
          compatArr.push(reader.bytesToASCII(4));
        }

        return {
          major_brand: major_brand,
          minor_version: minor_version,
          compatible_brands: compatArr.join(", ")
        };
      }
    };

    var hdlr = {
      name: "Handler Reference Box",
      description: "This box within a Media Box declares media type of the track, and thus the process by which the media‐data in the track is presented",

      parser: function parser(r) {
        var ret = {
          version: r.bytesToInt(1),
          flags: r.bytesToInt(3),
          pre_defined: r.bytesToInt(4),
          handler_type: r.bytesToInt(4),
          reserved: [r.bytesToInt(4), r.bytesToInt(4), r.bytesToInt(4)]
        };

        var remaining = r.getRemainingLength();
        ret.name = "";
        while (remaining--) {
          ret.name += String.fromCharCode(parseInt(r.bytesToInt(1), 10));
        }

        return ret;
      }
    };

    // TODO
    var iods = {
      name: "Initial Object Descriptor Box"
    };

    var leva = {
      name: "Level Assignment Box",

      // TODO
      parser: function parser(reader) {
        var version = reader.bytesToInt(1);
        var flags = reader.bytesToInt(3);

        // ...

        return {
          version: version,
          flags: flags
        };
      }
    };

    var mdat = {
      name: "Media Data Box",
      description: "the content's data"
    };

    var mdhd = {
      name: "Media Header Box",
      description: "The media header declares overall information that is media‐independent, and relevant to characteristics of the media in a track.",
      parser: function parser(r) {
        var version = r.bytesToInt(1);
        var flags = r.bytesToInt(3);
        var creation_time = r.bytesToInt(version ? 8 : 4);
        var modification_time = r.bytesToInt(version ? 8 : 4);
        var timescale = r.bytesToInt(4);
        var duration = r.bytesToInt(version ? 8 : 4);

        var next2Bytes = r.bytesToInt(2);
        var pad = next2Bytes >> 15 & 0x01;
        var language = [String.fromCharCode((next2Bytes >> 10 & 0x1F) + 0x60), String.fromCharCode((next2Bytes >> 5 & 0x1F) + 0x60), String.fromCharCode((next2Bytes & 0x1F) + 0x60)].join("");
        var predifined = r.bytesToInt(2);
        return {
          version: version,
          flags: flags,
          creation_time: creation_time,
          modification_time: modification_time,
          timescale: timescale,
          duration: duration,
          pad: pad,
          language: language,
          predifined: predifined
        };
      }
    };

    var mdia = {
      name: "Track Media Structure",
      description: "declare information about the media data within a track.",
      container: true
    };

    var mehd = {
      name: "Movie Extends Header Box",
      description: "Provides the overall duration, including fragments, of a fragmented movie. If this box is not present, the overall duration must be computed by examining each fragment.",

      parser: function parser(reader) {
        var version = reader.bytesToInt(1);
        if (version > 1) {
          throw new Error("invalid version");
        }

        var flags = reader.bytesToInt(3);

        var fragmentDuration = version === 1 ? reader.bytesToInt(8) : reader.bytesToInt(4);

        return {
          version: version,
          flags: flags,
          "fragment_duration": fragmentDuration
        };
      }
    };

    var mfhd = {
      name: "Movie Fragment Header Box",
      description: "This box contains just a sequence number (usually starting at 1), as a safety check.",

      parser: function parser(r) {
        return {
          version: r.bytesToInt(1),
          flags: r.bytesToInt(3),
          sequence_number: r.bytesToInt(4)
        };
      }
    };

    var minf = {
      name: "Media Information Box",
      description: "This box contains all the objects that declare characteristic information of the media in the track.",
      container: true
    };

    var moof = {
      name: "Movie Fragment Box",
      description: "",
      container: true
    };

    var moov = {
      name: "Movie Box",
      description: "The movie metadata",
      container: true
    };

    var mvex = {
      name: "Movie Extends Box",
      container: true
    };

    var mvhd = {
      name: "Movie Header Box",
      description: "This box defines overall information which is " + "media‐independent, and relevant to the entire presentation " + "considered as a whole.",
      content: [{
        name: "version",
        description: "mvhd version",
        key: "version"
      }, {
        name: "flags",
        description: "mvhd flags",
        key: "flags"
      }, {
        name: "creation_time",
        description: "An integer that declares the creation time of the presentation (in seconds since midnight, Jan. 1, 1904, in UTC time)",
        key: "creationTime"
      }, {
        name: "modification_time",
        description: "An integer that declares the most recent time the presentation was modified (in seconds since midnight, Jan. 1, 1904, in UTC time)",
        key: "modificationTime"
      }, {
        name: "timescale",
        description: "An integer that specifies the time‐scale for the entire presentation; this is the number of time units that pass in one second. For example, a t me coordinate system that measures time in sixtieths of a second has a time scale of 60.",
        key: "timescale"
      }, {
        name: "duration",
        description: "An integer that declares length of the presentation (in the indicated timescale). This property is derived from the presentation’s tracks: the value of this field corresponds to the duration of the longest track in the presentation. If the durat ion cannot be determined then duration is set to all 1s.",
        key: "duration"
      }, {
        name: "rate",
        description: "A fixed point 16.16 number that indicates the preferred rate to play the presentation; 1.0 (0x00010000) is normal forward playback ",
        key: "rate"
      }, {
        name: "volume",
        description: "A fixed point 8.8 number that indicates the preferred playback volume. 1.0 (0x0100) is full volume.",
        key: "volume"
      }, {
        name: "reserved 1",
        description: "Reserved 16 bits",
        key: "reserved1"
      }, {
        name: "reserved 2",
        description: "Reserved 2*32 bits",
        key: "reserved2"
      }, {
        name: "matrix",
        description: "Provides a transformation matrix for the video; (u,v,w) are restricted here to (0,0,1), hex values (0,0,0x40000000).",
        key: "matrix"
      }, {
        name: "pre-defined",
        description: "Pre-defined 32*6 bits.",
        key: "predefined"
      }, {
        name: "next_track_ID",
        description: "A non‐zero integer that indicates a value to use for the track ID of the next track to be added to this presentation. Zero is not a valid track ID value. The value of next_track_ID shall be larger than the largest track‐ID in use. If this valu e is equal to all 1s (32‐bit maxint), and a new media track is to be added, then a s earch must be made in the file for an unused track identifier.",
        key: "nextTrackId"
      }],

      parser: function parser(reader) {
        var version = reader.bytesToInt(1);
        if (version > 1) {
          throw new Error("invalid version");
        }

        var flags = reader.bytesToInt(3);

        var creationTime = void 0,
            modificationTime = void 0,
            timescale = void 0,
            duration = void 0;
        if (version === 1) {
          creationTime = reader.bytesToInt(8);
          modificationTime = reader.bytesToInt(8);
          timescale = reader.bytesToInt(4);
          duration = reader.bytesToInt(8);
        } else {
          creationTime = reader.bytesToInt(4);
          modificationTime = reader.bytesToInt(4);
          timescale = reader.bytesToInt(4);
          duration = reader.bytesToInt(4);
        }

        var rate = [reader.bytesToInt(2), reader.bytesToInt(2)].join(".");

        var volume = [reader.bytesToInt(1), reader.bytesToInt(1)].join(".");

        var reserved1 = reader.bytesToInt(2);
        var reserved2 = [reader.bytesToInt(4), reader.bytesToInt(4)];

        var matrixArr = [];
        for (var i = 0; i < 9; i++) {
          matrixArr.push(reader.bytesToInt(4));
        }

        var predefined = [reader.bytesToInt(4), reader.bytesToInt(4), reader.bytesToInt(4), reader.bytesToInt(4), reader.bytesToInt(4), reader.bytesToInt(4)];

        var nextTrackId = reader.bytesToInt(4);

        return {
          version: version,
          flags: flags,
          creationTime: creationTime,
          modificationTime: modificationTime,
          timescale: timescale,
          duration: duration,
          rate: rate,
          volume: volume,
          reserved1: reserved1,
          reserved2: reserved2,
          matrix: matrixArr,
          predefined: predefined,
          nextTrackId: nextTrackId
        };
      }
    };

    var pdin = {
      name: "Progressive Download Information Box",
      description: "",
      content: [{
        name: "version",
        description: "pdin version",
        key: "version"
      }, {
        name: "flags",
        description: "pdin flags",
        key: "flags"
      }, {
        name: "rate",
        description: "Download rate expressed in bytes/second",
        key: "rate"
      }, {
        name: "initial_delay",
        description: "Suggested delay to use when playing the file, such " + "that if download continues at the given rate, all data within " + "the file will arrive in time for its use and playback should " + "not need to stall.",
        key: "delay"
      }],

      parser: function parser(reader) {
        var version = reader.bytesToInt(1);
        if (version !== 0) {
          throw new Error("invalid version");
        }

        return {
          version: version,
          flags: reader.bytesToInt(3),
          rate: reader.bytesToInt(4),
          delay: reader.bytesToInt(4)
        };
      }
    };

    var SYSTEM_IDS = {
      "1077EFECC0B24D02ACE33C1E52E2FB4B": "cenc",
      "1F83E1E86EE94F0DBA2F5EC4E3ED1A66": "SecureMedia",
      "35BF197B530E42D78B651B4BF415070F": "DivX DRM",
      "45D481CB8FE049C0ADA9AB2D2455B2F2": "CoreCrypt",
      "5E629AF538DA4063897797FFBD9902D4": "Marlin",
      "616C7469636173742D50726F74656374": "AltiProtect",
      "644FE7B5260F4FAD949A0762FFB054B4": "CMLA",
      "69F908AF481646EA910CCD5DCCCB0A3A": "Marlin",
      "6A99532D869F59229A91113AB7B1E2F3": "MobiDRM",
      "80A6BE7E14484C379E70D5AEBE04C8D2": "Irdeto",
      "94CE86FB07FF4F43ADB893D2FA968CA2": "FairPlay",
      "992C46E6C4374899B6A050FA91AD0E39": "SteelKnot",
      "9A04F07998404286AB92E65BE0885F95": "PlayReady",
      "9A27DD82FDE247258CBC4234AA06EC09": "Verimatrix VCAS",
      "A68129D3575B4F1A9CBA3223846CF7C3": "VideoGuard Everywhere",
      "ADB41C242DBF4A6D958B4457C0D27B95": "Nagra",
      "B4413586C58CFFB094A5D4896C1AF6C3": "Viaccess-Orca",
      "DCF4E3E362F158187BA60A6FE33FF3DD": "DigiCAP",
      "E2719D58A985B3C9781AB030AF78D30E": "ClearKey",
      "EDEF8BA979D64ACEA3C827DCD51D21ED": "Widevine",
      "F239E769EFA348509C16A903C6932EFB": "PrimeTime"
    };

    var pssh = {
      name: "Protection System Specific Header",
      description: "",
      parser: function parser(reader) {
        var ret = {};
        ret.version = reader.bytesToInt(1);
        if (ret.version > 1) {
          throw new Error("invalid version");
        }

        ret.flags = reader.bytesToInt(3);
        ret.systemID = reader.bytesToHex(16);

        var systemIDName = SYSTEM_IDS[ret.systemID];
        if (systemIDName) {
          ret.systemID += " (" + systemIDName + ")";
        }

        if (ret.version === 1) {
          ret.KID_count = reader.bytesToInt(4);

          ret.KIDs = [];

          var i = ret.KID_count;
          while (i--) {
            ret.KIDs.push(reader.bytesToASCII(16));
          }
        }

        ret.data_length = reader.bytesToInt(4);
        ret.data = reader.bytesToASCII(ret.data_length);
        return ret;
      }
    };

    var sdtp = {
      name: "Independent and Disposable Samples Box",
      description: "",

      parser: function parser(r) {
        var ret = {
          version: r.bytesToInt(1),
          flags: r.bytesToInt(3)
        };

        var remaining = r.getRemainingLength();

        var i = remaining;
        ret.samples = [];
        while (i--) {
          var byte = r.bytesToInt(1);
          ret.samples.push({
            is_leading: byte >> 6 & 0x03,
            sample_depends_on: byte >> 4 & 0x03,
            sample_is_depended_on: byte >> 2 & 0x03,
            sample_has_redundancy: byte & 0x03
          });
        }
        return ret;
      }
    };

    var sidx = {
      name: "Segment Index Box",
      description: "Index of the media stream",

      parser: function parser(r) {
        var version = r.bytesToInt(1);
        var flags = r.bytesToInt(3);
        var reference_id = r.bytesToInt(4);
        var timescale = r.bytesToInt(4);
        var earliest_presentation_time = r.bytesToInt(version === 0 ? 4 : 8);
        var first_offset = r.bytesToInt(version === 0 ? 4 : 8);
        var reserved = r.bytesToInt(2);
        var reference_count = r.bytesToInt(2);

        var items = [];
        var i = reference_count;
        while (i--) {
          var first4Bytes = r.bytesToInt(4);
          var second4Bytes = r.bytesToInt(4);
          var third4Bytes = r.bytesToInt(4);
          items.push({
            reference_type: first4Bytes >> 31 & 0x01,
            referenced_size: first4Bytes & 0x7FFFFFFF,
            subsegment_duration: second4Bytes,
            starts_with_SAP: third4Bytes >> 31 & 0x01,
            SAP_type: third4Bytes >> 28 & 0x07,
            SAP_delta_time: third4Bytes & 0x0FFFFFFF
          });
        }

        return {
          version: version,
          flags: flags,
          reference_id: reference_id,
          timescale: timescale,
          earliest_presentation_time: earliest_presentation_time,
          first_offset: first_offset,
          reserved: reserved,
          reference_count: reference_count,
          items: items
        };
      }
    };

    var skip = {
      name: "Free Space Box",
      description: "This box can be completely ignored."
    };

    var styp = {
      name: "Segment Type Box",
      description: "",
      content: ftypBox.content,
      parser: ftypBox.parser
    };

    var tfdt = {
      name: "Track Fragment Decode Time",
      description: "The absolute decode time, measured on the media timeline, of the first sample in decode order in the track fragment",
      parser: function parser(r) {
        var version = r.bytesToInt(1);
        return {
          version: version,
          flags: r.bytesToInt(3),
          baseMediaDecodeTime: r.bytesToInt(version ? 8 : 4)
        };
      }
    };

    var tfhd = {
      name: "Track Fragment Header Box",
      description: "",

      parser: function parser(r) {
        var ret = {};

        ret.version = r.bytesToInt(1);
        var flags = r.bytesToInt(3);

        var hasBaseDataOffset = flags & 0x000001;
        var hasSampleDescriptionIndex = flags & 0x000002;
        var hasDefaultSampleDuration = flags & 0x000008;
        var hasDefaultSampleSize = flags & 0x000010;
        var hasDefaultSampleFlags = flags & 0x000020;
        var durationIsEmpty = flags & 0x010000;
        var defaultBaseIsMOOF = flags & 0x020000;

        ret.flags = {
          "base-data-offset-present": !!hasBaseDataOffset,
          "sample-description-index-present": !!hasSampleDescriptionIndex,
          "default-sample-duration-present": !!hasDefaultSampleDuration,
          "default-sample-size-present": !!hasDefaultSampleSize,
          "default-sample-flags-present": !!hasDefaultSampleFlags,
          "duration-is-empty": !!durationIsEmpty,
          "default-base-is-moof": !!defaultBaseIsMOOF
        };

        ret.track_ID = r.bytesToInt(4);

        if (hasBaseDataOffset) {
          ret.base_data_offset = r.bytesToInt(8);
        }
        if (hasSampleDescriptionIndex) {
          ret.sample_description_index = r.bytesToInt(4);
        }
        if (hasDefaultSampleDuration) {
          ret.default_sample_duration = r.bytesToInt(4);
        }
        if (hasDefaultSampleSize) {
          ret.default_sample_size = r.bytesToInt(4);
        }
        if (hasDefaultSampleFlags) {
          ret.default_sample_flags = r.bytesToInt(4);
        }

        return ret;
      }
    };

    var tkhd = {
      name: "Track Header Box",
      description: "Characteristics of a single track.",

      parser: function parser(r) {
        var version = r.bytesToInt(1);
        return {
          version: version,
          flags: r.bytesToInt(3),
          creation_time: r.bytesToInt(version ? 8 : 4),
          modification_time: r.bytesToInt(version ? 8 : 4),
          track_ID: r.bytesToInt(4),
          reserved1: r.bytesToInt(4),
          duration: r.bytesToInt(version ? 8 : 4),
          reserved2: [r.bytesToInt(4), r.bytesToInt(4)],

          // TODO template? signed?
          layer: r.bytesToInt(2),
          alternate_group: r.bytesToInt(2),
          volume: [r.bytesToInt(1), r.bytesToInt(1)].join("."),
          reserved3: r.bytesToInt(2),
          matrix: [r.bytesToInt(4), r.bytesToInt(4), r.bytesToInt(4), r.bytesToInt(4), r.bytesToInt(4), r.bytesToInt(4), r.bytesToInt(4), r.bytesToInt(4), r.bytesToInt(4)],
          width: [r.bytesToInt(2), r.bytesToInt(2)],
          height: [r.bytesToInt(2), r.bytesToInt(2)]
        };
      }
    };

    var traf = {
      name: "Track Fragment Box",
      description: "",
      container: true
    };

    var trak = {
      name: "Track Box",
      description: "Container box for a single track of a presentation. A presentation consists of one or more tracks. Each track is independent of the other tracks in the presentation and carries its own temporal and spatial information. Each track will contain its associated Media Box.",
      container: true
    };

    var trex = {
      name: "Track Extends Box",
      description: "sets up default values used by the movie fragments. By setting defaults in this way, space and complexity can be saved in each Track Fragment Box",

      parser: function parser(reader) {
        return {
          version: reader.bytesToInt(1),
          flags: reader.bytesToInt(3),
          "track_id": reader.bytesToInt(4),
          "default_sample_description_index": reader.bytesToInt(4),
          "default_sample_duration": reader.bytesToInt(4),
          "default_sample_size": reader.bytesToInt(4),
          "default_sample_flags": reader.bytesToInt(4)
        };
      }
    };

    var trun = {
      name: "Track Fragment Run Box",

      parser: function parser(r) {
        var ret = {};
        ret.version = r.bytesToInt(1);

        var flags = r.bytesToInt(3);

        var hasDataOffset = flags & 0x000001;
        var hasFirstSampleFlags = flags & 0x000004;
        var hasSampleDuration = flags & 0x000100;
        var hasSampleSize = flags & 0x000200;
        var hasSampleFlags = flags & 0x000400;
        var hasSampleCompositionOffset = flags & 0x000800;

        ret.flags = {
          "data-offset-present": !!hasDataOffset,
          "first-sample-flags-present": !!hasFirstSampleFlags,
          "sample-duration-present": !!hasSampleDuration,
          "sample-size-present": !!hasSampleSize,
          "sample-flags-present": !!hasSampleFlags,
          "sample-composition-time-offset-present": !!hasSampleCompositionOffset
        };

        ret.sample_count = r.bytesToInt(4);

        // two's complement
        if (hasDataOffset) {
          ret.data_offset = ~~r.bytesToInt(4);
        }

        if (hasFirstSampleFlags) {
          ret.first_sample_flags = r.bytesToInt(4);
        }

        var i = ret.sample_count;
        ret.samples = [];
        while (i--) {
          var sample = {};

          if (hasSampleDuration) {
            sample.sample_duration = r.bytesToInt(4);
          }
          if (hasSampleSize) {
            sample.sample_size = r.bytesToInt(4);
          }
          if (hasSampleFlags) {
            sample.sample_flags = r.bytesToInt(4);
          }
          if (hasSampleCompositionOffset) {
            sample.sample_composition_time_offset = ret.version === 0 ? r.bytesToInt(4) : ~~r.bytesToInt(4);
          }
          ret.samples.push(sample);
        }

        return ret;
      }
    };

    var url_ = {
      name: "Data Entry Url Box",
      description: "declare the location(s) of the media data used within the presentation.",
      parser: function parser(r) {
        var ret = {};
        ret.version = r.bytesToInt(1);
        ret.flags = r.bytesToInt(3);

        var remaining = r.getRemainingLength();

        if (remaining) {
          ret.location = String.fromCharCode.apply(String, r.bytesToInt(r.getRemainingLength()));
        }
        return ret;
      }
    };

    var urn_ = {
      name: "Data Entry Url Box",
      description: "declare the location(s) of the media data used within the presentation.",
      parser: function parser(r) {
        var ret = {};
        ret.version = r.bytesToInt(1);
        ret.flags = r.bytesToInt(3);

        var remaining = r.getRemainingLength();

        // TODO Check NULL-terminated stream for name+location
        // might also check flags for that
        if (remaining) {
          ret.name = String.fromCharCode.apply(String, r.bytesToInt(r.getRemainingLength()));
        }
        return ret;
      }
    };

    var uuid = {
      name: "User-defined Box",
      description: "Custom box. Those are not yet parsed here."
    };

    var vmhd = {
      name: "Video Media Header",
      description: "The video media header contains general presentation information, independent of the coding, for video media.",

      parser: function parser(reader) {
        var version = reader.bytesToInt(1);
        var flags = reader.bytesToInt(3);
        if (version !== 0) {
          throw new Error("invalid version");
        }
        if (flags !== 1) {
          throw new Error("invalid flags");
        }

        // TODO template?
        var graphicsmode = reader.bytesToInt(2);
        var opcolor = [reader.bytesToInt(2), reader.bytesToInt(2), reader.bytesToInt(2)];
        return { version: version, flags: flags, graphicsmode: graphicsmode, opcolor: opcolor };
      }
    };

    var definitions = {
      dinf: dinf,
      dref: dref,
      edts: edts,
      free: free,
      ftyp: ftypBox,
      hdlr: hdlr,
      iods: iods,
      leva: leva,
      mdat: mdat,
      mdhd: mdhd,
      mdia: mdia,
      mehd: mehd,
      mfhd: mfhd,
      minf: minf,
      moof: moof,
      moov: moov,
      mvex: mvex,
      mvhd: mvhd,
      pdin: pdin,
      pssh: pssh,
      sdtp: sdtp,
      sidx: sidx,
      skip: skip,
      styp: styp,
      tfdt: tfdt,
      tfhd: tfhd,
      tkhd: tkhd,
      traf: traf,
      trak: trak,
      trex: trex,
      trun: trun,
      "url ": url_,
      "urn ": urn_,
      uuid: uuid,
      vmhd: vmhd
    };

    /**
     * Parse recursively ISOBMFF Uint8Array.
     * @param {Uint8Array} arr
     * @returns {Array.<Object>}
     */
    function recursiveParseBoxes(arr) {
      var i = 0;
      var returnedArray = [];

      var _loop = function _loop() {
        var currentOffset = i;

        var size = be4toi(arr, currentOffset);
        currentOffset += 4;

        if (size === 1) {
          size = be8toi(arr, currentOffset);
          currentOffset += 8;
        } else if (size === 0) {
          size = arr.length - i;
        }

        var name = betoa(arr, currentOffset, 4);
        currentOffset += 4;

        var atomObject = {
          alias: name,
          size: size,
          values: []
        };

        if (name === "uuid") {
          var subtype = [];
          var j = 16;
          while (j--) {
            subtype.push(arr[currentOffset]);
            currentOffset += 1;
          }

          atomObject.subtype = subtype;
        }

        returnedArray.push(atomObject);

        if (definitions[name]) {
          var config = definitions[name];
          var contentInfos = config.content ? config.content.reduce(function (acc, el) {
            acc[el.key] = {
              name: el.name || "",
              description: el.description | ""
            };
            return acc;
          }, {}) : { name: "", description: "" };

          atomObject.name = config.name || "";
          atomObject.description = config.description || "";
          var hasChildren = !!config.container;

          var content = arr.slice(currentOffset, size + i);
          var contentForChildren = void 0;

          if (typeof config.parser === "function") {
            var parserReader = createBufferReader(content);
            var result = {};
            try {
              result = config.parser(parserReader);
            } catch (e) {
              console.warn("impossible to parse \"" + name + "\" box.", e);
            }

            if (hasChildren) {
              var remaining = parserReader.getRemainingLength();
              contentForChildren = content.slice(content.length - remaining);
            } else if (!parserReader.isFinished()) {
              console.warn("not everything has been parsed for box: " + name + ". Missing", parserReader.getRemainingLength(), "bytes.");
            }

            delete result.__data__;
            Object.keys(result).forEach(function (key) {
              var infos = contentInfos[key] || {};

              if (!infos.name) {
                infos.name = key;
              }

              atomObject.values.push(Object.assign({
                value: result[key]
              }, infos));
            });
          }

          if (hasChildren) {
            var childrenResult = parseBoxes(contentForChildren || content);
            atomObject.children = childrenResult;
          }
        }
        i += size;
      };

      while (i < arr.length) {
        _loop();
      }

      return returnedArray;
    }

    /**
     * Parse ISOBMFF file and translate it into a more useful array containing
     * "atom objects".
     * @param {ArrayBuffer|Uint8Array} arr
     * @returns {Array.<Object>}
     */
    function parseBoxes(arr) {
      if (arr instanceof Uint8Array) {
        return recursiveParseBoxes(arr);
      }
      if (arr instanceof ArrayBuffer) {
        return recursiveParseBoxes(new Uint8Array(arr));
      }
      if (arr.buffer instanceof ArrayBuffer) {
        return recursiveParseBoxes(new Uint8Array(arr.buffer));
      }
      throw new Error("Unrecognized format. " + "Please give an ArrayBuffer or TypedArray instead.");
    }

    return parseBoxes;

  })));
  });

  /**
   * Pretty print a TimeRanges Object, to see the current content of it in a
   * one-liner string.
   *
   * @param {TimeRanges} buffered
   * @returns {string}
   * @example
   * This function is called by giving it directly the TimeRanges, such as:
   * ```js
   * prettyPrintBuffered(document.getElementsByTagName("video")[0].buffered);
   * ```
   *
   * Let's consider this possible return:
   *
   * ```
   *"|0.00----(29.95)----|29.95 <30.05> |60.00----(29.86)----|89.86 <9.98>
   * |99.85----(20.15)----|120.00"
   * ```
   * Note: the line feed here is to respect a max-column limit.
   * This means that our video element has 29.95 seconds of buffer between 0 and
   * 29.95 seconds.
   * Then 30.05 seconds where no buffer is found.
   * Then 29.86 seconds of buffer between 60.00 and 89.86 seconds.
   * Then 9.98 seconds where no buffer is found.
   * Then 20.15 seconds of buffer between 99.85 and 120 seconds.
   */
  function prettyPrintBuffered(buffered) {
    let str = "";
    for (let i = 0; i < buffered.length; i++) {
      const start = buffered.start(i);
      const end = buffered.end(i);
      const fixedStart = start.toFixed(2);
      const fixedEnd = end.toFixed(2);
      const fixedDuration = (end - start).toFixed(2);
      str += `|${fixedStart}----(${fixedDuration})----|${fixedEnd}`;
      if (i < buffered.length - 1) {
        const nextStart = buffered.start(i + 1);
        const fixedDiff = (nextStart - end).toFixed(2);
        str += ` <${fixedDiff}> `;
      }
    }
    return str;
  }

  /**
   * Pretty print the buffer currently available in the buffer of an
   * HTMLMediaElement.
   * @see prettyPrintBuffered for examples
   *
   * @param {HTMLMediaElement} mediaElement
   * @returns {string}
   */
  function prettyPrintMediaElementBuffer(mediaElement) {
    return prettyPrintBuffered(mediaElement.buffered);
  }

  /**
   * Pretty print the buffer currently available in the buffer of the
   * first "video" HTMLElement encountered in the page.
   * @see prettyPrintBuffered for examples
   *
   * @param {HTMLMediaElement} mediaElement
   * @returns {string}
   */
  function prettyPrintVideoBuffer() {
    const videoElts = document.getElementsByTagName("video");
    if (!videoElts.length) {
      throw new Error("No video in the page");
    }
    if (videoElts.length > 1) {
      /* eslint-disable no-console */
      console.warn("There is multiple video elements in the page, " + "only using the first one.");
      /* eslint-enable no-console */
    }
    return prettyPrintMediaElementBuffer(videoElts[0]);
  }

  /**
   * Pretty print the relation between the current position and a TimeRanges
   * Object, to better understand where in a media element you are relatively
   * to the buffer available.
   *
   * @param {Number} position
   * @param {TimeRanges} buffered
   * @returns {Object}
   */
  function prettyPrintCurrentRanges(position, buffered) {
    for (let i = 0; i < buffered.length; i++) {
      const start = buffered.start(i);
      const end = buffered.end(i);

      if (position >= start && position < end) {
        // we found the current range
        const rep = {
          currentPosition: position,
          currentRange: {
            start: start,
            end: end,
            duration: end - start
          }
        };

        if (i === 0) {
          rep.previousRange = null;
          rep.currentDeltaWithPreviousRange = null;
        } else {
          const prevRangeStart = buffered.start(i - 1);
          const prevRangeEnd = buffered.end(i - 1);
          rep.previousRange = {
            start: prevRangeStart,
            end: prevRangeEnd,
            duration: prevRangeEnd - prevRangeStart
          };
          rep.currentDeltaWithPreviousRange = position - prevRangeEnd;
        }

        if (i >= buffered.length - 1) {
          rep.nextRange = null;
          rep.currentDeltaWithNextRange = null;
        } else {
          const nextRangeStart = buffered.start(i + 1);
          const nextRangeEnd = buffered.end(i + 1);
          rep.nextRange = {
            start: nextRangeStart,
            end: nextRangeEnd,
            duration: nextRangeEnd - nextRangeStart
          };
          rep.currentDeltaWithNextRange = nextRangeStart - position;
        }
        return rep;
      } else if (position < start) {
        // we went further than the current range without finding it

        const nextRangeStart = buffered.start(i);
        const nextRangeEnd = buffered.end(i);
        const rep = {
          currentPosition: position,
          currentRange: null
        };

        if (i === 0) {
          rep.previousRange = null;
          rep.currentDeltaWithPreviousRange = null;
        } else {
          const prevRangeStart = buffered.start(i - 1);
          const prevRangeEnd = buffered.end(i - 1);
          rep.previousRange = {
            start: prevRangeStart,
            end: prevRangeEnd,
            duration: prevRangeEnd - prevRangeStart
          };
          rep.currentDeltaWithPreviousRange = position - prevRangeEnd;
        }

        // added after to respect instertion order
        rep.nextRange = {
          start: nextRangeStart,
          end: nextRangeEnd,
          duration: nextRangeStart - nextRangeEnd
        };
        rep.currentDeltaWithNextRange = nextRangeStart - position;
        return rep;
      }
    }

    if (!buffered.length) {
      return {
        currentPosition: position,
        currentRange: null,
        previousRange: null,
        currentDeltaWithPreviousRange: null,
        nextRange: null,
        currentDeltaWithNextRange: null
      };
    }
    const prevRangeStart = buffered.start(buffered.length - 1);
    const prevRangeEnd = buffered.end(buffered.length - 1);
    return {
      currentPosition: position,

      currentRange: null,

      previousRange: {
        start: prevRangeStart,
        end: prevRangeEnd,
        duration: prevRangeEnd - prevRangeStart
      },
      currentDeltaWithPreviousRange: position - prevRangeEnd,

      nextRange: null,
      currentDeltaWithNextRange: null
    };
  }

  /*
   * @param {HTMLMediaElement} mediaElement
   * @returns {string}
   */
  function prettyPrintMediaElementCurrentRanges(mediaElement) {
    return prettyPrintCurrentRanges(mediaElement.currentTime, mediaElement.buffered);
  }

  function prettyPrintVideoCurrentRanges() {
    const videoElts = document.getElementsByTagName("video");
    if (!videoElts.length) {
      throw new Error("No video in the page");
    }
    if (videoElts.length > 1) {
      console.warn("There is multiple video elements in the page, " + "only using the first one.");
    }
    const firstVideoElt = videoElts[0];
    return prettyPrintCurrentRanges(firstVideoElt.currentTime, firstVideoElt.buffered);
  }

  exports.addSpy = addSpy;
  exports.EMESpy = EMESpy;
  exports.MSESpy = MSESpy;
  exports.inspectISOBMFF = bundle$2;
  exports.prettyPrintBuffered = prettyPrintBuffered;
  exports.prettyPrintMediaElementBuffer = prettyPrintMediaElementBuffer;
  exports.prettyPrintVideoBuffer = prettyPrintVideoBuffer;
  exports.prettyPrintCurrentRanges = prettyPrintCurrentRanges;
  exports.prettyPrintMediaElementCurrentRanges = prettyPrintMediaElementCurrentRanges;
  exports.prettyPrintVideoCurrentRanges = prettyPrintVideoCurrentRanges;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
