function sortByDate(arr) {
    return arr.sort((a, b) => {
        // Compare the date strings directly
        return new Date(a.date) - new Date(b.date);
    });
}


function plotChart(data) {

    data = sortByDate(data);

    const ctx = document.getElementById('financialLineChart').getContext('2d');
    // Process data for the chart
    const labels = data.map(item => item.date);
    const incomeData = data.map(item => item.income);
    const expenditureData = data.map(item => item.expenditure);
    let savingsData = incomeData.map((income, index) => income - expenditureData[index]);

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


                        // Update chart datasets after the drop
                        financialLineChart.data.datasets[2].data = savingsData;
                        financialLineChart.update();
                    }
                }
            }
        },
        plugins: ['verticalLineOnHover']  // Include the vertical line plugin
    });
}



const ACCOUNT_ID = "672fdbba9683f20dd518b396";
const CUSTOMER_ID = "672fdac99683f20dd518b395"
const API_KEY = "0992b98e27891f11d3e16d1a5b6adf29"


const depositsUrl = "http://api.nessieisreal.com/accounts/"+ACCOUNT_ID+"/deposits?key="+API_KEY

const purchasesUrl = "http://api.nessieisreal.com/accounts/"+ACCOUNT_ID+"/purchases?key="+API_KEY


var purchases = []

var financialDataExtracted = []

const monthlyTransactions = {};


// Define any required headers (e.g., Authorization or API key)
const headers = {
    "Content-Type": "application/json",
    "Accept": "application/json"
};

function consolidateMonthlyTransactions(transactions, isIncome) {


    transactions.forEach(transaction => {
        const date = isIncome ? new Date(transaction.transaction_date) : new Date(transaction.purchase_date) ; // Convert to Date object
        const yearMonth = `${date.getFullYear()}-${date.getMonth() + 1}`; // Format as YYYY-MM
        
        // Initialize the bucket for the month if it doesn't exist
        if (!monthlyTransactions[yearMonth]) {
            monthlyTransactions[yearMonth] = {
                date: `${date.getFullYear()}-${date.getMonth() + 1}-01`, // Set to the 1st day of the month
                income: 0,
                expenditure: 0
            };
        }
        
        if(isIncome){
            monthlyTransactions[yearMonth].income += transaction.amount;
        }
        else{
            monthlyTransactions[yearMonth].expenditure += transaction.amount;
        }
        // Add the amount to the total for this month
        
    });

    // Convert the monthlyTransactions object into an array
    return Object.values(monthlyTransactions);
}


function renderVisualizations(){


    // render graph



    // render charts




}



function serializeExtractedData(arr) {
    // Create a new array of objects to store the formatted data
    let formattedArray = [];

    // Loop through the input array
    for (let i = 0; i < arr.length; i++) {
        // Create a new object for each element with proper formatting
        formattedArray.push({
            date: arr[i].date, 
            income: arr[i].income, 
            expenditure: arr[i].expenditure
        });
    }

    // Convert the formatted array to a JSON string
    const jsonString = JSON.stringify(formattedArray, null, 2);

    // Return the JSON string
    return jsonString;
}


    // Function to call the ChatGPT API
async function callChatGPT(inputPrompt) {

    const API_KEY = "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";

    const url = "https://api.openai.com/v1/chat/completions";
    const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
    };

    const data = {
        model: "gpt-3.5-turbo", // You can replace this with 'gpt-4' or other models as needed
        messages: [
            {
                role: "user",  // The message role is 'user' to send a prompt
                content: inputPrompt
            }
        ]
    };

    try {
        // Send the POST request to the OpenAI API
        const response = await fetch(url, {
            method: "POST",
            headers: headers,
            body: JSON.stringify(data)
        });

        // Check if the response is ok (status 200)
        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }

        // Parse the response as JSON
        const responseData = await response.json();

        // Extract the reply from the API response
        const reply = responseData.choices[0].message.content;

        // Display the response in the output div
        return reply;

    } 
    catch (error) {
        console.error("Error calling ChatGPT API:", error);
        document.getElementById('output').textContent = `Error: ${error.message}`;
    }
    }




