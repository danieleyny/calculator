import { renderDeleteIcon, amountConfig, numberWithCommas, validateAmount, insertErrorMessage, removeErrorMessage, insertWarningMessage, removeWarningMessage, PMT } from "./utils.js";
/* --------------------Building Data-------------------------- */
const buildingDataInputContainer = document.querySelector('.building-data-inputs-container');
const resultantBuildingDataContainer = document.querySelector('.resultant-building-data-container');
const addNewRowButton = document.getElementById('add-new-row');
const totalUnits = document.getElementById('total-units');
const totalRent = document.getElementById('total-rent');
const totalAnnualRent = document.getElementById('total-annual-rent');
// share link
const shareResultButton = document.getElementById('share-result');
const shareLink = document.getElementById('share-link');
const copyText = document.getElementById('copy-text');
const url = new URL(window.location.href);
// building data input selectors
const buildingDataInputSelectors = ['.unit-type-br', '.unit-type-ba', '.number-of-units', '.average-rent-per-month'];
// validate br and ba values
const validatebrba = (e) => { 
  let value = e.target.value;
  let inputContainer = e.target.closest(".input-container");
  let errorMessage = document.createElement('div');
  errorMessage.classList.add('error-label');
  errorMessage.innerText = 'Please select a value between 0 and 10 (inclusive)';
  let isErrorLablePresent = inputContainer.lastChild.classList ? true : false;
  
  if (value > 10) {
    e.target.value = 10;
    e.target.style.borderColor = 'red';
    if(!isErrorLablePresent) inputContainer.appendChild(errorMessage);
  } else {
    e.target.style.borderColor = '';
    if(isErrorLablePresent) inputContainer.removeChild(inputContainer.lastChild);
  }
}
// remove event listeners from inputs when row is deleted
const removeAllInputsEventListeners = (id) => { 
  const br = document.getElementById(`unit-type-br-${id}`);
  const ba = document.getElementById(`unit-type-ba-${id}`);
  
  [br, ba].forEach(element => element.removeEventListener('input', handleBrBaInputs, false));

  const numberOfUnits = document.getElementById(`number-of-units-${id}`);
  numberOfUnits.removeEventListener('input', handleNumberOfUnits, false);

  const averageRentPerMonth = document.getElementById(`average-rent-per-month-${id}`);
  averageRentPerMonth.removeEventListener('input', handleAverageRentPerMonth, false);
}
// delete row from input container & result container
const deleteRowFromContainer = (id) => { 
  let row = document.getElementById(`row-${id}`);
  buildingDataInputContainer.removeChild(row);
  row = document.getElementById(`resultant-row-${id}`);
  resultantBuildingDataContainer.removeChild(row);
}
// add new row to input container
const addNewRowToContainer = (id) => {   
  const row = document.createElement('div');
  row.classList.add('row');
  row.id = `row-${id}`;
  row.innerHTML = `
    <div class="input-container">
      <div class="input-label">
        <label for="unit-type">Unit Type</label>
      </div>
      <div class="input-wrapper">
        <div class="input-row">
          <span class="rounded-left">br</span>
          <input type="number" name="unit-type" id="unit-type-br-${id}" class="unit-type-br short-input rounded-right" placeholder="0" min="0" step="1" />
        </div>
        <div class="input-row">
          <input type="number" name="unit-type" id="unit-type-ba-${id}" class="unit-type-ba short-input rounded-left" placeholder="0" min="0" step="1" />
          <span class="rounded-right">ba</span>
        </div>
      </div>
    </div>

    <div class="input-container">
      <div class="input-label">
        <label for="number-of-units">Number of Units</label>
      </div>
      <div class="input-wrapper">
        <input type="number" name="number-of-units" id="number-of-units-${id}" class="number-of-units" placeholder="0" min="0" step="1" />
      </div>
    </div>

    <div class="input-container">
      <div class="input-label">
        <label for="average-rent-per-month">Average Rent per Month</label>
      </div>
      <div class="input-wrapper">
        <span class="rounded-left">$</span>
        <input type="text" name="average-rent-per-month" id="average-rent-per-month-${id}" class="average-rent-per-month rounded-right" min="0" step="1" placeholder="0" />
      </div>
    </div>
  `;

  const deleteIcon = renderDeleteIcon(row);
  deleteIcon.addEventListener('click', () => { 
    removeAllInputsEventListeners(id);
    deleteRowFromContainer(id)
    updateTotalValues();
  });

  buildingDataInputContainer.appendChild(row);
  const averageRentPerMonth = new AutoNumeric(`#average-rent-per-month-${id}`, amountConfig);
  averageRentPerMonth.domElement.addEventListener('input', validateAmount);
}
// add new row to result container
const addNewRowToResultantContainer = (id) => { 
  const row = document.createElement('div');
  row.classList.add('resultant-building-data-container-row');
  row.id = `resultant-row-${id}`;
  row.innerHTML = `
    <h4 id="resultant-unit-type-${id}">0 br / 0 ba</h4>
    <h4 id="resultant-number-of-units-${id}">0</h4>
    <h4 id="resultant-average-rent-per-month-${id}">$0</h4>
    <h4 id="total-annual-rent-${id}" class="total-annual-rent">$0</h4>
  `;

  resultantBuildingDataContainer.appendChild(row);
}
// calculate and update `total units`, `total average rent per month` and `total annual rent` on result container
const updateTotalValues = () => { 
  const numberOfUnits = document.querySelectorAll('.number-of-units');
  const totalNumberOfUnits = Array.from(numberOfUnits).reduce((acc, curr) => acc + (parseInt(curr.value) || 0), 0);
  totalUnits.innerText = numberWithCommas(totalNumberOfUnits);

  const averageRentPerMonth = document.querySelectorAll('.average-rent-per-month');
  const totalAvRentPerMonth = (Array.from(averageRentPerMonth).reduce((acc, curr, index) => acc + (parseInt(curr.value.replace(/\,/g, '')) || 0) * numberOfUnits[index].value, 0) / totalNumberOfUnits).toFixed(2);
  totalRent.innerText = (totalAvRentPerMonth === 'NaN') ? '$0' : '$' + numberWithCommas(totalAvRentPerMonth);

  const resultantTotalAnnualRent = document.querySelectorAll('.total-annual-rent');
  const totalAnnualRentValue = Array.from(resultantTotalAnnualRent).reduce((acc, curr) => acc + (parseInt(curr.innerText.replace(/\,|\$/g, '')) || 0), 0);
  totalAnnualRent.innerText = '$' + numberWithCommas(totalAnnualRentValue);
  resultantPotentialIncome.innerText = '$' + numberWithCommas(totalAnnualRentValue);

  calculateTotalOtherIncome();
  calculatePricePerUnit();
}
/*
  Calculate and update `total annual rent` on result container
  Total Annual Rent = Total Units * Total Average Rent per Month * 12
*/
const calculateTotalAnnualRent = (id, numberOfUnits, averageRentPerMonth) => { 
  const totalAnnualRent = document.getElementById(`total-annual-rent-${id}`);
  averageRentPerMonth = parseInt(averageRentPerMonth.replace(/\,/g, '')) || 0;
  const totalAnnualRentValue = numberOfUnits * averageRentPerMonth * 12; 
  totalAnnualRent.innerText = `$${numberWithCommas(totalAnnualRentValue)}`;
  updateTotalValues();
  shareLink.value = generateSharableLink();
}

