import Component from '@ember/component';
// @ts-ignore: Ignore import of compiled template
import layout from '../templates/components/ecr-switch';
import { computed } from '@ember/object';
import { RouterState } from 'ember-constraint-router/-private/routeable';
import { MountedNode } from 'ember-constraint-router/-private/mounted-router';

export default class EcrSwitch extends Component.extend({
  tagName: null,
  classNames: 'ecr-switch',

  // TODO: what does this depend on! something needs to update on publicRoute
  currentNodes: computed(function() {
    let node = this.node as MountedNode;
    debugger;
    let routerState = node.routeableState as RouterState;
    let activeChild = routerState.routes[routerState.index];
    let activeChildNode = node.childNodes[activeChild.key];
    // debugger;
    return [activeChildNode];
  }),

}) {
  layout = layout;
  state?: RouterState;
};

