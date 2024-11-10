// // Fetch the financial data from the API
// fetch('/api/financial-data')
//     .then(response => response.json())
//     .then(data => {
//         input_data = data;
//         console.log(data); // For debugging
//         renderCharts(data);
//     })
//     .catch(error => console.error('Error fetching data:', error));

// // Function to render all charts
// function renderCharts(data) {
//     console.log("Rendering charts...");
//     console.log("Financial data:", data);
//     renderAssetAllocationChart(data);
//     renderExpenseBarChart(data);
//     renderDebtBarChart(data);
// }

// // Render Pie Chart for Asset Allocation
// function renderAssetAllocationChart(data) {
//     const ctx = document.getElementById('pie-chart').getContext('2d');
//     console.log(data.stocks, data.bonds, data.real_estate_investments, data.cryptocurrencies);
//     const pieChart = new Chart(ctx, {
//         type: 'pie',
//         data: {
//             labels: ['Stocks', 'Bonds', 'Real Estate', 'Cryptocurrencies'],
//             datasets: [{
//                 data: [data.stocks, data.bonds, data.real_estate_investments, data.cryptocurrencies],
//                 backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0']
//             }]
//         },
//         options: {
//             responsive: true,
//             plugins: {
//                 legend: {
//                     position: 'top',
//                 },
//                 tooltip: {
//                     callbacks: {
//                         label: function (tooltipItem) {
//                             return tooltipItem.raw + ' USD'; // Format tooltip
//                         }
//                     }
//                 }
//             }
//         }
//     });
//     // pieChart.update();
// }

// // Render Bar Chart for Monthly Expenses
// function renderExpenseBarChart(data) {
//     const ctx = document.getElementById('expense-bar-chart').getContext('2d');
//     console.log(data.housing_rent, data.utilities, data.groceries_food, data.transportation, data.health_insurance);
//     var expenseBarChart = new Chart(ctx, {
//         type: 'bar',
//         data: {
//             labels: ['Housing Rent', 'Utilities', 'Groceries', 'Transportation', 'Health Insurance'],
//             datasets: [{
//                 label: 'Monthly Expenses ($)',
//                 data: [
//                     data.housing_rent,
//                     data.utilities,
//                     data.groceries_food,
//                     data.transportation,
//                     data.health_insurance
//                 ],
//                 backgroundColor: '#FF8C00',
//                 borderColor: '#FF4500',
//                 borderWidth: 1
//             }]
//         },
//         options: {
//             responsive: true,
//             scales: {
//                 y: {
//                     beginAtZero: true
//                 }
//             }
//         }
//     });
//     expenseBarChart.update();
// }

// // Render Bar Chart for Debt Overview
// function renderDebtBarChart(data) {
//     const ctx = document.getElementById('debt-bar-chart').getContext('2d');
//     console.log(data.credit_card_debt_balance, data.student_loans_balance, data.mortgage_balance);
//     var debtBarChart = new Chart(ctx, {
//         type: 'bar',
//         data: {
//             labels: ['Credit Card Debt', 'Student Loans', 'Mortgage'],
//             datasets: [{
//                 label: 'Debt Overview ($)',
//                 data: [
//                     data.credit_card_debt_balance,
//                     data.student_loans_balance,
//                     data.mortgage_balance
//                 ],
//                 backgroundColor: '#8B0000',
//                 borderColor: '#FF4500',
//                 borderWidth: 1
//             }]
//         },
//         options: {
//             responsive: true,
//             scales: {
//                 y: {
//                     beginAtZero: true
//                 }
//             }
//         }
//     });
//     debtBarChart.update();
// }

let data = [];

async function fetchData() {
    const response = await fetch('/api/financial-data/');
    data = await response.json();
    plotChart();
}

