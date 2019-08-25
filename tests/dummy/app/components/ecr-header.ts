import Component from '@ember/component';
// @ts-ignore: Ignore import of compiled template
import layout from '../templates/components/ecr-header';
import { readOnly } from '@ember/object/computed';

export default class EcrHeader extends Component.extend({
  headerConfig: readOnly('state.config.header'),
  mountedRouter: null,

  actions: {
    leftButton() {
      // TODO: omg how do I type this
      this.mountedRouter.pop();
    }
  }
}) {
  classNames = ['app-header'];  
  layout = layout;
};