const handleBrBaInputs = (id, brValue, baValue) => { 
  const resultantUnitType = document.getElementById(`resultant-unit-type-${id}`);
  resultantUnitType.innerText = `${brValue}br / ${baValue}ba`;
  shareLink.value = generateSharableLink();
}

const handleNumberOfUnits = (id, numberOfUnitsValue, averageRentPerMonthValue) => { 
  const resultantNumberOfUnits = document.getElementById(`resultant-number-of-units-${id}`);
  resultantNumberOfUnits.innerText = numberOfUnitsValue;
  calculateTotalAnnualRent(id, numberOfUnitsValue, averageRentPerMonthValue);
}

const handleAverageRentPerMonth = (id, numberOfUnitsValue, averageRentPerMonthValue) => { 
  const resultantAverageRentPerMonth = document.getElementById(`resultant-average-rent-per-month-${id}`);
  resultantAverageRentPerMonth.innerText = `$${averageRentPerMonthValue}`;
  calculateTotalAnnualRent(id, numberOfUnitsValue, averageRentPerMonthValue);
}
// add event listeners to inputs and update values on result container
const addEventListnersToInputs = (id) => {
  const br = document.getElementById(`unit-type-br-${id}`);
  const ba = document.getElementById(`unit-type-ba-${id}`);

  [br, ba].forEach(element => element.addEventListener('input', (e) => { handleBrBaInputs(id, br.value, ba.value); validatebrba(e) }));

  const numberOfUnits = document.getElementById(`number-of-units-${id}`);
  const averageRentPerMonth = document.getElementById(`average-rent-per-month-${id}`);
  
  numberOfUnits.addEventListener('input', () => handleNumberOfUnits(id, numberOfUnits.value, averageRentPerMonth.value));

  averageRentPerMonth.addEventListener('input', () => handleAverageRentPerMonth(id, numberOfUnits.value,averageRentPerMonth.value));
}
// On click of add new row button -> add new row to building data container and add event listeners to inputs
addNewRowButton.addEventListener('click', () => {
  const id = Math.random().toString(36).substring(7);
  addNewRowToContainer(id);
  addNewRowToResultantContainer(id);
  addEventListnersToInputs(id);
});
// On fresh load of page -> atleast one row should be added
addNewRowButton.click(); 

