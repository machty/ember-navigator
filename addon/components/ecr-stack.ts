import Component from '@ember/component';
// @ts-ignore: Ignore import of compiled template
import layout from '../templates/components/ecr-stack';
import { computed } from '@ember/object';
import { RouterState, StackRouterState } from 'ember-constraint-router/-private/routeable';

export default class EcrStack extends Component.extend({
  tagName: null,
  classNames: 'ecr-stack',
}) {
  layout = layout;
  state?: RouterState;

  get shouldRenderHeader() {
    return (this.state as StackRouterState).headerMode !== 'none';
  }
};
