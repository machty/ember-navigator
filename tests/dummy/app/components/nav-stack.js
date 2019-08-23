import Component from '@ember/component'
import { computed } from '@ember/object';
import { readOnly } from '@ember/object/computed'

export default Component.extend({
  navStack: null,
  // frames: readOnly(`navStack.frames`),
  visibleFrames: computed('frames', function() {
    return [this.frames.lastObject].compact()
  }),
  // header: readOnly(`frames.lastObject.component.header`),
})

