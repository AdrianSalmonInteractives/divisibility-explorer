let number;
let calculateButton, randomButton;
let results = [];
let missedRules = [];
let showWarning = false;
let calculationComplete = false;
let canvas;
let containerHeight = 0;
let warningMessage = '';
let infoText = "Divisibility rules are useful in mathematics, computer science, and everyday problem-solving when dealing with whole numbers!";
let ruleButtons = [];
let selectedRules = [];
let hoverBox;
let activeHoverButton = null;
let hoverTimeout;

const rules = {
  1: { description: "Any number is divisible by 1.", example: "15 ÷ 1 = 15 (no remainder)" },
  2: { description: "If the last digit is divisible by 2 (0, 2, 4, 6, or 8).", example: "24 is divisible by 2 because 4 is divisible by 2" },
  3: { description: "If the sum of its digits is divisible by 3.", example: "126 → 1+2+6 = 9, and 9 is divisible by 3" },
  4: { description: "If the number formed by the last two digits is divisible by 4.", example: "1624 is divisible by 4 because 24 is divisible by 4" },
  5: { description: "If the last digit is 0 or 5.", example: "125 is divisible by 5 because it ends in 5" },
  6: { description: "If it's divisible by both 2 and 3.", example: "126 is divisible by 6 because it's divisible by 2 and 3" },
  7: { description: "If 2 times the last digit subtracted from the rest is divisible by 7.", example: "371 → 37 - (2 * 1) = 35, which is divisible by 7" },
  8: { description: "If the number formed by the last three digits is divisible by 8.", example: "1624 is divisible by 8 because 624 is divisible by 8" },
  9: { description: "If the sum of its digits is divisible by 9.", example: "1647 → 1+6+4+7 = 18, and 18 is divisible by 9" },
  10: { description: "If the last digit is 0.", example: "1650 is divisible by 10 because it ends in 0" },
  11: { description: "If the alternating sum of its digits is divisible by 11.", example: "2376 → (2-3+7-6) = 0, which is divisible by 11" },
  12: { description: "If it's divisible by both 3 and 4.", example: "1236 is divisible by 12 because it's divisible by 3 and 4" }
};

function setup() {
  canvas = createCanvas(600, 900);
  textFont('Inter');  // Set the default font for the p5.js sketch
  textAlign(LEFT, TOP);
  
  number = createInput('');
  number.position(40, 350);
  number.size(400, 30);
  number.attribute('placeholder', 'Enter a number');
  applyInputStyle(number);
  
  randomButton = createButton('🔄 Random');
  randomButton.position(450, 350);
  randomButton.size(110, 30);
  applyButtonStyle(randomButton, '#0ea5e9');
  randomButton.mousePressed(generateRandomInput);
  
  createRuleButtons();
  
  calculateButton = createButton('Check Divisibility');
  calculateButton.position(40, 640);
  calculateButton.size(width - 80, 40);
  applyButtonStyle(calculateButton);
  calculateButton.mousePressed(handleCalculate);

  hoverBox = createDiv('');
  hoverBox.style('position', 'absolute');
  hoverBox.style('background-color', '#ffffff');
  hoverBox.style('border', '1px solid #9CA3AF'); 
  hoverBox.style('border-radius', '5px');
  hoverBox.style('padding', '10px');
  hoverBox.style('font-size', '14px');
  hoverBox.style('max-width', '250px');
  hoverBox.style('display', 'none');
  hoverBox.style('z-index', '100');
  hoverBox.style('box-shadow', '0 2px 10px rgba(0,0,0,0.1)');
  hoverBox.style('font-family', "'Inter', sans-serif");
}

