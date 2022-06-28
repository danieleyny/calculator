import { amountConfig, numberWithCommas, PMT, generateSharableLink, parseFromUrl, insertErrorMessage, removeErrorMessage } from "./utils.js";

// Operating Statement Inputs
const monthlyRent = new AutoNumeric('#monthly-rent', amountConfig);
const otherIncome = new AutoNumeric('#other-income', amountConfig);
const vacanyRate = document.getElementById('vacancy-rate');
const managementFee = document.getElementById('management-fee'); 
const expenses = document.querySelectorAll('.expenses');
// internal calculations
const effectiveGrossIncome = document.getElementById('effective-gross-income');
const totalExpenses = document.getElementById('total-expenses');
// calculated results
const resultantMonthlyRent = document.getElementById('resultant-monthly-rent');
const resultantOtherIncome = document.getElementById('resultant-other-income');
const resultantVacancyRate = document.getElementById('resultant-vacancy-rate');
const resultantEffectiveGrossIncome = document.getElementById('resultant-effective-gross-income');
const resultantTotalExpenses = document.getElementById('resultant-total-expenses');
const netOperatingIncome = document.getElementById('net-operating-income');
// Investment Data Inputs
const purchasePrice = new AutoNumeric("#purchase-price", amountConfig);
const closingCost = new AutoNumeric("#closing-cost", amountConfig);
const renovationCost = new AutoNumeric('#renovation-cost', amountConfig);
// Financing Data Inputs
const downPayment = new AutoNumeric('#down-payment', amountConfig);
const loanInterestRate = document.getElementById('loan-interest-rate');
const loanAmortization = document.getElementById('loan-amortization');
// Calculated Results
const resultantPurchasePrice = document.getElementById('resultant-purchase-price');
const resultantClosingCost = document.getElementById('resultant-closing-cost');
const resultantRenovationCost = document.getElementById('resultant-renovation-cost');
const resultantDownPayment = document.getElementById('resultant-down-payment');
const initialEquity = document.getElementById('initial-equity');
const loanAmount = document.getElementById('loan-amount');
const debtService = document.getElementById('debt-service');
const cashFlowBeforeTax = document.getElementById('cash-flow-before-tax');
const cashOnCashReturn = document.getElementById('cash-on-cash-return');
const goingInCapRate = document.getElementById('going-in-cap-rate');
const unleveredYieldOnCost = document.getElementById('unlevered-yield-on-cost');
// share link
const shareResultButton = document.getElementById('share-result');
const shareLink = document.getElementById('share-link');
const copyText = document.getElementById('copy-text');
const url = new URL(window.location.href);
/*
  Validate Loan Amortization
  Loan Amortization must be a number between 0 and 12000
*/
const validateLoanAmortization = (e) => { 
  let value = e.target.value;

  if (value > 12000) {
    e.target.value = 12000;
    insertErrorMessage(e, 'Please select a value between 0 to 12000');
  } else {
    removeErrorMessage(e);
  }
}
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
  const managementFeeValue = parseFloat(managementFee.value) || 0;
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
  # Calculate Total Expenses
  # Total Expenses = Sum of all Expenses
  # If any of the Expenses are filled in, calculate Total Expenses
  # Any change in any of the Expenses will trigger the calculation of Net Operating Income