async function callPredictiveAnalyzer(){

    var predictiveAnalysisPrompt = serializeExtractedData( financialDataExtracted )+'\nthis data is past 36 months income, expenditure and date records. You are a my financial advisor .... use predictive analysis and current market trends considering inflation, my avg income level and avg expenditure level, market growth, financial stability and predict next 24 months data with same format... to convert to json.. please do not add any extra text or explanation before or after the response. i need ONLY the list... {"date" : "2024-11-01", "income": 100.00, "expenditure": 50}.. this is the value that I need until 2026 end';


//     var op = await callChatGPT( predictiveAnalysisPrompt );

//     opArr = JSON.parse( op ) ;

//    financialDataExtracted = financialDataExtracted.concat(opArr);


    financialDataExtracted = [
        {
            "date": "2021-12-01",
            "income": 0,
            "expenditure": 238.21
        },
        {
            "date": "2022-1-01",
            "income": 13263.169999999998,
            "expenditure": 4990.460000000001
        },
        {
            "date": "2022-2-01",
            "income": 6239.030000000001,
            "expenditure": 4638.67
        },
        {
            "date": "2022-3-01",
            "income": 6474.86,
            "expenditure": 5078.909999999998
        },
        {
            "date": "2022-4-01",
            "income": 6531.73,
            "expenditure": 5016.41
        },
        {
            "date": "2022-5-01",
            "income": 6833.8099999999995,
            "expenditure": 5467.969999999998
        },
        {
            "date": "2022-6-01",
            "income": 6517.42,
            "expenditure": 4342.839999999999
        },
        {
            "date": "2022-7-01",
            "income": 9768.300000000001,
            "expenditure": 4837.080000000001
        },
        {
            "date": "2022-8-01",
            "income": 6476.43,
            "expenditure": 4687.75
        },
        {
            "date": "2022-9-01",
            "income": 6774.01,
            "expenditure": 4261.9
        },
        {
            "date": "2022-10-01",
            "income": 6580.98,
            "expenditure": 4497.04
        },
        {
            "date": "2022-11-01",
            "income": 6572.9,
            "expenditure": 3836.210000000001
        },
        {
            "date": "2022-12-01",
            "income": 9538.130000000001,
            "expenditure": 4755.09
        },
        {
            "date": "2023-1-01",
            "income": 6534.59,
            "expenditure": 5160.18
        },
        {
            "date": "2023-2-01",
            "income": 6750.59,
            "expenditure": 3927.9699999999993
        },
        {
            "date": "2023-3-01",
            "income": 6322.5,
            "expenditure": 4296.319999999999
        },
        {
            "date": "2023-4-01",
            "income": 6713.94,
            "expenditure": 4997.160000000001
        },
        {
            "date": "2023-5-01",
            "income": 6535.83,
            "expenditure": 4005.7999999999997
        },
        {
            "date": "2023-6-01",
            "income": 6549.27,
            "expenditure": 4120.880000000001
        },
        {
            "date": "2023-7-01",
            "income": 9812.98,
            "expenditure": 4899.769999999999
        },
        {
            "date": "2023-8-01",
            "income": 6771.1,
            "expenditure": 4668.070000000001
        },
        {
            "date": "2023-9-01",
            "income": 6606.360000000001,
            "expenditure": 5367.04
        },
        {
            "date": "2023-10-01",
            "income": 6565.73,
            "expenditure": 5221.24
        },
        {
            "date": "2023-11-01",
            "income": 6603.26,
            "expenditure": 4790.710000000001
        },
        {
            "date": "2023-12-01",
            "income": 9905.47,
            "expenditure": 4770.56
        },
        {
            "date": "2024-1-01",
            "income": 6457.93,
            "expenditure": 4369.259999999999
        },
        {
            "date": "2024-2-01",
            "income": 6463.49,
            "expenditure": 4375.280000000001
        },
        {
            "date": "2024-3-01",
            "income": 6587.63,
            "expenditure": 4311.410000000001
        },
        {
            "date": "2024-4-01",
            "income": 6498.35,
            "expenditure": 5256.120000000002
        },
        {
            "date": "2024-5-01",
            "income": 6531.1900000000005,
            "expenditure": 3986.16
        },
        {
            "date": "2024-6-01",
            "income": 9734.83,
            "expenditure": 5013.010000000001
        },
        {
            "date": "2024-7-01",
            "income": 6625.9,
            "expenditure": 4898.719999999999
        },
        {
            "date": "2024-8-01",
            "income": 6754.09,
            "expenditure": 4019.3100000000004
        },
        {
            "date": "2024-9-01",
            "income": 6384.79,
            "expenditure": 5437.549999999999
        },
        {
            "date": "2024-10-01",
            "income": 6555.91,
            "expenditure": 4485.59
        },
        {
            "date": "2024-11-01",
            "income": 9964.11,
            "expenditure": 4658.620000000001
        },
        {
            "date": "2024-12-01",
            "income": 6623.74,
            "expenditure": 5261.160000000002
        },
        {
            "date": "2024-12-01",
            "income": 6660.54,
            "expenditure": 5320.45
        },
        {
            "date": "2025-1-01",
            "income": 6687.98,
            "expenditure": 5380.23
        },
        {
            "date": "2025-2-01",
            "income": 6715.42,
            "expenditure": 5439.99
        },
        {
            "date": "2025-3-01",
            "income": 6742.86,
            "expenditure": 5499.77
        },
        {
            "date": "2025-4-01",
            "income": 6770.3,
            "expenditure": 5559.55
        },
        {
            "date": "2025-5-01",
            "income": 6797.74,
            "expenditure": 5619.33
        },
        {
            "date": "2025-6-01",
            "income": 6825.18,
            "expenditure": 5679.11
        },
        {
            "date": "2025-7-01",
            "income": 6852.62,
            "expenditure": 5738.89
        },
        {
            "date": "2025-8-01",
            "income": 6880.06,
            "expenditure": 5798.67
        },
        {
            "date": "2025-9-01",
            "income": 6907.5,
            "expenditure": 5858.45
        },
        {
            "date": "2025-10-01",
            "income": 6934.94,
            "expenditure": 5918.23
        },
        {
            "date": "2025-11-01",
            "income": 6962.38,
            "expenditure": 5978.01
        },
        {
            "date": "2025-12-01",
            "income": 6989.82,
            "expenditure": 6037.79
        },
        {
            "date": "2026-1-01",
            "income": 7017.26,
            "expenditure": 6097.57
        },
        {
            "date": "2026-2-01",
            "income": 7044.7,
            "expenditure": 6157.35
        },
        {
            "date": "2026-3-01",
            "income": 7072.14,
            "expenditure": 6217.13
        },
        {
            "date": "2026-4-01",
            "income": 7099.58,
            "expenditure": 6276.91
        },
        {
            "date": "2026-5-01",
            "income": 7127.02,
            "expenditure": 6336.69
        },
        {
            "date": "2026-6-01",
            "income": 7154.46,
            "expenditure": 6396.47
        },
        {
            "date": "2026-7-01",
            "income": 7181.9,
            "expenditure": 6456.25
        },
        {
            "date": "2026-8-01",
            "income": 7209.34,
            "expenditure": 6516.03
        },
        {
            "date": "2026-9-01",
            "income": 7236.78,
            "expenditure": 6575.81
        },
        {
            "date": "2026-10-01",
            "income": 7264.22,
            "expenditure": 6635.59
        }
    ];

   plotChart(financialDataExtracted)

   console.log(financialDataExtracted);
}


