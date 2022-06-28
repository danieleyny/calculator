const tooltip = document.querySelector('.tooltip');
const copyText = document.getElementById('copy-text');
const shareLink = document.getElementById('share-link');

// configuration for autonumeric library (currency)
export const amountConfig = {
  decimalPlaces: 0,
  decimalPlacesRawValue: 0,
  minimumValue: "-100000000000000",
  maximumValue: "1000000000000000",
  modifyValueOnWheel: false
};
// add thousand separators to numbers
export const numberWithCommas = (x) => {
  x = x.toString();
  const pattern = /(-?\d+)(\d{3})/;
  while (pattern.test(x))
      x = x.replace(pattern, "$1,$2");
  return x;
}
// Limit input to accept only Integer value
export const validateInteger = (e) => {
  const i = e.value;
  e.value = parseInt(i, 10);
}
// Limit input to accept only upto 2 decimal places
export const validateFloating = (e) => {
  const t = e.target.value;

  if (t.indexOf(".") >= 0) {
    e.target.value = t.substr(0, t.indexOf(".")) + t.substr(t.indexOf("."), 3);
  }
}
// Add HTML element to the DOM to show warning
export const insertWarningMessage = (element, message, color = 'orange') => { 
  if (element.style.borderColor !== color) { 
    element.style.borderColor = color;
    element.parentNode.insertAdjacentHTML('afterend', `<div class="warning-message">${message}</div>`);
  }
}
// Remove HTML element from the DOM
export const removeWarningMessage = (element) => { 
  const warningMessage = element.parentNode.nextElementSibling;
  if (warningMessage && warningMessage.classList.value === 'warning-message') {
    element.style.borderColor = '';
    warningMessage.remove();
  }
}
// Add HTML element to show error message
export const insertErrorMessage = (e, message) => {
  const inputContainer = e.target.parentElement.parentElement;
  const inputContainerChlidren = inputContainer.childNodes;
  const isErrorMessageExist = Array.from(inputContainerChlidren).some(child => child.classList &&
  
  child.classList.contains('error-label'));

  if (!isErrorMessageExist) {
    e.target.style.borderColor = 'red';
    const errorMessage = document.createElement('div');
    errorMessage.classList.add('error-label');
    errorMessage.innerText = message;
    if (e.target.parentNode.classList.value === 'input-container') {
      e.target.parentNode.appendChild(errorMessage);
    } else {
      e.target.parentNode.parentNode.appendChild(errorMessage);
    }
  }
}
// Remove HTML element which shows error message
export const removeErrorMessage = (e) => {
  const inputContainer = e.target.parentElement.parentElement;
  const inputContainerChlidren = inputContainer.childNodes;
  const isErrorMessageExist = Array.from(inputContainerChlidren).some(child => child.classList && child.classList.contains('error-label'));
  
  if (isErrorMessageExist) {
    e.target.style.borderColor = "";
    let errorMessage;
    if (e.target.parentNode.classList.value === 'input-container') { 
      errorMessage = e.target.parentNode.querySelector('.error-label');
      errorMessage && e.target.parentNode.removeChild(errorMessage);
    } else {
      errorMessage = e.target.parentNode.parentNode.querySelector('.error-label');
      errorMessage && e.target.parentNode.parentNode.removeChild(errorMessage);
    }
  }
}
// Limit percentage input to accept in range 0-100
export const validatePercentage = (e) => {
  const val = e.target.value;
  if (val < 0 || val > 100) {
    e.target.value = 100;
    insertErrorMessage(e, 'Please select a value between 0 and 100.');
  } else {
    removeErrorMessage(e);
  }
}
// Make sure amount value does not exceed 100,000,000,000,000
export const validateAmount = (e) => {
  let val = e.target.value;

  if (parseInt(val.replace(/,/g, ""), 10) > 100000000000000) {
    e.target.value = '100,000,000,000,000';
    insertErrorMessage(e, 'Please select a value less than 100,000,000,000,000.');
  } else {
    removeErrorMessage(e);
  }
}
// Generate sharable link for the current page
export const generateSharableLink = (url, elementArray) => { 
  let params = new URLSearchParams(url.search);
  
  elementArray.forEach(element => {
    const id = element?.domElement ? element.domElement.id : element.id;
    const value = element?.domElement ? '$' + element.domElement.value : element.value;

    if(value) {
      if (params.has(id)) {
        params.set(id, value);
      } else {
        params.append(id, value);
      }
    }
  });

  return 'https://' + url.host + url.pathname + '?' + params.toString();
}
// Get parmaeter values from URL and insert into respective fields and calculate result by calling required function
export const parseFromUrl = (link, callBackArray) => {
  let url = new URL(link);
  const params = new URLSearchParams(url.search);

  params.forEach((value, key) => {
    let element = document.getElementById(key);

    if (value.includes('$')) {
      AutoNumeric.set(element, value.replace(/\$|,/g, ''));
    } else {
      element.value = value;
    }
  });

  callBackArray.forEach(callback => callback());
}
// copy text to clipboard
export const copyToClipboard = (copyText) => {
  copyText.select();
  copyText.setSelectionRange(0, 99999); /* For mobile devices */
   /* Copy the text inside the text field */
  navigator.clipboard.writeText(copyText.value);
}
// Add event listener to input fields to validate amount
document.querySelectorAll('.validate-amount').forEach(element => element.addEventListener('input', validateAmount, false));
// Add event listner to all input fields to accept upto 2 decimal places
document.querySelectorAll('.float-field').forEach(element => element.addEventListener('input', validateFloating, false));
// Add event listner to validate percent value to keep between between 0 and 100
document.querySelectorAll('.validate-percent').forEach(element => element.addEventListener('input', validatePercentage, false));
// Add event listner to copy Text to Clipboard
copyText.addEventListener('click', async () => {
  copyToClipboard(shareLink);
  tooltip.innerText = 'Copied!'
  setTimeout(() => {
    tooltip.innerText = 'Copy to clipboard';
    shareLink.style.width = '0%';
    shareLink.style.padding = '0';
    copyText.style.opacity = '0';
  }, 1500);
});