/*------------------------------------Investment & Financing Data---------------- */
// investment data inputs
const purchasePrice = new AutoNumeric('#purchase-price', amountConfig);
// financing data inputs
const loanInterestRate = document.getElementById('loan-interest-rate');
const loanAmortization = document.getElementById('loan-amortization');
const loanTermPeriod = document.getElementById('loan-term-period');
const ltv = document.getElementById('ltv');
const dscr = document.getElementById('dscr');
// calculated result
const resultantPurchasePrice = document.getElementById('resultant-purchase-price');
const resultantPerUnit = document.getElementById('resultant-per-unit');

const resultantLoanInterestRate = document.getElementById('resultant-loan-interest-rate');
const resultantLoanAmortization = document.getElementById('resultant-loan-amortization');
const resultantLtv = document.getElementById('resultant-ltv');
const resultantDscr = document.getElementById('resultant-dscr');
const loanAmountLtv = document.getElementById('loan-amount-ltv');
const loanAmountDscr = document.getElementById('loan-amount-dscr');
const maximumLoanAmount = document.getElementById('maximum-loan-amount');
const initialEquity = document.getElementById('initial-equity');
const monthlyDebtService = document.getElementById('monthly-debt-service');
const annualDebtService = document.getElementById('annual-debt-service');
const cashOnCashReturn = document.getElementById('cash-on-cash-return');
const investmentAndFinancingInputElements = [purchasePrice, loanInterestRate, loanAmortization, loanTermPeriod, ltv, dscr];

const validateLoanAmortization = (e) => { 
  let value = e.target.value;

  if (value > 12000) {
    e.target.value = 12000;
    insertErrorMessage(e, 'Please select a value between 0 to 12000');
  } else {
    removeErrorMessage(e);
  }
}

const validateDSCR = (e) => {
  let value = e.target.value;

  if (value > 3) {
    e.target.value = 3;
    insertErrorMessage(e, 'Please select a value between 0.0 to 3.0 (inclusive)');
  } else {
    removeErrorMessage(e);
  }
}

