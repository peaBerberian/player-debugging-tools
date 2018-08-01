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
    console.warn("There is multiple video elements in the page, " +
      "only using the first one.");
  }
  return prettyPrintMediaElementBuffer(videoElts[0]);
}

export default prettyPrintBuffered;
export {
  prettyPrintBuffered,
  prettyPrintMediaElementBuffer,
  prettyPrintVideoBuffer,
};
