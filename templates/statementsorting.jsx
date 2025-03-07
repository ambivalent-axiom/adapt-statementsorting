import React, { useState } from 'react';

export default function StatementSorting(props) {
  const {
    displayTitle,
    _buttons,
    body,
    instruction,
    _items = [],
    _statements = [],
    _isSubmitted,
    _isModelAnswerShown,
    _canShowModelAnswer
  } = props;

  const [dragoverBucket, setDragoverBucket] = useState(null);

  // Generate statement className based on state
  const getStatementClass = (statement) => {
    if (!statement) return 'statement';

    let className = 'statement';

    if (_isSubmitted) {
      if (_isModelAnswerShown) {
        // When showing model answer, all statements appear correct
        className += ' is-correct';
      } else {
        // When showing user's answer, show correct/incorrect state
        className += statement._isCorrect ? ' is-correct' : ' is-incorrect';
      }
    }

    className += statement._currentItemIndex !== null ? ' is-placed' : ' is-outside'; // additional styling

    return className;
  };

  const handleDragStart = (e, index) => { // Handle drag events
    // If the component is submitted, don't allow dragging
    if (_isSubmitted) {
      e.preventDefault();
      return false;
    }

    e.dataTransfer.setData('text/plain', index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, bucketIndex) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragoverBucket(bucketIndex); // Set the current bucket being dragged over
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragoverBucket(null); // Clear the dragover state
  };

  const handleDrop = (e, bucketIndex) => {
    e.preventDefault();

    // If the component is submitted, don't allow dropping
    if (_isSubmitted) {
      return false;
    }

    const statementIndex = parseInt(e.dataTransfer.getData('text/plain'));

    setDragoverBucket(null); // Clear the dragover state

    if (props.moveStatementToBucket) {
      props.moveStatementToBucket(statementIndex, bucketIndex);
    }
  };

  const isShowCorrectVisible = _isSubmitted && _canShowModelAnswer && !_isModelAnswerShown;
  const isHideCorrectVisible = _isSubmitted && _canShowModelAnswer && _isModelAnswerShown;

  return (
    <div className="component__inner statement-sorting__inner">
      {/* Component header */}
      <div className="component__header">
        {displayTitle && (
          <div className="component__title">
            <div className="component__title-inner" dangerouslySetInnerHTML={{ __html: displayTitle }} />
          </div>
        )}

        {body && (
          <div className="component__body">
            <div className="component__body-inner" dangerouslySetInnerHTML={{ __html: body }} />
          </div>
        )}

        {instruction && (
          <div className="component__instruction">
            <div className="component__instruction-inner" dangerouslySetInnerHTML={{ __html: instruction }} />
          </div>
        )}
      </div>

      <div className={`component__widget statement-sorting__widget ${_isSubmitted ? 'is-submitted' : ''} ${_isModelAnswerShown ? 'is-showing-model-answer' : ''}`}>
        {/* Statements container - where statements start */}
        <div className={`statement-sorting__statements${_isSubmitted ? '-hidden' : ''}`}>
          {_statements.map((statement, index) => (
            statement._currentItemIndex === null
              ? (
                <div
                  key={index}
                  data-index={index}
                  className={getStatementClass(statement)}
                  draggable={!_isSubmitted} // Only draggable if not submitted
                  onDragStart={(e) => handleDragStart(e, index)}
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: `${0 + (index * 5)}px`,
                    transform: 'translateX(-50%)',
                    zIndex: statement._zIndex || (_statements.length - index)
                  }}
                >
                  {statement.text}
                </div>
              )
              : null
          ))}
        </div>

        {/* Feedback area */}
        <div className="statement-sorting__feedback u-display-none"></div>

        {/* Buckets container - where statements are sorted into */}
        <div className="statement-sorting__buckets">
          {_items.map((item, index) => (
            <div
              key={index}
              className={`bucket ${dragoverBucket === index ? 'is-dragover' : ''}`}
              data-index={index}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
            >
              <div className="bucket__title">{item.text}</div>
              <div className={`bucket__graphic${_isSubmitted ? '-hidden' : ''}`}>
                <img src={item._graphic.src} alt={item._graphic.alt} />
              </div>
              <div className="bucket__items">
                {item._statements && item._statements.map(statementIndex => {
                  const statement = _statements[statementIndex];
                  return statement
                    ? (
                      <div
                        key={statementIndex}
                        className={getStatementClass(statement)}
                        draggable={!_isSubmitted} // Only draggable if not submitted
                        onDragStart={(e) => handleDragStart(e, statementIndex)}
                      >
                        {statement.text}
                      </div>
                    )
                    : null;
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div className="btn__container statement-sorting__buttons">
          <button className="btn-text js-statement-sorting-submit" onClick={props.onSubmit}>
            { _buttons._submit.buttonText }
          </button>
          <button
            className={`btn-text js-statement-sorting-show-correct-answer ${isShowCorrectVisible ? '' : 'u-display-none'}`}
            onClick={props.onShowCorrectAnswer}
          >
            { _buttons._showCorrectAnswer.buttonText }
          </button>
          <button
            className={`btn-text js-statement-sorting-hide-correct-answer ${isHideCorrectVisible ? '' : 'u-display-none'}`}
            onClick={props.onHideCorrectAnswer}
          >
            { _buttons._hideCorrectAnswer.buttonText }
          </button>
          <button className="btn-text js-statement-sorting-reset" onClick={props.onReset}>
            { _buttons._reset.buttonText }
          </button>
        </div>
      </div>
    </div>
  );
};