export const renderCopyDownIcon = (node) => {
  const iconSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  const iconPath = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'path'
  );

  iconSvg.setAttribute('fill', 'currentColor');
  iconSvg.setAttribute('viewBox', '0 0 384 512');
  iconSvg.setAttribute('stroke', 'black');
  iconSvg.classList.add('copy-down-icon');

  iconPath.setAttribute(
    'd',
    'M224 136V0H24C10.7 0 0 10.7 0 24v464c0 13.3 10.7 24 24 24h336c13.3 0 24-10.7 24-24V160H248c-13.2 0-24-10.8-24-24zm76.45 211.36l-96.42 95.7c-6.65 6.61-17.39 6.61-24.04 0l-96.42-95.7C73.42 337.29 80.54 320 94.82 320H160v-80c0-8.84 7.16-16 16-16h32c8.84 0 16 7.16 16 16v80h65.18c14.28 0 21.4 17.29 11.27 27.36zM377 105L279.1 7c-4.5-4.5-10.6-7-17-7H256v128h128v-6.1c0-6.3-2.5-12.4-7-16.9z'
  );
  iconPath.setAttribute('aria-hidden', 'true');
  iconPath.setAttribute('focusable', 'false');
  iconPath.setAttribute('stroke-width', '2');

  iconSvg.appendChild(iconPath);

  node.appendChild(iconSvg);

  return iconSvg;
}

export const renderDeleteIcon = (node) => { 
  const iconSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  const iconPath = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'path'
  );

  iconSvg.setAttribute('fill', 'currentColor');
  iconSvg.setAttribute('viewBox', '0 0 640 512');
  iconSvg.setAttribute('stroke', 'black');
  iconSvg.classList.add('delete-icon');

  iconPath.setAttribute(
    'd',
    'M 576 64 H 205.26 A 63.97 63.97 0 0 0 160 82.75 L 9.37 233.37 c -12.5 12.5 -12.5 32.76 0 45.25 L 160 429.25 c 12 12 28.28 18.75 45.25 18.75 H 576 c 35.35 0 64 -28.65 64 -64 V 128 c 0 -35.35 -28.65 -64 -64 -64 Z m -84.69 254.06 c 6.25 6.25 6.25 16.38 0 22.63 l -22.62 22.62 c -6.25 6.25 -16.38 6.25 -22.63 0 L 384 301.25 l -62.06 62.06 c -6.25 6.25 -16.38 6.25 -22.63 0 l -22.62 -22.62 c -6.25 -6.25 -6.25 -16.38 0 -22.63 L 338.75 256 l -62.06 -62.06 c -6.25 -6.25 -6.25 -16.38 0 -22.63 l 22.62 -22.62 c 6.25 -6.25 16.38 -6.25 22.63 0 L 384 210.75 l 62.06 -62.06 c 6.25 -6.25 16.38 -6.25 22.63 0 l 22.62 22.62 c 6.25 6.25 6.25 16.38 0 22.63 L 429.25 256 l 62.06 62.06 Z'
  );
  iconPath.setAttribute('aria-hidden', 'true');
  iconPath.setAttribute('focusable', 'false');
  iconPath.setAttribute('stroke-width', '2');

  iconSvg.appendChild(iconPath);

  node.appendChild(iconSvg);

  return iconSvg;
}