*/
const calculateTotalExpenses = () => {
  let totalExpensesValue = calculateManagementFee();

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
  Calculate Effective Gross Income
  Effective Gross Income = Monthly Rent + Other Income - Vacancy & Credit Loss
*/
const calculateEffectiveGrossIncome = () => { 
  const monthlyRentValue = parseInt(monthlyRent.rawValue) * 12 || 0;
  const otherIncomeValue = parseInt(otherIncome.rawValue) || 0;
  const vacancyRateValue = parseFloat(vacanyRate.value) || 0;
  const vacancyRateValueInDollars = (monthlyRentValue + otherIncomeValue) * vacancyRateValue / 100;

  let effectiveGrossIncomeValue = 0;

  if (monthlyRentValue) {
    effectiveGrossIncomeValue += monthlyRentValue;
    resultantMonthlyRent.innerText = "$" + numberWithCommas(monthlyRentValue);
  } else { 
    resultantMonthlyRent.innerText = '$0';
  }

  if (otherIncomeValue) {
    effectiveGrossIncomeValue += otherIncomeValue;
    resultantOtherIncome.innerText = "$" + numberWithCommas(otherIncomeValue);
  } else { 
    resultantOtherIncome.innerText = '$0';
  }

  if (vacancyRateValueInDollars) {
    effectiveGrossIncomeValue -= Math.round(vacancyRateValueInDollars);
    resultantVacancyRate.innerText = "$" + numberWithCommas(Math.round(vacancyRateValueInDollars));
  } else { 
    resultantVacancyRate.innerText = '$0';
  }

  if (effectiveGrossIncomeValue) {
    effectiveGrossIncome.innerText = "$" + numberWithCommas(effectiveGrossIncomeValue);
    resultantEffectiveGrossIncome.innerText = "$" + numberWithCommas(effectiveGrossIncomeValue);
  } else { 
    effectiveGrossIncome.innerText = '$0';
    resultantEffectiveGrossIncome.innerText = '$0';
  }

  calculateTotalExpenses();
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

  calculateCashFlowBeforeTax();
  calculateGoingInCapRate();
  calculateUnleveredYieldOnCost();
}
/*
  Calculate Initial Equity
  Initial Equity = Purchase Price + Closing Costs - Down Payment
*/
const calculateInitialEquity = () => { 
  const closingCostValue = parseInt(closingCost.rawValue) || 0;
  const downPaymentValue = parseInt(downPayment.rawValue) || 0;

  if (closingCostValue) { 
    resultantClosingCost.innerText = "$" + numberWithCommas(closingCostValue);
  } else {
    resultantClosingCost.innerText = '$0';
  }

  if (downPaymentValue) { 
    resultantDownPayment.innerText = "$" + numberWithCommas(downPaymentValue);
  } else {
    resultantDownPayment.innerText = '$0';
  }

  const initialEquityValue = closingCostValue + downPaymentValue;

  if (initialEquityValue) {
    initialEquity.innerText = "$" + numberWithCommas(initialEquityValue);
  } else {
    initialEquity.innerText = '$0';
  }
}
/*
  Calculate Loan Amount
  Loan Amount = Purchase Price - Down Payment
*/
const calculateLoanAmount = () => { 
  const purchasePriceValue = parseInt(purchasePrice.rawValue) || 0;
  const closingCostValue = parseInt(closingCost.rawValue) || 0;
  const renovationCostValue = parseInt(renovationCost.rawValue) || 0;
  const downPaymentValue = parseInt(downPayment.rawValue) || 0;

  if (purchasePriceValue) { 
    resultantPurchasePrice.innerText = "$" + numberWithCommas(purchasePriceValue);
  } else {
    resultantPurchasePrice.innerText = '$0';
  }

  if (closingCostValue) { 
    resultantClosingCost.innerText = "$" + numberWithCommas(closingCostValue);
  } else {
    resultantClosingCost.innerText = '$0';
  }

  if (renovationCostValue) { 
    resultantRenovationCost.innerText = "$" + numberWithCommas(renovationCostValue);
  } else {
    resultantRenovationCost.innerText = '$0';
  }

  if (downPaymentValue) { 
    resultantDownPayment.innerText = "$" + numberWithCommas(downPaymentValue);
  } else {
    resultantDownPayment.innerText = '$0';
  }

  const loanAmountValue = purchasePriceValue + closingCostValue + renovationCostValue - downPaymentValue;

  if (loanAmountValue) {
    loanAmount.innerText = "$" + numberWithCommas(loanAmountValue);
  } else {
    loanAmount.innerText = '$0';
  }

  calculateDebtService();
}
/*
  Calculate Debt Service
  Debt Service = PMT(Loan Intrest Rate / 12, Loan Amortization * 12, -Loan Amount)
*/
const calculateDebtService = () => { 
  const loanInterestRateValue = parseFloat(loanInterestRate.value) || 0;
  const loanAmortizationValue = parseInt(loanAmortization.value) || 0;
  const loanAmountValue = parseInt(loanAmount.innerText.replace(/\$|,/g, ''));
  const debtServiceValue = Math.round(PMT(loanInterestRateValue / 1200, loanAmortizationValue * 12, -loanAmountValue));
  
  if (debtServiceValue && Number.isFinite(debtServiceValue)) {
    debtService.innerText = "$" + numberWithCommas(debtServiceValue);
  } else { 
    debtService.innerText = '$0';
  }

  calculateCashFlowBeforeTax();
}
/*
  Calculate Cash Flow Before Tax
  Cash Flow Before Tax = Net Operating Income - Debt Service
*/
const calculateCashFlowBeforeTax = () => { 
  const netOperatingIncomeValue = parseInt(netOperatingIncome.innerText.replace(/\$|,/g, ''));
  const debtServiceValue = parseInt(debtService.innerText.replace(/\$|,/g, ''));

  const cashFlowBeforeTaxValue = netOperatingIncomeValue - debtServiceValue;

  if (cashFlowBeforeTaxValue) {
    cashFlowBeforeTax.innerText = "$" + numberWithCommas(cashFlowBeforeTaxValue);
  } else {
    cashFlowBeforeTax.innerText = '$0';
  }

  calculateCashOnCashReturn();
}
/*
  Calculate Cash on Cash Return
  Cash on Cash Return = (Cash Flow Before Tax / Initial Equity) * 100
*/
const calculateCashOnCashReturn = () => { 
  const cashFlowBeforeTaxValue = parseInt(cashFlowBeforeTax.innerText.replace(/\$|,/g, ''));
  const initialEquityValue = parseInt(initialEquity.innerText.replace(/\$|,/g, ''));

  const cashOnCashReturnValue = (cashFlowBeforeTaxValue / initialEquityValue) * 100;

  if (cashOnCashReturnValue && Number.isFinite(cashOnCashReturnValue)) {
    cashOnCashReturn.innerText = cashOnCashReturnValue.toFixed(2) + '%';
  } else {
    cashOnCashReturn.innerText = '0%';
  }

  shareLink.value = generateSharableLink(url, [monthlyRent, otherIncome, vacanyRate, managementFee, ...expenses, purchasePrice, closingCost, downPayment, loanInterestRate, loanAmortization]);
}
/*
  Calculate Going-in Cap Rate
  Going-in Cap Rate = (Net Operating Income / Purchase Price) * 100
*/
const calculateGoingInCapRate = () => { 
  const netOperatingIncomeValue = parseInt(netOperatingIncome.innerText.replace(/\$|,/g, ''));
  const purchasePriceValue = parseInt(purchasePrice.rawValue);

  const goingInCapRateValue = (netOperatingIncomeValue / purchasePriceValue) * 100;

  if (goingInCapRateValue) {
    goingInCapRate.innerText = goingInCapRateValue.toFixed(2) + '%';
  } else {
    goingInCapRate.innerText = '0%';
  }
}
/*
  Calculate Unlevered Yield on Cost
  Unlevered Yield on Cost = (Net Operating Income / (Purchase Price + Closing Cost + Renovation Cost)) * 100
*/
const calculateUnleveredYieldOnCost = () => { 
  const netOperatingIncomeValue = parseInt(netOperatingIncome.innerText.replace(/\$|,/g, ''));
  const purchasePriceValue = parseInt(purchasePrice.rawValue) || 0;
  const closingCostValue = parseInt(closingCost.rawValue) || 0;
  const renovationCostValue = parseInt(renovationCost.rawValue) || 0;

  const unleveredYieldOnCostValue = (netOperatingIncomeValue / (purchasePriceValue + closingCostValue + renovationCostValue)) * 100;
  
  if (unleveredYieldOnCostValue && Number.isFinite(unleveredYieldOnCostValue)) {
    unleveredYieldOnCost.innerText = unleveredYieldOnCostValue.toFixed(2) + '%';
  } else {
    unleveredYieldOnCost.innerText = '0%';
  }
}
// For all the input fileds required for expenses add event listener to trigger calculation of Total Expenses
expenses.forEach(expense => new AutoNumeric(expense, amountConfig));
expenses.forEach(expense => expense.addEventListener('input', (e) => { calculateTotalExpenses(); updateResultantTotalExpenses(e); }));
// add eventlistners to calculate Effective Gross Income
[monthlyRent.domElement, otherIncome.domElement, vacanyRate, managementFee].forEach(element => element.addEventListener('input', calculateEffectiveGrossIncome));
// add eventlistners to calculate Initial Equity
[closingCost.domElement, downPayment.domElement].forEach(element => element.addEventListener('input', calculateInitialEquity));
// add eventlistners to calculate Loan Amount
[purchasePrice.domElement, closingCost.domElement, renovationCost.domElement, downPayment.domElement].forEach(element => element.addEventListener('input', calculateLoanAmount));
// add eventlistners to calculate Unlevered Yield on Cost
[purchasePrice.domElement, closingCost.domElement, renovationCost.domElement].forEach(element => element.addEventListener('input', calculateUnleveredYieldOnCost));
// add eventlistners to calculate Debt Service
[loanInterestRate, loanAmortization].forEach(element => element.addEventListener('input', calculateDebtService));
// validate Loan Amortization
loanAmortization.addEventListener('input', validateLoanAmortization);
// add evenlistner to calculate Going-in Cap Rate
purchasePrice.domElement.addEventListener('input', calculateGoingInCapRate);
// Event Listners for generating sharable link and copy link to clipboard
shareResultButton.addEventListener('click', () => {
  let link = generateSharableLink(url, [monthlyRent, otherIncome, vacanyRate, managementFee, ...expenses, purchasePrice, closingCost, downPayment, loanInterestRate, loanAmortization]);
  shareLink.value = link;
  shareLink.style.width = 'calc(100% - 3.5rem)';
  shareLink.style.padding = '0.5rem';
  copyText.style.opacity = '1';
});

parseFromUrl(window.location.href, [calculateEffectiveGrossIncome, calculateInitialEquity, calculateLoanAmount]);
expenses.forEach(expense => updateResultantTotalExpenses(expense));