function createRuleButtons() {
  const buttonWidth = (width - 100) / 3;
  const buttonHeight = 35;
  const spacing = 10;
  const startX = 40;
  const startY = 430;

  for (let i = 0; i < 12; i++) {
    let x = startX + (i % 3) * (buttonWidth + spacing);
    let y = startY + Math.floor(i / 3) * (buttonHeight + spacing);
    let ruleButton = createButton('Rule ' + (i + 1));
    ruleButton.position(x, y);
    ruleButton.size(buttonWidth, buttonHeight);
    ruleButton.class('rule-button rule-button-unselected');
    ruleButton.mousePressed(() => toggleRule(i + 1));
    
    ruleButton.mouseOver(() => {
      startHoverTimer(i + 1, ruleButton);
      if (selectedRules.includes(i + 1)) {
        ruleButton.style('background-color', '#0284c7'); 
      } else {
        ruleButton.style('background-color', '#bae6fd'); 
      }
    });
    
    ruleButton.mouseOut(() => {
      cancelHoverTimer();
      if (selectedRules.includes(i + 1)) {
        ruleButton.style('background-color', '#0ea5e9'); 
      } else {
        ruleButton.style('background-color', '#e0f2fe'); 
      }
    });
    
    ruleButtons.push(ruleButton);
  }
}

function applyRuleButtonStyle(button, isSelected) {
  if (isSelected) {
    button.class('rule-button rule-button-selected');
  } else {
    button.class('rule-button rule-button-unselected');
  }
}

function toggleRule(rule) {
  let index = selectedRules.indexOf(rule);
  let button = ruleButtons[rule - 1];
  
  if (index === -1) {
    selectedRules.push(rule);
    button.class('rule-button rule-button-selected');
    button.style('background-color', '#0ea5e9'); 
  } else {
    selectedRules.splice(index, 1);
    button.class('rule-button rule-button-unselected');
    button.style('background-color', '#e0f2fe'); 
  }
}

function applyInputStyle(input) {
  input.style('border', '1px solid #93c5fd');
  input.style('border-radius', '5px');
  input.style('padding', '5px 8px');
  input.style('box-sizing', 'border-box');
  input.style('font-size', '14px');
  input.style('font-family', "'Inter', sans-serif");
}

function applyButtonStyle(button, bgColor = '#071838') {
  button.style('background-color', bgColor);
  button.style('color', 'white');
  button.style('border', 'none');
  button.style('border-radius', '5px');
  button.style('cursor', 'pointer');
  button.style('font-size', '14px');
  button.style('font-weight', 'bold');
  button.style('padding', '0 5px');
  button.style('font-family', "'Inter', sans-serif");
}

function draw() {
  containerHeight = calculateContainerHeight();
  let infoTextHeight = drawWrappedText(infoText, 40, containerHeight + 20, width - 80, 14, color(0), true);
  let totalHeight = containerHeight + infoTextHeight + 40;
  
  if (totalHeight !== height) {
    resizeCanvas(600, totalHeight);
  }
  
  background(240);
  drawMainContainer();
  drawTitleSection();
  drawDefinitionBox();
  drawInputSection();
  drawRuleSelectionSection();
  drawHoverInformation();
  drawCalculateButton();
  if (showWarning) {
    drawWarningMessage();
  }
  drawResults();
  drawInfoText();
  
  if (activeHoverButton) {
    let buttonPos = activeHoverButton.position();
    let buttonSize = activeHoverButton.size();
    let hoverBoxSize = hoverBox.size();
    
    let hoverX = buttonPos.x + buttonSize.width / 2 - hoverBoxSize.width / 2;
    let hoverY = buttonPos.y - hoverBoxSize.height - 10;
    
    hoverBox.position(hoverX, hoverY);
  }
}

function drawCalculateButton() {
  if (calculateButton) {
    calculateButton.position(40, 640);
    calculateButton.size(width - 80, 40);
  } else {
    console.error("calculateButton is undefined in drawCalculateButton()");
  }
}

function calculateContainerHeight() {
  let baseHeight = 720;
  let resultBoxCount = 0;
  
  if (results && results.length > 0 || (missedRules && missedRules.length > 0)) {
    if (results.some(r => r.isDivisible)) resultBoxCount++;
    if (results.some(r => !r.isDivisible)) resultBoxCount++;
    if (missedRules && missedRules.length > 0) resultBoxCount++;
  }
  
  let resultsHeight = resultBoxCount * 73;
  let warningHeight = showWarning ? 30 : 0;
  
  return baseHeight + resultsHeight + warningHeight;
}

