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
export default function addSpy(obj, fnName, addDebugger) {
  if (!obj) {
    throw new Error("Invalid object.");
  }
  const oldFn = obj[fnName];
  if (typeof oldFn != "function") {
    throw new Error("No function with that name.");
  }

  obj[fnName] = function(...args) {
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

export { addSpy };
