import Component from '@ember/component';
// @ts-ignore: Ignore import of compiled template
import layout from '../templates/components/ecr-stack';
import { computed } from '@ember/object';
import { RouterState, StackRouterState } from 'ember-constraint-router/-private/routeable';
import { MountedNode } from 'ember-constraint-router/-private/mounted-router';

export default class EcrStack extends Component.extend({
  tagName: null,
  classNames: 'ecr-stack',

  currentNodes: computed('route.node', function() {
    let node = this.node as MountedNode;
    let routerState = node.routeableState as RouterState;
    let activeChild = routerState.routes[routerState.index];
    let activeChildNode = node.childNodes[activeChild.key];
    return [activeChildNode];
  }),

  headerConfig: computed(function() {
    return 123;
  }),
}) {
  layout = layout;
  state?: RouterState;

  get shouldRenderHeader() {
    return false;
    // return (this.state as StackRouterState).headerMode !== 'none';
  }
};