export const PV = (rate, nper, pmt, fv, type) => {
  type = typeof type === "undefined" ? 0 : type;
  fv = typeof fv === "undefined" ? 0 : fv;

  if (rate === 0) {
    return -pmt * nper - fv;
  } else {
    
    var tempVar = type !== 0 ? 1 + rate : 1;
    var tempVar2 = 1 + rate;
    var tempVar3 = Math.pow(tempVar2, nper);

    return -(fv + pmt * tempVar * ((tempVar3 - 1) / rate)) / tempVar3;
  }
};

export const FV = (rate, nper, pmt, pv, type) => {
  type = typeof type === "undefined" ? 0 : type;

  if (rate === 0) {
    return -pv - pmt * nper;
  } else {
    
    var tempVar = type !== 0 ? 1 + rate : 1;
    var tempVar2 = 1 + rate;
    var tempVar3 = Math.pow(tempVar2, nper);

    return -pv * tempVar3 - (pmt / rate) * tempVar * (tempVar3 - 1);
  }
};

const EVALRATE = (rate, nper, pmt, pv, fv, type) => {
  if (rate === 0) {
    return pv + pmt * nper + fv;
  } else {
    var tempVar3 = rate + 1;
    var tempVar = Math.pow(tempVar3, nper);

    var tempVar2 = type !== 0 ? 1 + rate : 1;

    return pv * tempVar + pmt * tempVar2 * (tempVar - 1) / rate + fv;
  }
};

export const RATE = (nper, pmt, pv, fv, type, guess) => {
  type = typeof type === "undefined" ? 0 : type;
  fv = typeof fv === "undefined" ? 0 : fv;
  guess = typeof guess === "undefined" ? 0.1 : guess;

  if (nper <= 0) {
    return "Error - invalid Period"
  }

  // Variables for epsilon max and step from Microsoft reference docs.
  var epslMax = 0.0000001;
  var step = 0.00001;
  // Microsoft reference docs show 40 iterations (i = 0 to 39)
  // But I was running into undefined errors when the Guess was
  // Far off the actual Rate.  Increasing the iterations to 129
  // (i = 0 to 128) allowed enough iterations to get rates
  // Within 8 decimal places of Excel for my test suite.
  var iterMax = 128;

  var Rate0 = guess;
  var Y0 = EVALRATE(Rate0, nper, pmt, pv, fv, type);

  var Rate1 = Y0 > 0 ? Rate0 / 2 : Rate0 * 2;
  var Y1 = EVALRATE(Rate1, nper, pmt, pv, fv, type);

  var i = 0;

  while (i < iterMax) {
    if (Y1 === Y0) {
      Rate0 = Rate0 < Rate1 ? Rate0 - step : Rate0 - step * -1;

      Y0 = EVALRATE(Rate0, nper, pmt, pv, fv, type);
    }

    if (Y1 === Y0) {
      return "#NUM!";
    }

    Rate0 = Rate1 - (Rate1 - Rate0) * Y1 / (Y1 - Y0);
    Y0 = EVALRATE(Rate0, nper, pmt, pv, fv, type);
    
    if (Math.abs(Y0) < epslMax) {
      return Rate0;
    } else {
      var tempVar = Y0;
      Y0 = Y1;
      Y1 = tempVar;
      tempVar = Rate0;
      Rate0 = Rate1;
      Rate1 = tempVar;
    }
    i++;
  }
};

const InternalPV = (values, guess) => {
  guess = typeof guess === "undefined" ? 0.1 : guess;

  let lowerBound = 0;
  let upperBound = values.length - 1;

  let tempTotal = 0
  let divRate = 1 + guess;

  while (lowerBound <= upperBound && values[lowerBound] === 0) {
    lowerBound++;
  }

  let i = upperBound;
  let step = -1

  while (i >= lowerBound) {
    tempTotal = tempTotal / divRate;
    tempTotal = tempTotal + values[i];
    i = i + step;
  }
  return tempTotal;
}

const EVALNPV = (rate, values, npvType, lowerBound, upperBound) => {
  let tempVar = 1;
  let tempTotal = 0;
  let i = lowerBound;

  while (i <= upperBound) {
    let tempVar2 = values[i];
    tempVar = tempVar + tempVar * rate;

    if (! (npvType > 0 &&  tempVar2 > 0) || ! (npvType < 0 && tempVar2 < 0)) {
      tempTotal = tempTotal + tempVar2 / tempVar;
    }
    i++
  }
  return tempTotal
}

export const NPV = (values, rate) => {
  values = values.slice(1);
  let lowerBound = 0;
  let upperBound = values.length -1;
  let tempVar = upperBound - lowerBound + 1;

  if (tempVar < 1) {
    return "Error - Invalid Values"
  }

  if (rate === -1) {
    return "Error - Invalid Rate"
  }

  return EVALNPV(rate, values, 0, lowerBound, upperBound);
}