const calculatePricePerUnit = () => { 
  const purchasePriceValue = parseInt(purchasePrice.rawValue) || 0;
  const totalUnitsValue = parseInt(totalUnits.innerText);
  
  if (purchasePriceValue) {
    resultantPurchasePrice.innerText = `$${numberWithCommas(purchasePriceValue)}`;
  } else { 
    resultantPurchasePrice.innerText = '$0';
  }

  const pricePerUnit = Math.round(purchasePriceValue / totalUnitsValue);
  
  if(pricePerUnit && pricePerUnit !== Infinity) {
    resultantPerUnit.innerText = `$${numberWithCommas(pricePerUnit)}`;
  } else {
    resultantPerUnit.innerText = '$0';
  }
}
/*
  Calculate Loan Amount (LTV)
  Loan Amount (LTV) = Purchase Price * LTV
*/
const calculateLoanAmountLTV = () => {
  const purchasePriceValue = parseInt(purchasePrice.rawValue) || 0;
  const ltvValue = parseFloat(ltv.value) || 0;

  if (ltvValue) {
    resultantLtv.innerText = `${ltvValue}%`;
  } else {
    resultantLtv.innerText = '0.0%';
  }

  const loanAmountLtvValue = Math.round(purchasePriceValue * ltvValue / 100);

  if (loanAmountLtvValue) { 
    loanAmountLtv.innerText = `$${numberWithCommas(loanAmountLtvValue)}`;
  } else {
    loanAmountLtv.innerText = '$0';
  }

  calculateMaximumLoanAmount();
}
// Courtesy of https://github.com/kgkars/tvm-financejs/blob/master/index.js
const PV = (rate, nper, pmt, fv, type) => {
  type = typeof type === "undefined" ? 0 : type;
  fv = typeof fv === "undefined" ? 0 : fv;

  if (rate === 0) {
    return pmt * nper - fv;
  } else {
    let tempVar = type !== 0 ? 1 + rate : 1;
    let tempVar2 = 1 + rate;
    let tempVar3 = Math.pow(tempVar2, nper);

    return (fv + pmt * tempVar * ((tempVar3 - 1) / rate)) / tempVar3;
  }
}
/*
  Calculate Loan Amount (DSCR)
  Loan Amount = PV(loan interest rate, loan amortization, dscr)
*/
const calculateLoanAmountDSCR = () => { 
  const loanInterestRateValue = parseFloat(loanInterestRate.value) || 0;
  let loanAmortizationValue = parseInt(loanAmortization.value) || 0;
  const dscrValue = parseFloat(dscr.value) || 0;
  const totalAnnualRentValue = parseInt(totalAnnualRent.innerText.replace(/\$|\,/g, '')) || 0;
  const effectiveGrossIncomeValue = parseInt(effectiveGrossIncome.innerText.replace(/\$|\,/g, '')) || 0;
  const netOperatingIncomeValue = parseInt(netOperatingIncome.innerText.replace(/\$|\,/g, '')) || 0;
  
  // verification for loan amount (dscr)
  if (loanInterestRateValue) {
    resultantLoanInterestRate.innerText = loanInterestRateValue + '%';
  } else {
    resultantLoanInterestRate.innerText = '0.0%';
  }

  if (!loanTermPeriod.checked) { 
    loanAmortizationValue = loanAmortizationValue * 12;
  }

  if (loanAmortizationValue) {
    resultantLoanAmortization.innerText = loanAmortizationValue;
  } else {
    resultantLoanAmortization.innerText = '0';
  }

  if (dscrValue) {
    resultantDscr.innerText = dscrValue + 'x';
    if (totalAnnualRentValue === effectiveGrossIncomeValue) {
      removeWarningMessage(dscr);
      insertWarningMessage(dscr, 'Operating Statement is required to calculate Loan Amount (DSCR)');
    } else if (effectiveGrossIncomeValue === netOperatingIncomeValue) {
      removeWarningMessage(dscr);
      insertWarningMessage(dscr, 'Operating Expenses is required to calculate Loan Amount (DSCR)');      
    }
    else {
      removeWarningMessage(dscr);
    }
  } else {
    resultantDscr.innerText = '0x';
  }

  const allowableDebtService = (netOperatingIncomeValue / dscrValue) / 12;

  if (loanInterestRateValue && loanAmortizationValue && allowableDebtService && allowableDebtService !== Infinity) {
    const loanAmountDSCRValue = Math.round(PV(loanInterestRateValue / 1200, loanAmortizationValue * 12, allowableDebtService));
    loanAmountDscr.innerText = `$${numberWithCommas(loanAmountDSCRValue)}`;
  } else {
    loanAmountDscr.innerText = '$0';
  }

  calculateMaximumLoanAmount();
}
/*
  Calculate Maximum Loan Amount
  Maximum Loan Amount = max(loan amount (ltv), loan amount (dscr))
*/
const calculateMaximumLoanAmount = () => { 
  const loanAmountLtvValue = parseInt(loanAmountLtv.innerText.replace(/\$|,/g, ''));
  const loanAmountDscrValue = parseInt(loanAmountDscr.innerText.replace(/\$|,/g, ''));

  let maxiumLoanAmountValue = Number.MAX_SAFE_INTEGER;

  maxiumLoanAmountValue = Math.min(loanAmountLtvValue, maxiumLoanAmountValue);
  maxiumLoanAmountValue = Math.min(loanAmountDscrValue, maxiumLoanAmountValue);

  if (maxiumLoanAmountValue !== Number.MAX_SAFE_INTEGER) {
    maximumLoanAmount.innerText = '$' + numberWithCommas(maxiumLoanAmountValue);
  } else {
    maximumLoanAmount.innerText = '$0';
  }

  calculateInitialEquity();
  calculateMonthlyDebtService();
  shareLink.value = generateSharableLink();
}
/*
  Calculate Initial Equity
  Initial Equity = Purchase Price - Maximum Loan Amount
*/
const calculateInitialEquity = () => { 
  const purchasePriceValue = purchasePrice.rawValue || 0;
  const maxiumLoanAmountValue = parseInt(maximumLoanAmount.innerText.replace(/\$|,/g, ''));

  const initialEquityValue = purchasePriceValue - maxiumLoanAmountValue;

  if (initialEquityValue) {
    initialEquity.innerText = '$' + numberWithCommas(initialEquityValue);
  } else {
    initialEquity.innerText = '$0';
  }

  calculateCashOnCashReturn();
}
/*
  Calculate Monthly Debt Service
  Monthly Debt Service = PMT(Loan Intrest Rate / 12, Loan Amortization * 12, -Maximum Loan Amount)
*/
const calculateMonthlyDebtService = () => { 
  const loanInterestRateValue = loanInterestRate.value / 1200;
  const loanAmortizationValue = loanTermPeriod.checked ? loanAmortization.value : loanAmortization.value * 12;
  const maximuLoanAmountValue = parseInt(maximumLoanAmount.innerText.replace(/\$|,/g, ''));

  const monthlyDebtServiceValue = PMT(loanInterestRateValue, loanAmortizationValue, -maximuLoanAmountValue);
  
  if (monthlyDebtServiceValue) {
    monthlyDebtService.innerText = '$' + numberWithCommas(Math.round(monthlyDebtServiceValue));
    calculateAnnualDebtService(monthlyDebtServiceValue);
  } else {
    monthlyDebtService.innerText = '$0';
  }
}
/*
  Calculate Annual Debt Service
  Annual Dabt Service = Monthly Debt Service * 12
*/
const calculateAnnualDebtService = (monthlyDebtServiceValue) => { 
  const annualDebtServiceValue = Math.round(monthlyDebtServiceValue * 12);
  annualDebtService.innerText = '$' + numberWithCommas(annualDebtServiceValue);
  debtService.innerText = '$' + numberWithCommas(annualDebtServiceValue);
  calculateCashFlowBeforeTax();
}
/*
  Calculate Cash on Cash Return
  Cash on Cash Return  = Cash Flow Before Tax / Initial Equity
*/
const calculateCashOnCashReturn = () => { 
  const cashFlowBeforeTaxValue = parseInt(cashFlowBeforeTax.innerText.replace(/\$|,/g, ''));
  const initialEquityValue = parseInt(initialEquity.innerText.replace(/\$|,/g, ''));

  const cashOnCashReturnValue = (cashFlowBeforeTaxValue / initialEquityValue) * 100;

  if (cashOnCashReturnValue && Number.isFinite(cashOnCashReturnValue)) {
    cashOnCashReturn.innerText = cashOnCashReturnValue.toFixed(2) + '%';
  } else {
    cashOnCashReturn.innerText = '0.0%';
  }
}

