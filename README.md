# Statement Sorting Component

## Description

The Statement Sorting component is a drag and drop interaction that requires learners to match items with their corresponding statements. It provides an engaging way to test knowledge by having users categorize or associate related information.

## Functionality

- Learners drag items to match with correct statements
- Multiple correct statements can be associated with each item
- Optional graphics can be included for visual reinforcement
- Customizable feedback for correct and incorrect responses
- Configurable number of attempts
- Option to randomize items for varied practice
- Accessibility support with ARIA labels

## Installation

### Adapt Framework Version Compatibility
This component is compatible with version 5+ of the Adapt framework.

1. Download the ZIP file and extract it
2. Copy the extracted folder to `/src/components` in your Adapt authoring tool or framework
3. Restart the Adapt authoring tool (if necessary)

## Usage

### Basic Configuration

```json
{
  "_id": "c-100",
  "_parentId": "b-100",
  "_type": "component",
  "_component": "statementsorting",
  "_classes": "",
  "_layout": "full-width",
  "title": "Statement Sorting Example",
  "displayTitle": "Match the Statements",
  "body": "Demonstrate your knowledge by matching the following items to their correct statements.",
  "instruction": "Drag the correct items to each statement.",
  "_items": [
    {
      "text": "Category A",
      "acceptedStatements": [
        "This statement belongs to Category A",
        "This is another statement for Category A"
      ]
    },
    {
      "text": "Category B",
      "acceptedStatements": [
        "This statement belongs to Category B",
        "This is another statement for Category B"
      ]
    }
  ],
  "_attempts": 2,
  "_canShowModelAnswer": true,
  "_canShowFeedback": true,
  "_canShowMarking": true,
  "_isRandom": true
}
```

## Settings Overview

### Component Configuration
| Attribute                 | Type          | Description                                                   |
|---------------------------|---------------|---------------------------------------------------------------|
| `_component`              | String        | Must be set to: "statementsorting"                            |
| `_classes`                | String        | CSS classes to add to the component                           |
| `_layout`                 | String        | "full-width", "half-width" or "both"                          |
| `title`                   | String        | The title text displayed above the component                  |
| `displayTitle`            | String        | The title text displayed in the component                     |
| `body`                    | String        | Descriptive text explaining the component                     |
| `instruction`             | String        | Instructions for how to complete the activity                 |

### Items Configuration
| Attribute                 | Type          | Description                                                   |
|---------------------------|---------------|---------------------------------------------------------------|
| `_items`                  | Array         | Array of items to be sorted                                   |
| `_items[].text`           | String        | The category or classification text                           |
| `_items[].acceptedStatements` | Array     | Array of statement strings that belong to this category       |


### Interaction and Feedback
| Attribute                 | Type          | Description                                                   |
|---------------------------|---------------|---------------------------------------------------------------|
| `_attempts`               | Number        | Number of attempts allowed                                    |
| `_canShowModelAnswer`     | Boolean       | Allow model answer to be viewed                               |
| `_canShowFeedback`        | Boolean       | Show feedback when answer submitted                           |
| `_canShowMarking`         | Boolean       | Show ticks/crosses when answered                              |
| `_isRandom`               | Boolean       | Randomize the order of items                                  |
| `_recordInteraction`      | Boolean       | Record the learner's answer for reporting                     |
| `_questionWeight`         | Number        | Weight for this question in scoring                           |

### Feedback Configuration
| Attribute                       | Type    | Description                                            |
|---------------------------------|---------|--------------------------------------------------------|
| `_feedback.correct`             | String  | Feedback for correct answers                           |
| `_feedback._incorrect.final`    | String  | Feedback after all attempts used                       |
| `_feedback._incorrect.notFinal` | String  | Feedback when incorrect with attempts remaining        |

### Button Labels
| Attribute                              | Type    | Description                             |
|----------------------------------------|---------|-----------------------------------------|
| `_buttons._submit.buttonText`          | String  | Text for submit button                  |
| `_buttons._reset.buttonText`           | String  | Text for reset button                   |
| `_buttons._showCorrectAnswer.buttonText` | String | Text for show correct answer button    |
| `_buttons._hideCorrectAnswer.buttonText` | String | Text for hide correct answer button    |
| `_buttons._showFeedback.buttonText`    | String  | Text for show feedback button           |

## Accessibility
This component includes appropriate ARIA attributes and is designed to be accessible when used correctly:

- Use clear, descriptive text in statements
- Provide meaningful alternative text for any images
- Test with screen readers to ensure the drag and drop interaction is accessible

## Examples

### Knowledge Check
```json
{
  "_id": "c-200",
  "_component": "statementsorting",
  "title": "Transportation Quiz",
  "instruction": "Match each vehicle to its correct classification.",
  "_items": [
    {
      "text": "Land Vehicles",
      "acceptedStatements": [
        "Car", 
        "Train", 
        "Bicycle"
      ]
    },
    {
      "text": "Water Vehicles",
      "acceptedStatements": [
        "Ship", 
        "Submarine", 
        "Sailboat"
      ]
    },
    {
      "text": "Air Vehicles",
      "acceptedStatements": [
        "Airplane", 
        "Helicopter", 
        "Hot Air Balloon"
      ]
    }
  ]
}
```

### Language Learning
```json
{
  "_id": "c-300",
  "_component": "statementsorting",
  "title": "Language Classification",
  "instruction": "Match each language to its correct language family.",
  "_items": [
    {
      "text": "Romance Languages",
      "acceptedStatements": [
        "Spanish", 
        "French", 
        "Italian",
        "Portuguese"
      ]
    },
    {
      "text": "Germanic Languages",
      "acceptedStatements": [
        "English", 
        "German", 
        "Dutch",
        "Swedish" 
      ]
    }
  ]
}
```

## Limitations
 
- This component is designed for categorization tasks and may not be suitable for all learning objectives
- Complex interactions with multilevel categorization would require custom development

## Browser Specification

This component adheres to the browser specification given in the Adapt framework's [package.json](https://github.com/adaptlearning/adapt_framework/blob/master/package.json).