async function callsToDecisionMaker(){

    var decisionMakerPrompt = " You are my Financial Advisor. Using the data I fed you previously, please help me with my query and suggest me the best way to approach my target... Also, consider inflations, market share predictions, labor index, income increments, possible outcomes of several investments.. suggest me a best route to get there and also suggest me a way to maintain financial health down the line after my target is Achieved.. Target: " + document.getElementById("decision_box").value ;

    var op = await callChatGPT(decisionMakerPrompt);

    document.getElementById("genai_output").innerText = op;

    console.log(op);

}



function aggregateExpenditures(transactions) {
    const expenditureMap = {};

    // Iterate through each transaction
    transactions.forEach(transaction => {
        // If the description already exists in the map, add the amount
        if (expenditureMap[transaction.description]) {
            expenditureMap[transaction.description] += transaction.amount;
        } else {
            // Otherwise, add a new entry for this description
            expenditureMap[transaction.description] = transaction.amount;
        }
    });

    return expenditureMap;
}

function loadPieChartData(){

    var piechartMap = aggregateExpenditures(purchases);

    delete piechartMap.string;

console.log(piechartMap);

    debugger;


}










async function fetchPurchases(){

// Fetch request to the Nessie API
const response = await fetch(purchasesUrl, {
method: "GET", 
headers: headers 
});

if (!response.ok) {
// If the response is not ok, throw an error
throw new Error(`Error: ${response.statusText}`);
}

data = await response.json(); // Parse the JSON response

purchases = data;

financialDataExtracted = consolidateMonthlyTransactions(data, false);
console.log("Purchases Done!!");
console.log(financialDataExtracted);

loadPieChartData();

}


async function fetchDeposits(){

              // Fetch request to the Nessie API
const response = await fetch(depositsUrl, {
    method: "GET", 
    headers: headers 
  });
 
      if (!response.ok) {
        // If the response is not ok, throw an error
        throw new Error(`Error: ${response.statusText}`);
      }

      data = await response.json(); // Parse the JSON response

      
        financialDataExtracted = consolidateMonthlyTransactions(data, true);
      console.log("Purchases Done!!");
    console.log(financialDataExtracted);
}


fetchPurchases();

fetchDeposits();


setTimeout(()=>{



callPredictiveAnalyzer();
}, 1000);