// add event listners to inputs and update values on result container
purchasePrice.domElement.addEventListener('input', () => { calculatePricePerUnit(); calculateLoanAmountLTV(); calculateInitialEquity(); });
ltv.addEventListener('input', calculateLoanAmountLTV);

[loanInterestRate, loanAmortization, loanTermPeriod, dscr].forEach(element => element.addEventListener('input', calculateLoanAmountDSCR));

loanAmortization.addEventListener('input', validateLoanAmortization);
dscr.addEventListener('input', validateDSCR);

/* -----------------------------------Operating Statement ----------------------- */

// operating statement inputs
const otherIncome = new AutoNumeric('#other-income', amountConfig);
const vacanyCreditLoss = document.getElementById('vacany-credit-loss');
const expenses = document.querySelectorAll('.expenses');
// internal calculations
const effectiveGrossIncome = document.getElementById('effective-gross-income');
const totalExpenses = document.getElementById('total-expenses');
// Operating Expenses
const managementFee = document.getElementById('management-fee'); 
const otherExpenses = new AutoNumeric('#other-expenses', amountConfig);
const capExReserves = new AutoNumeric('#capex-reserves', amountConfig); 
const otherExpensesToggle = document.getElementById('other-expenses-toggle');
const capExReservesToggle = document.getElementById('capex-reserves-toggle');
// calculated results
const resultantPotentialIncome = document.getElementById('resultant-potential-income');
const totalOtherIncome = document.getElementById('total-other-income');
const resultantPotentialGrossIncome = document.getElementById('resultant-potential-gross-income');
const resultantVacancyCreditLoss = document.getElementById('resultant-vacancy-credit-loss');
const resultantEffectiveGrossIncome = document.getElementById('resultant-effective-gross-income');
const resultantTotalExpenses = document.getElementById('resultant-total-expenses');
const netOperatingIncome = document.getElementById('net-operating-income');
const debtService = document.getElementById('debt-service');
const cashFlowBeforeTax = document.getElementById('cash-flow-before-tax');
const operatingStatementInputElements = [otherIncome, vacanyCreditLoss, managementFee, otherExpenses, capExReserves, otherExpensesToggle, capExReservesToggle];
/*
  # Update Total Expenses Property on Calculated Results
*/
const updateResultantTotalExpenses = (element) => {
  let resultantId = 'resultant-' + (element.target ? element.target.id : element.id);
  let resultant = document.getElementById(resultantId);
  let value = element.target ? element.target.value : element.value;
  let isManagementFee = resultantId === 'resultant-management-fee';
  
  if (value) {
    if (isManagementFee) return;
    resultant.innerText = "$" + value;
  } else {
    resultant.innerText = '$0';
  }
}
/*
  # Calculate Managment Fee from percentage value
  # If `managementFee` is filled in and, `grossPotentialIncome` is valid, calculate Management Fee in dollars
*/
const calculateManagementFee = () => {
  const managementFeeValue = parseFloat(managementFee.value);
  const effectiveGrossIncomeValue = parseFloat(effectiveGrossIncome.innerText.replace(/\$|,/g, ''));
  const resultantManagementFee = document.getElementById('resultant-management-fee');
  let netManagementFee = 0;

  if (managementFeeValue && effectiveGrossIncomeValue) {
    netManagementFee = (effectiveGrossIncomeValue * managementFeeValue / 100).toFixed(2);
    resultantManagementFee.innerText = "$" + numberWithCommas(Math.round(netManagementFee));
  } else {
    resultantManagementFee.innerText = '$0';
  }

  return parseFloat(netManagementFee);
}
/*
  Calculate Other Expenses
  Other Expenses = Ohter Expense Unit Per Year * Total Units
*/
const calculateOtherExpenses = () => { 
  const otherExpensUnitPerYear = otherExpenses.rawValue;
  const totalUnitsValue = parseInt(totalUnits.innerText);
  const resultantOtherExpense = document.getElementById('resultant-other-expenses');
  let otherExpense = 0;

  if (otherExpensesToggle.checked) {
    otherExpense = otherExpensUnitPerYear * totalUnitsValue;
  } else {
    otherExpense = otherExpensUnitPerYear || 0;
  }
  
  if (otherExpense) {
    resultantOtherExpense.innerText = "$" + numberWithCommas(Math.round(otherExpense));
  } else {
    resultantOtherExpense.innerText = '$0';
  }

  return parseInt(otherExpense);
}
/*
  Calculate CapEx Reserves
  CapEx Reserves = CapEx Unit Per Year * Total Units
*/
const calculateCapExReserves = () => { 
  const capExReservesValue = capExReserves.rawValue;
  const totalUnitsValue = parseInt(totalUnits.innerText);
  const resultantCapExReserves = document.getElementById('resultant-capex-reserves');
  let capExReserve = 0;

  if (capExReservesToggle.checked) {
    capExReserve = capExReservesValue * totalUnitsValue;
  } else {
    capExReserve = capExReservesValue || 0;
  }

  if(capExReserve) {
    resultantCapExReserves.innerText = "$" + numberWithCommas(Math.round(capExReserve));
  } else {
    resultantCapExReserves.innerText = '$0';
  }

  return parseInt(capExReserve);
}
/*
  # Calculate Total Expenses
  # Total Expenses = Sum of all Expenses
  # If any of the Expenses are filled in, calculate Total Expenses
  # Any change in any of the Expenses will trigger the calculation of Net Operating Income
*/
const calculateTotalExpenses = () => {
  let totalExpensesValue = calculateManagementFee();
  totalExpensesValue += calculateOtherExpenses();
  totalExpensesValue += calculateCapExReserves();

  expenses.forEach(expense => {
    let expenseValue = parseFloat(expense.value.replaceAll(',', ''));
    if (expenseValue) {
      totalExpensesValue += expenseValue;
    }
  });

  totalExpenses.innerText = "$" + numberWithCommas(Math.round(totalExpensesValue));
  resultantTotalExpenses.innerText = "$" + numberWithCommas(Math.round(totalExpensesValue));

  calculateNetOperatingIncome();
}
/* 
  Calculate Total Other Income
  Total Other Income = Other Income * Total Units
*/
const calculateTotalOtherIncome = () => { 
  const otherIncomeValue = parseInt(otherIncome.rawValue);
  
  const totalOtherIncomeValue = otherIncomeValue;

  if (totalOtherIncomeValue) { 
    totalOtherIncome.innerText = "$" + numberWithCommas(totalOtherIncomeValue);
  } else {
    totalOtherIncome.innerText = '$0';
  }

  calculatePotentialGrossIncome();
}
/*
  Calculate Potential Gross Income
  Potential Gross Income = Potential Rental Income + Total Other Income
*/
const calculatePotentialGrossIncome = () => { 
  const potentialRentalIncomeValue = parseInt(resultantPotentialIncome.innerText.replace(/\$|,/g, ''));
  const totalOtherIncomeValue = parseInt(totalOtherIncome.innerText.replace(/\$|,/g, ''));

  const resultantPotentialGrossIncomeValue = potentialRentalIncomeValue + totalOtherIncomeValue;
  
  if (resultantPotentialGrossIncomeValue) {
    resultantPotentialGrossIncome.innerText = "$" + numberWithCommas(resultantPotentialGrossIncomeValue);
  } else {
    resultantPotentialGrossIncome.innerText = '$0';
  }

  calculateEffectiveGrossIncome();
}
/*
  Calculate Effective Gross Income
  Effective Gross Income = Potential Gross Income - Vacancy & Credit Loss
*/
const calculateEffectiveGrossIncome = () => { 
  const potentialGrossIncomeValue = parseInt(resultantPotentialGrossIncome.innerText.replace(/\$|,/g, ''));
  const vacancyCreditLossValue = Math.round(vacanyCreditLoss.value * potentialGrossIncomeValue / 100);
  
  if (vacancyCreditLossValue) {
    resultantVacancyCreditLoss.innerText = "$" + numberWithCommas(vacancyCreditLossValue);   
  } else {
    resultantVacancyCreditLoss.innerText = '$0';
  }
  
  const resultantEffectiveGrossIncomeValue = potentialGrossIncomeValue - vacancyCreditLossValue;
 
  if (resultantEffectiveGrossIncomeValue) {
    effectiveGrossIncome.innerText = "$" + numberWithCommas(resultantEffectiveGrossIncomeValue);
    resultantEffectiveGrossIncome.innerText = "$" + numberWithCommas(resultantEffectiveGrossIncomeValue);
  } else {
    effectiveGrossIncome.innerText = '$0';
    resultantEffectiveGrossIncome.innerText = '$0';
  }

  calculateNetOperatingIncome();
}
/*
  Calculate Net Operating Income
  Net Operating Income = Effective Gross Income - Total Expenses
*/
const calculateNetOperatingIncome = () => { 
  const effectiveGrossIncomeValue = parseInt(effectiveGrossIncome.innerText.replace(/\$|,/g, ''));
  const totalExpensesValue = parseInt(totalExpenses.innerText.replace(/\$|,/g, ''));

  const netOperatingIncomeValue = effectiveGrossIncomeValue - totalExpensesValue;
  
  if (netOperatingIncomeValue) {
    netOperatingIncome.innerText = "$" + numberWithCommas(netOperatingIncomeValue);
  } else {
    netOperatingIncome.innerText = '$0';
  }

  calculateLoanAmountDSCR();
  calculateCashFlowBeforeTax();
}
/*
  Calculate Cash Flow Before Tax
  Cash FLow Before Tax = Net Operating Income - Debt Service
*/
const calculateCashFlowBeforeTax = () => { 
  const netOperatingIncomeValue = parseInt(netOperatingIncome.innerText.replace(/\$|,/g, ''));
  const debtServiceValue = parseInt(debtService.innerText.replace(/\$|,/g, ''));

  const cashFlowBeforeTaxValue = netOperatingIncomeValue - debtServiceValue;

  if (cashFlowBeforeTaxValue) {
    cashFlowBeforeTax.innerText = '$' + numberWithCommas(cashFlowBeforeTaxValue);
  } else {
    cashFlowBeforeTax.innerText = '$0';
  }

  calculateCashOnCashReturn();
}
// For all the input fileds required for expenses add event listener to trigger calculation of Total Expenses
expenses.forEach(expense => new AutoNumeric(expense, amountConfig));
expenses.forEach(expense => expense.addEventListener('input', (e) => { calculateTotalExpenses(); updateResultantTotalExpenses(e); }));
// add event listner for other income
otherIncome.domElement.addEventListener('input', calculateTotalOtherIncome);
// add event listner for vacancy credit loss
vacanyCreditLoss.addEventListener('input', calculateEffectiveGrossIncome);
// add event listner to other expenses toggle
otherExpensesToggle.addEventListener('input', (e) => {
  if (otherExpensesToggle.checked) {
    otherExpensesToggle.value = 'AmountPerUnit';
  } else {
    otherExpensesToggle.value = 'TotalAmount';
  }
});
// add event listner to capex reserves toggle
capExReservesToggle.addEventListener('input', (e) => { 
  if (capExReservesToggle.checked) {
    capExReservesToggle.value = 'AmountPerUnit';
  } else {
    capExReservesToggle.value = 'TotalAmount';
  }
});
// add event listner for management fee, other expenses and capex reserves
[managementFee, otherExpenses.domElement, otherExpensesToggle, capExReserves.domElement, capExReservesToggle].forEach(element => element.addEventListener('input', calculateTotalExpenses));

