# Player Debugging Tools #######################################################

This repository regroups multiple tools useful for debugging web video and audio
players.

It was created in my free time with the goal to have a better debugging and
reverse-engineering experience for the [rx-player
](https://github.com/canalplus/rx-player).



## How to install it ###########################################################

### Including the script directly ##############################################

Because this is mainly a debugging application, the most straightforward way of
using it is just to copy the code of the [compiled bundle
](https://raw.githubusercontent.com/peaBerberian/player-debugging-tools/master/dist/bundle.js)
directly, and to copy-paste it into your console.

You will then have a global ``PlayerTools`` object, through which you can call
any tool defined here.

Example:
```js
PlayerTools.prettyPrintBuffered(player.getVideoElement().buffered);
```

This configuration can also be useful by including this script automatically in
multimedia pages. This can be done through userscript managers, such as
[Tampermonkey for Chrome
](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
or [Greasemonkey for Firefox
](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/).


### Adding the tool as a dependency ############################################

The cleaner way to use these tools is to include its npm module as a dependency
and to add it in your code.

You can install PlayerTools by using its github repository:
```sh
npm install git+https://git@github.com/peaberberian/player-debugging-tools.git
```

You will then be able to use it by importing the ``"player-debugging-tools"``
module:
```js
import PlayerTools from "player-debugging-tools";

PlayerTools.prettyPrintBuffered(player.getVideoElement().buffered);
```



## Tools #######################################################################

``PlayerTools`` is in fact multiple tools which approach different subjects:

  - Buffer management

  - EME inspecting

  - MSE inspecting

  - ISOBMFF parsing


### EMESpy #####################################################################

``EMESpy`` allows to spy on EME API calls, to know which API have been called,
at which time, with which arguments and what their response are.

It is accessible through ``PlayerTools.EMESpy``.

All its documentation is available in [its original repository
](https://github.com/peaBerberian/EMESpy.js).


### inspectISOBMFF #############################################################

``inspectISOMFF`` is a function allowing you to directly probe ISOBMFF files
in the console. It displays in a human-readable format most data an ISOBMFF file
can store.

It is accessible through ``PlayerTools.inspectISOBMFF``.

All its documentation is available in [its original repository
](https://github.com/peaBerberian/isobmff-inspector).


### Buffered state #############################################################

There is several functions allowing to inspect the current state of the buffer.

``prettyPrintBuffered`` allows to have a string representation of time ranges:

```js
const firstVideoElt = document.getElementsByTagName("video")[0];
PlayerTools.prettyPrintBuffered(firstVideoElt.buffered);

// Result:
// "|0.00----(29.95)----|29.95 <30.05> |60.00----(29.86)----|89.86 <9.98>
// |99.85----(20.15)----|120.00"
// Note: the line feed here is to respect a max-column limit.
// This means that our video element has 29.95 seconds of buffer between 0 and
// 29.95 seconds.
// Then 30.05 seconds where no buffer is found.
// Then 29.86 seconds of buffer between 60.00 and 89.86 seconds.
// Then 9.98 seconds where no buffer is found.
// Then 20.15 seconds of buffer between 99.85 and 120 seconds.
```

To simplify its use, you can also call instead:

  - ``prettyPrintMediaElementBuffer`` which just takes the media element
    instead:
    ```js
    const firstVideoElt = document.getElementsByTagName("video")[0];
    PlayerTools.prettyPrintMediaElementBuffer(firstVideoElt);
    ```

  - ``prettyPrintVideoBuffer`` which just takes the first video element it
    find in the page:
    ```js
    PlayerTools.prettyPrintVideoBuffer();
    ```
    As often, there is only one video element, this is the variation I use the
    most.


### Ranges intervals ###########################################################

A more specialized approach to understand the current buffer is by inspecting
closely the current, previous and next time ranges (that is, the size of it,
the distance between one another, etc.).

There is several tools that allows to do that:

``prettyPrintCurrentRanges`` needs you to give the current position and
TimeRanges:
```js
const firstVideoElt = document.getElementsByTagName("video")[0];
PlayerTools.prettyPrintCurrentRanges(
  firstVideoElt.currentTime,
  firstVideoElt.buffered
);

// Result:
// {
//   "currentPosition": 185.850631,
//
//   "currentRange": {
//     "start": 181.515,
//     "end": 208.207,
//     "duration": 26.692000000000007 // (comes with IEEE 754 rounding errors!)
//   },
//
//   "previousRange": {
//     "start": 60.001,
//     "end": 69.402,
//     "duration": 9.401000000000003
//   },
//   "currentDeltaWithPreviousRange": 116.44863099999999,
//
//   "nextRange": {
//     "start": 330.001,
//     "end": 340.001,
//     "duration": 10
//   },
//   "currentDeltaWithNextRange": 144.15036899999998
// }
```

To simplify its use, you can also call instead:

  - ``prettyPrintMediaElementCurrentRanges`` which just takes the media element
    instead:
    ```js
    const firstVideoElt = document.getElementsByTagName("video")[0];
    PlayerTools.prettyPrintMediaElementCurrentRanges(firstVideoElt);
    ```

  - ``prettyPrintVideoCurrentRanges`` which just takes the first video element
    it find in the page:
    ```js
    PlayerTools.prettyPrintVideoCurrentRanges();
    ```
    Again, as there is only one video element, this is the variation I use the
    most.
