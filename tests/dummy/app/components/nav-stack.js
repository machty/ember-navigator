import Component from '@ember/component'
import { computed } from '@ember/object';
import { readOnly, not } from '@ember/object/computed'
import layout from "./template"

export default Component.extend({
  layout,
  classNames: 'block block--main nav-stack animated'.w(),
  // classNameBindings: [`slideInUp`, `slideOutDown`],
  slideInUp: not(`idx`, 0),
  navStack: null,
  frames: readOnly(`navStack.frames`),
  visibleFrames: computed('frames', function() {
    return [this.frames.lastObject].compact()
  }),
  header: readOnly(`frames.lastObject.component.header`),
  willDestroyElement() {
    this.set(`slideOutDown`, true)
  },
})

