import Hammer from 'hammerjs';
// import './oncssanimationend';

// const reqAnimationFrame = (function() {
//   return window[Hammer.prefixed(window, 'requestAnimationFrame')] || function(callback) {
//     setTimeout(callback, 1000 / 60);
//   };
// })();


/**
* Return correct property according to direction
*/
function dirProp(direction, hProp, vProp) {
  return (direction & Hammer.DIRECTION_HORIZONTAL) ? hProp : vProp;
}


/**
* Carousel
* @param container
* @param direction
* @constructor
*/
export default function createCarousel({ container, currentIndex, onMovePaneEnd, onTransitionEnd }) {
  const direction = Hammer.DIRECTION_HORIZONTAL;
  const panes = [...container.children];
  const hammer = new Hammer.Manager(container);

  let prevIndex = null;
  let containerSize = container[dirProp(direction, 'offsetWidth', 'offsetHeight')];

  hammer.add(new Hammer.Pan({ direction, threshold: 10 }));
  hammer.on('panstart panmove panend pancancel', Hammer.bindFn(onPan, this));

  movePane(currentIndex);

  // resize event
  window.addEventListener('resize', () => {
    containerSize = container[dirProp(direction, 'offsetWidth', 'offsetHeight')];
    movePane(currentIndex);
  });

  // wrap event cursor
  container.addEventListener('mousedown', function moudedown() {
    this.style.cursor = '-moz-grabbing';
    this.style.cursor = '-webkit-grabbing';
    this.style.cursor = 'grabbing';
  });

  container.addEventListener('mouseup', function mouseup() {
    this.style.cursor = '-moz-grab';
    this.style.cursor = '-webkit-grab';
    this.style.cursor = 'grab';
  });

  panes.map((p, i) => {
    p.addEventListener('transitionend', () => {
      if (i === currentIndex) {
        onTransitionEnd(currentIndex, prevIndex);
      }
    });
  });

  /**
  * move a pane
  * @param {Number} showIndex
  * @param {Boolean} [animate]
  * @param {Number} [percent] percentage visible
  */
  function movePane(showIndex, animate = false, percent = 0) {
    showIndex = Math.max(0, Math.min(showIndex, panes.length - 1));

    const classList = container.classList;
    if (animate) {
      if (!classList.contains('animate')) {
        classList.add('animate');
        onMovePaneEnd(showIndex, prevIndex);
      }
    } else {
      if (classList.contains('animate')) {
        classList.remove('animate');
      }
    }

    panes.map((pane, i) => {
      const pos = (containerSize / 100) * (((i - showIndex) * 100) + percent);
      let translate = null;

      if (direction & Hammer.DIRECTION_HORIZONTAL) {
        translate = `translate3d(${pos}px, 0, 0)`;
      } else {
        translate = `translate3d(0, ${pos}px, 0)`;
      }
      pane.style.transform = translate;
      pane.style.mozTransform = translate;
      pane.style.webkitTransform = translate;
    });

    currentIndex = showIndex;
  }

  /**
  * handle pan
  * @param {Object} ev
  */
  function onPan(ev) {
    const delta = dirProp(direction, ev.deltaX, ev.deltaY);
    let percent = (100 / containerSize) * delta;
    let animate = false;

    if (ev.type === 'panend' || ev.type === 'pancancel') {
      if (Math.abs(percent) > 20 && ev.type === 'panend') {
        prevIndex = currentIndex;
        currentIndex += (percent < 0) ? 1 : -1;
      }
      percent = 0;
      animate = true;
    }

    movePane(currentIndex, animate, percent);
  }

  return {
    movePane,
  };
}