function plotChart() {
    const ctx = document.getElementById('financialLineChart').getContext('2d');
    // Process data for the chart
    const labels = data.map(item => item.date);
    const incomeData = data.map(item => item.salary_monthly + item.investment_income + item.freelance_earnings);
    const expenditureData = data.map(item => item.utilities + item.groceries_food);
    let savingsData = incomeData.map((income, index) => income - expenditureData[index]);
    let netWorthData = data.map(item => item.net_worth);

    document.getElementById('submitButton').addEventListener('click', () => {
        // Get the text from the textarea
        const text = document.getElementById('largeTextArea').value;

        // Find the output container div and set its content to the text
        const outputDiv = document.getElementById('outputContainer');
        outputDiv.textContent = text;  // Sets the text content in the output div

        // Optionally, clear the text area after submitting
        // document.getElementById('largeTextArea').value = '';
    });

    // Vertical Line Plugin
    const verticalLinePlugin = {
        id: 'verticalLineOnHover',
        afterDatasetsDraw(chart) {
            const ctx = chart.ctx;
            const activePoint = chart.tooltip._active && chart.tooltip._active[0];

            if (activePoint) {
                const x = activePoint.element.x;
                const topY = chart.scales.y.top;
                const bottomY = chart.scales.y.bottom;

                ctx.save();
                ctx.beginPath();
                ctx.moveTo(x, topY);
                ctx.lineTo(x, bottomY);
                ctx.lineWidth = 1;
                ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
                ctx.stroke();
                ctx.restore();
            }
        }
    };

    Chart.register(verticalLinePlugin);

    // Initialize the line chart with drag functionality
    const financialLineChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Income',
                    data: incomeData,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    fill: true,
                    tension: 0.3,
                    dragData: true  // Enable dragging for Income dataset
                },
                {
                    label: 'Expenditure',
                    data: expenditureData,
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    fill: true,
                    tension: 0.3,
                    dragData: true  // Enable dragging for Expenditure dataset
                },
                {
                    label: 'Savings',
                    data: savingsData,
                    borderColor: 'rgba(54, 162, 235, 1)',
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    fill: true,
                    tension: 0.3,
                    dragData: false  // Disable dragging for Savings dataset
                },
                {
                    label: 'Net Worth',
                    data: netWorthData,
                    borderColor: 'rgba(153, 102, 255, 1)',
                    backgroundColor: 'rgba(153, 102, 255, 0.2)',
                    fill: true,
                    tension: 0.3,
                    dragData: false  // Disable dragging for Net Worth dataset
                }
            ]
        },
        options: {
            responsive: true,
            layout: {
                padding: {
                    top: 20,
                    right: 10,
                    bottom: 10,
                    left: 10
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Date'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Amount ($)'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Financial Overview Over Time'
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        title: function (tooltipItems) {
                            return `Date: ${tooltipItems[0].label}`;
                        },
                        label: function (tooltipItem) {
                            return `${tooltipItem.dataset.label}: $${tooltipItem.raw.toLocaleString()}`;
                        }
                    }
                },
                dragData: {
                    // Store the initial value of the dragged point
                    onDragStart: (event, datasetIndex, index, value) => {
                        event.target._initialValue = value;  // Store the initial value for later use
                        event.target._isShiftKeyPressed = event.shiftKey;  // Check if Shift key is pressed
                    },
                    // Update only after the drag ends
                    onDragEnd: (event, datasetIndex, index, value) => {
                        const dragFactor = 0.1;  // Adjust this factor to control sensitivity (lower value = less sensitivity)

                        // Get the initial value of the dragged point
                        const initialValue = event.target._initialValue;
                        const isShiftKeyPressed = !event.target._isShiftKeyPressed;

                        if (datasetIndex === 0) {  // Income dataset
                            const incomeDifference = value - initialValue;  // Calculate the change

                            if (isShiftKeyPressed) {
                                // Temporary Increase: Only change the current month
                                incomeData[index] += incomeDifference;
                            } else {
                                // Permanent Increase: Apply this difference to all subsequent months (Salary hike)
                                for (let i = index + 1; i < incomeData.length; i++) {
                                    incomeData[i] += incomeDifference;
                                }
                            }
                        } else if (datasetIndex === 1) {  // Expenditure dataset
                            const expenditureDifference = value - initialValue;  // Calculate the change

                            if (isShiftKeyPressed) {
                                // Temporary Increase: Only change the current month
                                expenditureData[index] += expenditureDifference;
                            } else {
                                // Permanent Increase: Apply this difference to all subsequent months
                                for (let i = index + 1; i < expenditureData.length; i++) {
                                    expenditureData[i] += expenditureDifference;
                                }
                            }
                        }

                        // Recalculate savings and net worth after the drop
                        savingsData = incomeData.map((income, i) => income - expenditureData[i]);
                        netWorthData = netWorthData.map((netWorth, i) => {
                            return i > 0 ? netWorthData[i - 1] + savingsData[i] : netWorth;
                        });

                        // Update chart datasets after the drop
                        financialLineChart.data.datasets[2].data = savingsData;
                        financialLineChart.data.datasets[3].data = netWorthData;
                        financialLineChart.update();
                    }
                }
            }
        },
        plugins: ['verticalLineOnHover']  // Include the vertical line plugin
    });
}

fetchData();







