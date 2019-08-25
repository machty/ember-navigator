import Component from '@ember/component';
// @ts-ignore: Ignore import of compiled template
import layout from '../templates/components/ecr-header';
import { computed } from '@ember/object';
import { readOnly } from '@ember/object/computed';

export default class EcrHeader extends Component.extend({
  headerConfig: readOnly('state.config.header'),

  actions: {
    leftButton() {
      alert('leftButton')
    }
  }
}) {
  classNames = ['app-header'];  
  layout = layout;
};