export const IRR = (values, guess) => {
  guess = typeof guess === "undefined" ? 0.1 : guess;

  let epslMax = 0.0000001;
  let step = 0.00001;
  let iterMax = 39;

  //Check for valid inputs
  if (guess <= -1) {
    return "Error - invalid guess";
  }

  if (values.length < 1) {
    return null;
  }

  //Scale up the Epsilon Max based on cash flow values
  let tempVar = values[0] > 0 ? values[0] : values[0] * -1;
  let i = 0;

  while (i < values.length) {
    if (Math.abs(values[i]) > tempVar) {
      tempVar = Math.abs(values[i]);
    }
    i++;
  }

  let tempNpvEpsl = tempVar * epslMax * 0.01

  let tempRate0 = guess;
  let tempNpv0 = InternalPV(values, tempRate0);

  let tempRate1 = tempNpv0 > 0 ? tempRate0 + step : tempRate0 - step;

  if (tempRate1 <= -1) {
    return "Error - invalid values";
  }

  let tempNpv1 = InternalPV(values, tempRate1);

  i = 0;

  while (i <= iterMax) {
    if (tempNpv1 === tempNpv0) {
      tempRate0 = tempRate1 > tempRate0 ? tempRate0 - step : tempRate0 + step;

      tempNpv0 = InternalPV(values, tempRate0);

      if (tempNpv1 === tempNpv0) {
        return "Error - invalid values";
      }
    }
    
    tempRate0 = tempRate1 - (tempRate1 - tempRate0) * tempNpv1 / (tempNpv1 - tempNpv0);

    //Secant method
    if (tempRate0 <= -1) {
      tempRate0 = (tempRate1 - 1) * 0.5;
    }

    //Give the algorithm a second chance...
    tempNpv0 = InternalPV(values, tempRate0);
    tempVar = tempRate0 > tempRate1 ? tempRate0 - tempRate1 : tempRate1 - tempRate0;
    
    let tempVar2 = tempNpv0 > 0 ? tempNpv0 : tempNpv0 * -1;

    //Test for npv = 0 and rate convergence
    if (tempVar2 < tempNpvEpsl && tempVar < epslMax) {
      return tempRate0;
    }
    //Transfer values and try again...
    tempVar = tempNpv0;
    tempNpv0 = tempNpv1;
    tempNpv1 = tempVar;
    tempVar = tempRate0;
    tempRate0 = tempRate1;
    tempRate1 = tempVar;

    i++;

  }
  return "Error - iterMax exceeded"
}

const npv = (values, rate) => values.reduce(
  (acc, curr, i) => acc + (curr / (1 + rate) ** i),
  0
);

export const MIRR = (values, financeRate, reinvestRate) => {
  let positive = false;
  let negative = false;
  for (let i = 0; i < values.length; i++) {
    if (values[i] > 0) {
      positive = true;
    }
    if (values[i] < 0) {
      negative = true;
    }
  }

  // Return error if values does not contain at least one
  // positive value and one negative value
  if (!positive || !negative) {
    return Number.NaN;
  }

  const numer = Math.abs(npv(values.map((x) => x > 0 ? x : 0), reinvestRate));
  const denom = Math.abs(npv(values.map(x => x < 0 ? x : 0), financeRate));
  return (numer / denom) ** (1 / (values.length - 1)) * (1 + reinvestRate) - 1;
}

export const PMT = (rate, nper, pv, fv, type) => {
  type = typeof type === "undefined" ? 0 : type;
  fv = typeof fv === "undefined" ? 0 : fv;
  
  if (rate === 0) {
    return (-fv - pv) / nper;
  } else {

    var tempVar = type !== 0 ? 1 + rate : 1;
    var tempVar2 = rate + 1;
    var tempVar3 = Math.pow(tempVar2, nper);

    return ((-fv - pv * tempVar3) / (tempVar * (tempVar3 - 1))) * rate;
  }
};

export const NPER = (rate, pmt, pv, fv, type) => {
  type = typeof type === "undefined" ? 0 : type;
  fv = typeof fv === "undefined" ? 0 : fv;

  if (rate === 0) {
    if (pmt === 0) {
      return "Error - Payment cannot be 0";
    } else {
      return -(pv + fv) / pmt;
    }
  } else {
    var tempVar = type !== 0 ? pmt * (1 + rate) / rate : pmt / rate;
  }

  var tempVarFV = -fv + tempVar;
  var tempVarPV = pv + tempVar;

  // Test to ensure values fit within log() function
  if (tempVarFV < 0 && tempVarPV < 0) {
    tempVarFV = tempVarFV * -1;
    tempVarPV = tempVarPV * -1;
  } else if (tempVarFV <=0 || tempVarPV <= 0) {
    return "Error - Cannot Calculate NPER";
  }

  var tempVar2 = rate + 1;

  return (Math.log(tempVarFV) - Math.log(tempVarPV)) / Math.log(tempVar2);
};