/* -----------------------------------Sharable link----------------------------- */

// generate sharable link for building data
const generateSharableLink = () => { 
  let parameters = {};
  
  buildingDataInputSelectors.forEach(selector => {
    const inputs = Array.from(document.querySelectorAll(selector));
    parameters[selector] = inputs.map(input => input.value.replace(/\$|,/g, ''));
  });

  investmentAndFinancingInputElements.forEach(element => {
    const id = element?.domElement ? element.domElement.id : element.id;
    const value = element?.domElement ? '$' + element.domElement.value : element.value;
    parameters[id] = value;
  });

  operatingStatementInputElements.forEach(element => {
    const id = element?.domElement ? element.domElement.id : element.id;
    const value = element?.domElement ? '$' + element.domElement.value : element.value;
    parameters[id] = value;
  });

  expenses.forEach(expense => {
    const id = expense.id;
    const value = '$' + expense.value;
    parameters[id] = value;
  });

  let params = new URLSearchParams(parameters);
  
  return 'https://' + url.host + url.pathname + '?' + params.toString();
}
// parse parameter from url and pre-populate building data container inputs and resultant-building data container
const parseUrlParameters = (link) => { 
  const url = new URL(link);
  const params = new URLSearchParams(url.search);
  const parmasMap = {};
  let rows = 0;
  params.forEach((value, key) => { 
    if (key.includes('.')) {
      parmasMap[key] = value.split(',');
      rows = parmasMap[key].length;
    } else { 
      parmasMap[key] = value;
    }
  });
  
  for (let i = 1; i < rows; i++) addNewRowButton.click();

  let ids = [];

  buildingDataInputSelectors.forEach(selector => { 
    const inputs = Array.from(document.querySelectorAll(selector));
    inputs.forEach((input, index) => {
      if (parmasMap[selector]) { 
        input.value = parmasMap[selector][index];
        let className = input.classList[0];
        let id = input.id.replace(className + '-', '');
        if(!ids.includes(id)) ids.push(id);
      } 
    });
  });

  ids.forEach(id => {
    const br = document.getElementById(`unit-type-br-${id}`);
    const ba = document.getElementById(`unit-type-ba-${id}`);
    handleBrBaInputs(id, br.value, ba.value);

    const numberOfUnits = document.getElementById(`number-of-units-${id}`);
    const averageRentPerMonth = document.getElementById(`average-rent-per-month-${id}`);
    handleNumberOfUnits(id, numberOfUnits.value, averageRentPerMonth.value);
    handleAverageRentPerMonth(id, numberOfUnits.value, averageRentPerMonth.value);
  });

  if (params.has('loan-term-period')) {
    let value = params.get('loan-term-period');
    
    if (value === 'Monthly') {
      loanTermPeriod.checked = true;
    } else {
      loanTermPeriod.checked = false;
    }
  }

  investmentAndFinancingInputElements.forEach(element => {
    const id = element?.domElement ? element.domElement.id : element.id;
    const value = parmasMap[id];
    if (value) {
      if (value.includes('$')) {
        AutoNumeric.set(element.domElement, value.replace(/\$|,/g, ''));
      } else {
        element.value = value;
      }
    }
  });

  calculatePricePerUnit(); calculateLoanAmountLTV(); calculateLoanAmountDSCR();

  if (parmasMap['other-expenses-toggle']) { 
    let value = parmasMap['other-expenses-toggle'];

    if (value === 'AmountPerUnit') { 
      otherExpensesToggle.checked = true;
    } else {
      otherExpensesToggle.checked = false;
    }
  }

  if (parmasMap['capex-reserves-toggle']) { 
    let value = parmasMap['capex-reserves-toggle'];

    if (value === 'AmountPerUnit') { 
      capExReservesToggle.checked = true;
    } else {
      capExReservesToggle.checked = false;
    }
  }

  operatingStatementInputElements.forEach(element => {
    const id = element?.domElement ? element.domElement.id : element.id;
    const value = parmasMap[id];
    if (value) {
      if (value.includes('$')) {
        AutoNumeric.set(element.domElement, value.replace(/\$|,/g, ''));
      } else {
        element.value = value;
      }
    }
  });

  expenses.forEach(expense => {
    let value = parmasMap[expense.id];
    let resultantId = 'resultant-' + expense.id;
    let element = document.getElementById(resultantId);
    element.innerText = value || '$0';
    value && AutoNumeric.set(expense, value.replace(/\$|,/g, ''));
  });

  calculateTotalOtherIncome();
  calculateTotalExpenses();
}
// On click of share button -> generate sharable link and show copy to clipboard icon
shareResultButton.addEventListener('click', () => {
  let link = generateSharableLink();
  shareLink.value = link;
  shareLink.style.width = 'calc(100% - 3.5rem)';
  shareLink.style.padding = '0.5rem';
  copyText.style.opacity = '1';
});

parseUrlParameters(window.location.href);
