import React, { useState, useRef, useEffect } from 'react';

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
  const [activeTouchStatement, setActiveTouchStatement] = useState(null);
  const [touchPosition, setTouchPosition] = useState({ x: 0, y: 0 });
  const statementsRef = useRef(null);
  const bucketsRef = useRef(null);
  
  // Check if the device is touch-enabled
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  
  useEffect(() => {
    // Detect touch device on component mount
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

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
    
    // Add touch-active class if this statement is being touched
    if (activeTouchStatement !== null && activeTouchStatement === parseInt(statement._index)) {
      className += ' is-touch-active';
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

  // MOBILE TOUCH HANDLERS
  const handleTouchStart = (e, index) => {
    if (_isSubmitted) return false;
    
    // Prevent default to avoid scrolling while dragging
    e.preventDefault();
    e.stopPropagation();
    
    const touch = e.touches[0];
    setActiveTouchStatement(index);
    setTouchPosition({
      x: touch.clientX,
      y: touch.clientY
    });
    
    // Create a clone of the statement for dragging visuals if needed
    const statementElement = e.currentTarget;
    statementElement.style.opacity = '0.6';
    
    // Add a class to the body to prevent scrolling during drag
    document.body.classList.add('no-scroll');
    
    // Set overscroll behavior to prevent pull-to-refresh
    document.documentElement.style.overscrollBehavior = 'none';
    document.body.style.overscrollBehavior = 'none';
    
    // For iOS Safari which might not support overscrollBehavior
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    
    // Store the current scroll position so we can restore it later
    document.body.dataset.scrollY = window.scrollY.toString();
  };

  const handleTouchMove = (e) => {
    if (activeTouchStatement === null || _isSubmitted) return;
    
    // Prevent scrolling while dragging - add passive: false to make it more effective
    e.preventDefault();
    e.stopPropagation();
    
    const touch = e.touches[0];
    setTouchPosition({
      x: touch.clientX,
      y: touch.clientY
    });
    
    // Check if touch is over any bucket
    if (bucketsRef.current) {
      const bucketElements = bucketsRef.current.querySelectorAll('.bucket');
      let foundBucket = false;
      
      bucketElements.forEach((bucket, index) => {
        const rect = bucket.getBoundingClientRect();
        if (
          touch.clientX >= rect.left &&
          touch.clientX <= rect.right &&
          touch.clientY >= rect.top &&
          touch.clientY <= rect.bottom
        ) {
          setDragoverBucket(index);
          foundBucket = true;
        }
      });
      
      if (!foundBucket) {
        setDragoverBucket(null);
      }
    }
  };

  const handleTouchEnd = (e) => {
    // Always restore scrolling capability regardless of state
    document.body.classList.remove('no-scroll');
    document.documentElement.style.overscrollBehavior = '';
    document.body.style.overscrollBehavior = '';
    
    // Restore position for iOS Safari
    document.body.style.position = '';
    document.body.style.width = '';
    document.body.style.top = '';
    
    // Restore the scroll position
    if (document.body.dataset.scrollY) {
      window.scrollTo(0, parseInt(document.body.dataset.scrollY || '0'));
      document.body.dataset.scrollY = '';
    }
    
    if (activeTouchStatement === null || _isSubmitted) {
      setActiveTouchStatement(null);
      return;
    }
    
    // If we have a bucket in dragover state, drop into that bucket
    if (dragoverBucket !== null && props.moveStatementToBucket) {
      props.moveStatementToBucket(activeTouchStatement, dragoverBucket);
    }
    
    // Reset drag states
    setActiveTouchStatement(null);
    setDragoverBucket(null);
    
    // Reset the statement opacity if a reference exists
    if (statementsRef.current) {
      const statements = statementsRef.current.querySelectorAll('.statement');
      statements.forEach(statement => {
        statement.style.opacity = '1';
      });
    }
  };

  const isShowCorrectVisible = _isSubmitted && _canShowModelAnswer && !_isModelAnswerShown;
  const isHideCorrectVisible = _isSubmitted && _canShowModelAnswer && _isModelAnswerShown;

  // Render touch guide if on a touch device and not submitted
  const renderTouchGuide = () => {
    if (isTouchDevice && !_isSubmitted) {
      return (
        <div className="statement-sorting__touch-guide">
          <p>Tap and hold a statement to drag it to a bucket</p>
        </div>
      );
    }
    return null;
  };

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

      {/* Touch guide for mobile users */}
      {renderTouchGuide()}

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
                  draggable={!_isSubmitted && !isTouchDevice} // Only draggable on desktop if not submitted
                  onDragStart={(e) => handleDragStart(e, index)}
                  onTouchStart={(e) => handleTouchStart(e, index)}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
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
          })}
          
          {/* Show a floating statement when dragging on touch devices */}
          {activeTouchStatement !== null && (
            <div 
              className="statement statement-touch-clone"
              style={{
                position: 'fixed',
                left: touchPosition.x,
                top: touchPosition.y,
                transform: 'translate(-50%, -50%)',
                zIndex: 1000,
                pointerEvents: 'none',
                width: '200px',
                opacity: 0.8
              }}
            >
              {_statements[activeTouchStatement] && _statements[activeTouchStatement].text}
            </div>
          )}
        </div>

        {/* Feedback area */}
        <div className="statement-sorting__feedback u-display-none"></div>

        {/* Buckets container - where statements are sorted into */}
        <div className="statement-sorting__buckets" ref={bucketsRef}>
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
                        draggable={!_isSubmitted && !isTouchDevice} // Only draggable on desktop if not submitted
                        onDragStart={(e) => handleDragStart(e, statementIndex)}
                        onTouchStart={(e) => handleTouchStart(e, statementIndex)}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
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