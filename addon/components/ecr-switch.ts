import Component from '@ember/component';
// @ts-ignore: Ignore import of compiled template
import layout from '../templates/components/ecr-switch';
import { computed } from '@ember/object';
import { RouterState } from 'ember-navigator/-private/routeable';
import { MountedNode } from 'ember-navigator/-private/mounted-node';

export default class EcrSwitch extends Component.extend({
  tagName: null,
  classNames: 'ecr-switch',

  currentNodes: computed('route.node', function() {
    let node = this.node as MountedNode;
    let routerState = node.routeableState as RouterState;
    let activeChild = routerState.routes[routerState.index];
    let activeChildNode = node.childNodes[activeChild.key];
    return [activeChildNode];
  }),
}) {
  layout = layout;
  state?: RouterState;
};

