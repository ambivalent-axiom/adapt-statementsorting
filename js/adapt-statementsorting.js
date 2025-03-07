import components from 'core/js/components';
import statementsortingView from './statementsortingView';
import statementsortingModel from './statementsortingModel';

export default components.register('statementsorting', {
  model: statementsortingModel,
  view: statementsortingView
});