function drawMainContainer() {
  fill(255);
  stroke(220);
  rect(20, 20, width - 40, containerHeight - 40, 8);
}

function drawTitleSection() {
  fill('#e0f2fe');
  noStroke();
  rect(20, 20, width - 40, 100, 8, 8, 0, 0);
  
  fill('#075985');
  textSize(28);
  textAlign(LEFT, CENTER);
  textStyle(BOLD);
  text("Divisibility Explorer", 40, 60);
  
  textSize(16);
  textStyle(NORMAL);
  text('Check divisibility rules for any number!', 40, 95);
}

function drawDefinitionBox() {
  fill('#EFF6FF');
  stroke('#BFDBFE');
  strokeWeight(1);
  rect(40, 145, width - 80, 160, 5);
  strokeWeight(1);
  
  noStroke();
  fill('#1E40AF');
  textSize(16);
  textAlign(LEFT, TOP);
  textStyle(BOLD);
  text("Divisibility Rules Basics", 50, 160);
  
  fill('#3B82F6');
  textSize(14);
  textStyle(NORMAL);
  let yOffset = 185;
  let lineHeight = 20;
  let textWidth = width - 100;
  
  text("Divisibility rules are shortcuts to determine if a number is divisible by another without actually performing the division. They're based on the properties of numbers in our decimal system.", 50, yOffset, textWidth);
  
  yOffset += lineHeight * 3.5;
  
  text("Enter a number or use the random generator, then select the divisibility rules you think apply. Check your answer to see how well you did!", 50, yOffset, textWidth);
}

function drawInputSection() {
  fill('#1E40AF');
  textSize(16);
  textStyle(BOLD);
  text("Number to test:", 42, 325);
  textStyle(NORMAL);

  fill(255);
  stroke(220);
  rect(40, 350, 400, 30, 5);

  fill(150);
  textAlign(LEFT, CENTER);
  textSize(14);
  if (number.value() === '') {
    text('Enter a number', 50, 365);
  }

  fill('#0ea5e9');
  noStroke();
  rect(450, 350, 110, 30, 5);
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(14);
  text('🔄 Random', 505, 365);
}

function drawRuleSelectionSection() {
  fill('#1E40AF');
  textSize(16);
  textStyle(BOLD);
  text("Select applicable divisibility rules:", 170, 405);
  textStyle(NORMAL);
}

function drawWarningMessage() {
  fill('#DC2626');
  textAlign(CENTER, CENTER);
  textSize(14);
  text(warningMessage, width/2, 705);
}

function drawHoverInformation() {
  fill('#3B82F6');
  textAlign(CENTER, CENTER);
  textSize(14);
  text("Hover over a rule to see its description and an example.", width/2, 620);
}

function startHoverTimer(ruleNumber, button) {
  cancelHoverTimer();
  hoverTimeout = setTimeout(() => showHoverBox(ruleNumber, button), 500);
}

function cancelHoverTimer() {
  if (hoverTimeout) {
    clearTimeout(hoverTimeout);
    hoverTimeout = null;
  }
  hideHoverBox();
}

function drawResults() {
  if (results.length > 0 || missedRules.length > 0) {
    push();
    let yOffset = 700;
    
    const boxHeight = 60;
    const boxSpacing = 10;
    const inputNumber = number.value();

    function drawResultBox(title, backgroundColor, textColor, rules) {
      if (rules.length > 0) {
        noStroke();
        fill(backgroundColor);
        rect(40, yOffset, width - 80, boxHeight, 8);
        
        fill(textColor);
        noStroke();
        textAlign(LEFT, TOP);
        textStyle(BOLD);
        textSize(18);
        text(title, 60, yOffset + 10);
        
        fill(textColor);
        noStroke();
        textAlign(LEFT, BOTTOM);
        textStyle(NORMAL);
        textSize(14);
        text(`${inputNumber} is ${title.toLowerCase()} by ${rules.join(', ')}`, 60, yOffset + boxHeight - 10);
        
        yOffset += boxHeight + boxSpacing;
      }
    }

    const correctRules = results.filter(r => r.isDivisible).map(r => r.rule);
    drawResultBox("Correct", '#E6FFFA', '#16a34a', correctRules);

    const incorrectRules = results.filter(r => !r.isDivisible).map(r => r.rule);
    drawResultBox("Incorrect", '#FEE2E2', '#dc2626', incorrectRules);

    drawResultBox("Missed", '#FFF0DB', '#ca8a04', missedRules);

    pop();
  }
}

