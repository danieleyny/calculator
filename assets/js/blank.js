=function(o){var a=e(o,{loanAmount:{isRequired:!0,isNumber:!0,isNotNegative:!0,isNotZero:!0,isNotFloat:!1},interestRate:{isRequired:!0,isNumber:!0,isNotNegative:!0,isNotZero:!1,isNotFloat:!1},termInYears:{isRequired:!0,isNumber:!0,isNotNegative:!0,isNotZero:!0,isNotFloat:!0},monthsBeforeFirstAdjustment:{isRequired:!0,isNumber:!0,isNotNegative:!0,isNotZero:!0,isNotFloat:!0},monthsBetweenAdjustments:{isRequired:!0,isNumber:!0,isNotNegative:!0,isNotZero:!0,isNotFloat:!0},expectedAdjustmentRate:{isRequired:!0,isNumber:!0,isNotNegative:!0,isNotZero:!1,isNotFloat:!1},initialInterestRate:{isRequired:!0,isNumber:!0,isNotNegative:!0,isNotZero:!1,isNotFloat:!1},maximumInterestRate:{isRequired:!0,isNumber:!0,isNotNegative:!0,isNotZero:!0,isNotFloat:!1}});if(a.error)return{error:a.error};for(var s=o.interestRate,n=o.termInYears,N=o.loanAmount,m=o.initialInterestRate,u=o.expectedAdjustmentRate,l=o.monthsBeforeFirstAdjustment,g=o.monthsBetweenAdjustments,R=o.maximumInterestRate,y=r({loanAmount:N,interestRate:s,termInYears:n}),d=r({loanAmount:N,interestRate:m,termInYears:n}),v=N,c=0;c<l;c++){v-=d-t(m/100/12,v)}for(var b=m+u,f=r({loanAmount:v,interestRate:b,termInYears:n-l/12}),h=0;h<g;h++){v-=f-t(b/100/12,v)}for(var I,F=12*n-l-g,P=0;P<F;P+=g){b<R?b+=u:b=R,f=r({loanAmount:v,interestRate:b,termInYears:(F-P)/12});for(var p=0;p<g;p++){v-=f-t(b/100/12,v)}I=f}return response={fixedRate:{monthlyMortgagePayment:i(y)},ARM:{initialMonthlyMortgagePayment:i(d),maxMonthlyMortgagePayment:i(I)}},response}