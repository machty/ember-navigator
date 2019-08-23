import Component from '@ember/component'
import { computed } from '@ember/object';
import { readOnly } from '@ember/object/computed'

export default Component.extend({
  navStack: null,
  frames: readOnly(`navStack.frames`),
  visibleFrames: computed('frames', function() {
    let frame = this.frames[this.frames.length - 1];
    debugger;
    return frame ? [frame] : [];
  }),
  // header: readOnly(`frames.lastObject.component.header`),
})