function drawInfoText() {
  drawWrappedText(infoText, 40, containerHeight + 20, width - 80, 14, color(0));
}

function drawWrappedText(str, x, y, maxWidth, fontSize, textColor, measureOnly = false) {
  push();
  textSize(fontSize);
  textAlign(CENTER, TOP);
  fill(textColor);
  
  let words = str.split(' ');
  let line = '';
  let lineHeight = fontSize * 1.2;
  let yPos = y;
  let height = 0;
  
  for (let i = 0; i < words.length; i++) {
    let testLine = line + words[i] + ' ';
    let testWidth = textWidth(testLine);
    
    if (testWidth > maxWidth) {
      if (!measureOnly) {
        text(line, x + maxWidth / 2, yPos);
      }
      yPos += lineHeight;
      height += lineHeight;
      line = words[i] + ' ';
    } else {
      line = testLine;
    }
  }
  if (!measureOnly) {
    text(line, x + maxWidth / 2, yPos);
  }
  height += lineHeight;
  
  pop();
  return height;
}

function handleCalculate() {
  const num = parseInt(number.value());
  
  if (isNaN(num) || num <= 0 || !Number.isInteger(num)) {
    warningMessage = 'Please enter a valid positive integer.';
    showWarning = true;
    results = [];
    missedRules = [];
    return;
  }
  
  if (selectedRules.length === 0) {
    warningMessage = 'Please select at least one divisibility rule to check.';
    showWarning = true;
    results = [];
    missedRules = [];
    return;
  }
  
  warningMessage = '';
  showWarning = false;
  
  let correctRules = [];
  let incorrectRules = [];

  selectedRules.forEach(rule => {
    const isDivisible = num % rule === 0;
    if (isDivisible) {
      correctRules.push(rule);
    } else {
      incorrectRules.push(rule);
    }
  });

  missedRules = Object.keys(rules)
    .map(Number)
    .filter(rule => !selectedRules.includes(rule) && num % rule === 0)
    .sort((a, b) => a - b);

  correctRules.sort((a, b) => a - b);
  incorrectRules.sort((a, b) => a - b);

  results = [
    ...correctRules.map(rule => ({ rule, isDivisible: true })),
    ...incorrectRules.map(rule => ({ rule, isDivisible: false }))
  ];

  calculationComplete = true;
}

function generateRandomInput() {
  let num = Math.floor(Math.random() * 1000) + 1;
  number.value(num.toString());
  
  warningMessage = '';
  showWarning = false;
  results = [];
  missedRules = [];
}

function windowResized() {
  let newHeight = calculateContainerHeight() + drawWrappedText(infoText, 40, containerHeight + 20, width - 80, 14, color(0), true) + 40;
  resizeCanvas(600, newHeight);
}

function showHoverBox(ruleNumber, button) {
  let rule = rules[ruleNumber];
  hoverBox.html(`
    <strong>Rule ${ruleNumber}:</strong><br>
    ${rule.description}<br><br>
    <strong>Example:</strong><br>
    ${rule.example}
  `);
  hoverBox.style('display', 'block');
  
  let buttonPos = button.position();
  let buttonSize = button.size();
  let hoverBoxSize = hoverBox.size();
  
  let hoverX = buttonPos.x + buttonSize.width / 2 - hoverBoxSize.width / 2;
  let hoverY = buttonPos.y - hoverBoxSize.height - 10; 
  
  hoverBox.position(hoverX, hoverY);
  activeHoverButton = button;
}

function hideHoverBox() {
  hoverBox.style('display', 'none');
  activeHoverButton = null;
}