import React, { useState, useRef, useEffect } from 'react';

export default function StatementSorting(props) {
  const {
    displayTitle,
    _buttons,
    body,
    instruction,
    instructionMobile,
    _items = [],
    _statements = [],
    _isSubmitted,
    _isModelAnswerShown,
    _canShowModelAnswer
  } = props;

  const [dragoverBucket, setDragoverBucket] = useState(null);
  const [selectedStatement, setSelectedStatement] = useState(null);
  const [justDroppedStatement, setJustDroppedStatement] = useState(null);
  const [justClickedBucket, setJustClickedBucket] = useState(null);
  const [readyForCorrectness, setReadyForCorrectness] = useState(false); // to delay class aplications Safari issue
  const [isTouchDevice, setIsTouchDevice] = useState(false); // Check if the device is touch-enabled
  const statementsRef = useRef(null);
  const bucketsRef = useRef(null);

  useEffect(() => { // Detect touch device on component mount
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  useEffect(() => {
    if (_isSubmitted) {
      // Give Safari a moment to process the state change
      const timer = setTimeout(() => {
        setReadyForCorrectness(true);
      }, 100); // 100ms delay

      return () => clearTimeout(timer);
    } else {
      setReadyForCorrectness(false);
    }
  }, [_isSubmitted]);

  // Generate statement className based on state
  const getStatementClass = (statement) => {
    if (!statement) return 'statement';

    let className = 'statement';

    if (_isSubmitted && readyForCorrectness) {
      if (_isModelAnswerShown) {
        // When showing model answer, all statements appear correct
        className += ' is-correct';
      } else {
        // When showing user's answer, show correct/incorrect state
        className += statement._isCorrect ? ' is-correct' : ' is-incorrect';
      }
    }

    className += statement._currentItemIndex !== null ? ' is-placed' : ' is-outside'; // additional styling

    // Add selected class if this statement is selected on mobile
    if (selectedStatement !== null && selectedStatement === parseInt(statement._index)) {
      className += ' is-selected';
    }

    // Add just-dropped class to highlight statements when placed
    if (justDroppedStatement !== null && justDroppedStatement === parseInt(statement._index)) {
      className += ' is-just-dropped';
    }

    return className;
  };

  // DESKTOP DRAG AND DROP HANDLERS
  const handleDragStart = (e, index) => {
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
    setDragoverBucket(bucketIndex);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragoverBucket(null);
  };

  const handleDrop = (e, bucketIndex) => {
    e.preventDefault();

    // If the component is submitted, don't allow dropping
    if (_isSubmitted) {
      return false;
    }

    const statementIndex = parseInt(e.dataTransfer.getData('text/plain'));
    setDragoverBucket(null);

    if (props.moveStatementToBucket) {
      props.moveStatementToBucket(statementIndex, bucketIndex);
    }
  };

  // MOBILE CLICK HANDLERS
  const handleStatementClick = (index) => {
    if (_isSubmitted) return false;

    // Clear any previously just-dropped state
    setJustDroppedStatement(null);

    // Toggle selection
    if (selectedStatement === index) {
      setSelectedStatement(null);
    } else {
      setSelectedStatement(index);
    }
  };

  const handleBucketClick = (bucketIndex) => {
    if (_isSubmitted || selectedStatement === null) return false;

    // Set the just-clicked bucket state
    setJustClickedBucket(bucketIndex);

    // Move the selected statement to the clicked bucket
    if (props.moveStatementToBucket) {
      props.moveStatementToBucket(selectedStatement, bucketIndex);

      // Set the just-dropped state before clearing selection
      setJustDroppedStatement(selectedStatement);
      setSelectedStatement(null); // Clear selection after placement

      // Clear the visual feedback states after a short delay
      setTimeout(() => {
        setJustDroppedStatement(null);
        setJustClickedBucket(null);
      }, 300); // timeout for highlight
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

        {(instruction || (instructionMobile && isTouchDevice && !_isSubmitted)) && (
          <div className="component__instruction">
            {instruction && !isTouchDevice && (
              <div
                className="component__instruction-inner"
                dangerouslySetInnerHTML={{ __html: instruction }}
              />
            )}
            {instructionMobile && isTouchDevice && !_isSubmitted && (
              <div
                className="component__instruction-inner"
                dangerouslySetInnerHTML={{ __html: instructionMobile }}
              />
            )}
          </div>
        )}
      </div>

      <div className={`component__widget statement-sorting__widget ${_isSubmitted ? 'is-submitted' : ''} ${_isModelAnswerShown ? 'is-showing-model-answer' : ''} ${isTouchDevice ? 'is-touch-device' : ''}`}>

        {/* Statements container - where statements start */}
        <div
          className={`statement-sorting__statements${_isSubmitted ? '-hidden' : ''}`}
          ref={statementsRef}
        >
          {_statements.map((statement, index) => {
            // Assign index to statement for reference
            if (!statement._index) statement._index = index;

            return statement._currentItemIndex === null
              ? (
                <div
                  key={index}
                  data-index={index}
                  className={getStatementClass(statement)}
                  draggable={!_isSubmitted && !isTouchDevice} // Only draggable on desktop
                  onDragStart={(e) => handleDragStart(e, index)}
                  onClick={isTouchDevice ? () => handleStatementClick(index) : undefined}
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
              : null;
          })}
        </div>

        {/* Feedback area */}
        <div className="statement-sorting__feedback u-display-none"></div>

        {/* Buckets container - where statements are sorted into */}
        <div className="statement-sorting__buckets" ref={bucketsRef}>
          {_items.map((item, index) => (
            <div
              key={index}
              className={`bucket 
                ${dragoverBucket === index ? 'is-dragover' : ''} 
                ${selectedStatement !== null && isTouchDevice ? 'is-selectable' : ''}
                ${justClickedBucket === index ? 'is-just-clicked' : ''}
              `}
              data-index={index}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              onClick={isTouchDevice ? () => handleBucketClick(index) : undefined}
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
                        draggable={!_isSubmitted && !isTouchDevice} // Only draggable on desktop
                        onDragStart={(e) => handleDragStart(e, statementIndex)}
                        onClick={isTouchDevice ? () => handleStatementClick(statementIndex) : undefined}
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