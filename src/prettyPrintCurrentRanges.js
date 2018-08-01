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
          duration: end - start,
        },
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
          duration: prevRangeEnd - prevRangeStart,
        };
        rep.currentDeltaWithPreviousRange = position - prevRangeEnd;
      }

      if (i >= buffered.length -1) {
        rep.nextRange = null;
        rep.currentDeltaWithNextRange = null;
      } else {
        const nextRangeStart = buffered.start(i + 1);
        const nextRangeEnd = buffered.end(i + 1);
        rep.nextRange = {
          start: nextRangeStart,
          end: nextRangeEnd,
          duration: nextRangeEnd - nextRangeStart,
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
        currentRange: null,
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
          duration: prevRangeEnd - prevRangeStart,
        };
        rep.currentDeltaWithPreviousRange = position - prevRangeEnd;
      }

      // added after to respect instertion order
      rep.nextRange = {
        start: nextRangeStart,
        end: nextRangeEnd,
        duration: nextRangeStart - nextRangeEnd,
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
      currentDeltaWithNextRange: null,
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
      duration: prevRangeEnd - prevRangeStart,
    },
    currentDeltaWithPreviousRange: position - prevRangeEnd,

    nextRange: null,
    currentDeltaWithNextRange: null,
  };
}

/*
 * @param {HTMLMediaElement} mediaElement
 * @returns {string}
 */
function prettyPrintMediaElementCurrentRanges(mediaElement) {
  return prettyPrintCurrentRanges(
    mediaElement.currentTime, mediaElement.buffered);
}

function prettyPrintVideoCurrentRanges() {
  const videoElts = document.getElementsByTagName("video");
  if (!videoElts.length) {
    throw new Error("No video in the page");
  }
  if (videoElts.length > 1) {
    console.warn("There is multiple video elements in the page, " +
      "only using the first one.");
  }
  const firstVideoElt = videoElts[0];
  return prettyPrintCurrentRanges(
    firstVideoElt.currentTime, firstVideoElt.buffered);
}

export default prettyPrintCurrentRanges;
export {
  prettyPrintCurrentRanges,
  prettyPrintMediaElementCurrentRanges,
  prettyPrintVideoCurrentRanges,
};
