import Component from '@ember/component';
// @ts-ignore: Ignore import of compiled template
import layout from '../templates/components/no-header';

export default class NoHeader extends Component.extend({
  // anything which *must* be merged to prototype here
}) {
  layout = layout;
  // normal class body definition here
};
