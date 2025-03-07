import ComponentView from 'core/js/views/componentView';

class StatementSortingView extends ComponentView {

  initialize() {
    super.initialize();
    this.setUpEventListeners();
  }

  setUpEventListeners() {
    // Listen for model changes to update the view
    this.listenTo(this.model, 'change:_statements', this.render);
    this.listenTo(this.model, 'change:_isModelAnswerShown', this.onModelAnswerShown);

    // Add DOM event handlers
    this.events = {
      'dragstart .statement': 'onDragStart',
      'dragover .bucket': 'onDragOver',
      'drop .bucket': 'onDrop',
      'click .js-statement-sorting-submit': 'onSubmitClicked',
      'click .js-statement-sorting-reset': 'onResetClicked',
      'click .js-statement-sorting-show-correct-answer': 'onShowCorrectAnswerClicked',
      'click .js-statement-sorting-hide-correct-answer': 'onHideCorrectAnswerClicked'
    };
  }

  preRender() { // Make sure the model is initialized
    if (!this.model.get('_statements')) {
      this.model.setupStatements();
    }
  }

  postRender() { // Set ready status after rendering
    this.setupReactComponent();
    this.setReadyStatus();
  }

  setupReactComponent() { // Add any React-specific prop setup here

    this.model.set('onSubmit', this.onSubmitClicked.bind(this));
    this.model.set('onReset', this.onResetClicked.bind(this));
    this.model.set('onShowCorrectAnswer', this.onShowCorrectAnswerClicked.bind(this));
    this.model.set('onHideCorrectAnswer', this.onHideCorrectAnswerClicked.bind(this));
    this.model.set('moveStatementToBucket', this.onDrop.bind(this));
  }

  onShowCorrectAnswerClicked() {
    if (!this.model.get('_isSubmitted')) return;

    this.model.showModelAnswer();
    this.$('.js-statement-sorting-show-correct-answer').addClass('u-display-none');
    this.$('.js-statement-sorting-hide-correct-answer').removeClass('u-display-none');
  }

  onHideCorrectAnswerClicked() {
    this.model.hideModelAnswer();
    this.$('.js-statement-sorting-hide-correct-answer').addClass('u-display-none');
    this.$('.js-statement-sorting-show-correct-answer').removeClass('u-display-none');
  }

  onModelAnswerShown() {
    if (this.model.get('_isModelAnswerShown')) {
      this.$el.find('.component__widget').addClass('is-showing-model-answer');
    } else {
      this.$el.find('.component__widget').removeClass('is-showing-model-answer');
    }
  }

  onDragStart(event) {
    const statementIndex = event.currentTarget.dataset.index;
    event.originalEvent.dataTransfer.setData('text/plain', statementIndex);
  }

  onDragOver(event) {
    event.preventDefault(); // Allow drop
  }

  onDrop(statementIndex, bucketIndex) {
    // Move statement to bucket in model
    if (typeof statementIndex === 'number' && typeof bucketIndex === 'number') {
      this.model.addStatementToBucket(statementIndex, bucketIndex);

      // Force a render after the model updates
      this.render();
    }
  }

  onSubmitClicked() {
    if (!this.model.canSubmit()) {
      return; // Don't submit if not all statements are sorted
    }

    // Mark statements as correct/incorrect
    this.model.markStatements();
    this.model.set('_isSubmitted', true);

    // Update UI to show results
    this.$el.find('.component__widget').addClass('is-submitted');

    // Show feedback
    const feedbackMessage = this.model.get('_isCorrect')
      ? this.model.get('_feedback').correct
      : this.model.get('_feedback')._incorrect.final;

    this.$('.statement-sorting__feedback').html(feedbackMessage).removeClass('u-display-none');

    // Show the "Show Correct Answer" button if allowed and not all correct
    if (this.model.get('_canShowModelAnswer') && !this.model.get('_isCorrect')) {
      this.$('.js-statement-sorting-show-correct-answer').removeClass('u-display-none');
      this.$('.js-statement-sorting-hide-correct-answer').addClass('u-display-none');
    }

    this.model.onComplete();
  }

  onResetClicked() {
    this.model.reset();
    this.$el.find('.component__widget').removeClass('is-submitted');
    this.$('.statement-sorting__feedback').addClass('u-display-none');
    this.$('.js-statement-sorting-show-correct-answer').addClass('u-display-none');
    this.$('.js-statement-sorting-hide-correct-answer').addClass('u-display-none');
  }
}

StatementSortingView.template = 'statementsorting.jsx'; // Set the template

export default StatementSortingView;
