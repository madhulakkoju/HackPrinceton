import requests
import numpy as np, pandas as pd

# Set Nessie API key and base URL
API_KEY = "0992b98e27891f11d3e16d1a5b6adf29"
BASE_URL = "http://api.nessieisreal.com"
headers = {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "apikey": API_KEY
}


CUSTOMER_ID="672fdac99683f20dd518b395"
ACCOUNT_ID="672fdbba9683f20dd518b396"


file_path = 'C:/Users/mlakkoju/Downloads/HackPrinceton/server/income_data.csv'
df = pd.read_csv(file_path)


# Iterating through each transaction in the dataset
for _, transaction in df.iterrows():
    account_id = ACCOUNT_ID


    transaction_data = {
        "medium": "balance",
        "transaction_date": transaction["date"],
        "amount":transaction["amount"],
        "status": "completed",
        "description": transaction["description"]
    }
    

    # Post transaction to the corresponding account
    response = requests.post(
        f"{BASE_URL}/accounts/{ACCOUNT_ID}/deposits?key={API_KEY}",
        json=transaction_data,
        headers=headers
    )

    if response.status_code == 201:
        print(f"Transaction posted")
    else:
        print(f"Failed ")




input()