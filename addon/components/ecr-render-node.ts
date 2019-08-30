import Component from '@ember/component';
// @ts-ignore: Ignore import of compiled template
import layout from '../templates/components/ecr-render-node';

export default class EcrHeader extends Component.extend({
  tagName: null,

  init(...args) {
    this._super(...args)
    debugger;

  }
}) {
  layout = layout;
};
