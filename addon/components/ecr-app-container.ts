import Component from '@ember/component';
// @ts-ignore: Ignore import of compiled template
import layout from '../templates/components/ecr-app-container';

export default class AppContainer extends Component.extend({
  classNames: 'ecr-app-container',
}) {
  layout = layout;
};
