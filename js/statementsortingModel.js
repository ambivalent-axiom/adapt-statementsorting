import ComponentModel from 'core/js/models/componentModel';
import _ from 'underscore';

class StatementSortingModel extends ComponentModel {

  initialize() {
    super.initialize();

    // Set up initial data
    this.setupItems();
    this.setupStatements();
  }

  setupItems() {
    const items = this.get('_items') || []; // Initialize item containers

    // Initialize each item's statements array
    const initializedItems = items.map((item, index) => {
      return {
        ...item,
        _index: index,
        _statements: []
      };
    });

    this.set('_items', initializedItems);
  }

  setupStatements() {
    const statements = this.createStatements();
    this.set('_statements', statements);
  }

  createStatements() {
    const items = this.get('_items') || [];
    const statementList = [];

    // Create a flat list of all statements with their target buckets
    items.forEach((item, itemIndex) => {
      if (item.acceptedStatements && Array.isArray(item.acceptedStatements)) {
        item.acceptedStatements.forEach(text => {
          statementList.push({
            text,
            _targetItemIndex: itemIndex,
            _currentItemIndex: null,
            _isCorrect: false
          });
        });
      }
    });

    // Randomize if needed
    if (this.get('_isRandom')) {
      return _.shuffle(statementList);
    }

    return statementList;
  }

  // Add a statement to a bucket
  addStatementToBucket(statementIndex, bucketIndex) {
    const statements = [...this.get('_statements')];
    const items = [...this.get('_items')];

    // If the statement is already in a bucket, remove it
    const statement = statements[statementIndex];
    if (statement._currentItemIndex !== null) {
      const oldBucket = items[statement._currentItemIndex];
      oldBucket._statements = oldBucket._statements.filter(id => id !== statementIndex);
    }

    // Update the statement with new bucket
    statements[statementIndex] = {
      ...statement,
      _currentItemIndex: bucketIndex
    };

    // Add statement to the bucket
    items[bucketIndex]._statements.push(statementIndex);

    // Update model
    this.set('_statements', statements);
    this.set('_items', items);
  }

  canSubmit() { // Check if all statements have been sorted
    const statements = this.get('_statements') || [];
    return statements.every(statement => statement._currentItemIndex !== null);
  }

  markStatements() { // Mark correct and incorrect statements
    const statements = this.get('_statements');
    let correctCount = 0;

    const markedStatements = statements.map(statement => {
      // Skip unsorted statements
      if (statement._currentItemIndex === null) {
        return { ...statement, _isCorrect: false };
      }

      // Store user's choice for later
      statement._userItemIndex = statement._currentItemIndex;

      // Check if statement is in correct bucket
      const isCorrect = statement._currentItemIndex === statement._targetItemIndex;
      if (isCorrect) correctCount++;

      return { ...statement, _isCorrect: isCorrect };
    });

    this.set('_statements', markedStatements);
    this.set('_score', correctCount);

    // Check if all statements are correct
    const allCorrect = correctCount === statements.length;
    this.set('_isCorrect', allCorrect);

    return allCorrect;
  }

  showModelAnswer() {
    const statements = [...this.get('_statements')];
    const items = [...this.get('_items')];

    // Reset current item assignments
    items.forEach(item => {
      item._statements = [];
    });

    // Place each statement in its correct bucket
    statements.forEach((statement, index) => {
      const targetBucket = statement._targetItemIndex;

      // Update statement
      statements[index] = {
        ...statement,
        _currentItemIndex: targetBucket,
        _isCorrect: true // Mark all as correct in model answer view
      };

      // Add to correct bucket
      items[targetBucket]._statements.push(index);
    });

    // Update model
    this.set('_statements', statements);
    this.set('_items', items);
    this.set('_isModelAnswerShown', true);

    this.trigger('change:_statements'); // Trigger re-render
  }

  hideModelAnswer() {
    // If we haven't submitted yet, just reset
    if (!this.get('_isSubmitted')) {
      this.reset();
      return;
    }

    // Otherwise restore the previous submitted state
    const statements = [...this.get('_statements')];
    const items = [...this.get('_items')];

    // Reset current item assignments
    items.forEach(item => {
      item._statements = [];
    });

    // Restore to last submitted state
    statements.forEach((statement, index) => {
      const currentBucket = statement._userItemIndex;

      if (currentBucket !== null) {
        items[currentBucket]._statements.push(index); // Add to their previous bucket

        statements[index] = { // Update statement
          ...statement,
          _currentItemIndex: currentBucket,
          _isCorrect: currentBucket === statement._targetItemIndex
        };
      } else {
        statements[index] = { // Statement was not placed
          ...statement,
          _currentItemIndex: null,
          _isCorrect: false
        };
      }
    });

    // Update model
    this.set('_statements', statements);
    this.set('_items', items);
    this.set('_isModelAnswerShown', false);

    this.trigger('change:_statements'); // Trigger re-render
  }

  onComplete() {
    this.set({
      _score: this.get('_score'),
      _isComplete: true,
      _isInteractionComplete: true
    });
    this.setCompletionStatus();
    this.trigger('complete'); // Trigger completion event
  }

  reset() { // Reset component
    this.set('_statements', this.createStatements());
    this.setupItems();
    this.set('_isSubmitted', false);
    this.set('_isCorrect', false);
    this.set('_score', 0);
  }
}

export default StatementSortingModel;
