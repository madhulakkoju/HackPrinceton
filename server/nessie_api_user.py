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


# Convert the given list into a dictionary (map)
vendor_id_mapping = {
    "Con Edison": "672ff6039683f20dd518b39c",
    "CVS": "672ff6039683f20dd518b39d",
    "Trader Joe's": "672ff6039683f20dd518b39e",
    "Spotify": "672ff6039683f20dd518b39f",
    "Rent Payment": "672ff6039683f20dd518b3a0",
    "Walgreens": "672ff6039683f20dd518b3a1",
    "Amazon": "672ff6039683f20dd518b3a2",
    "Comcast": "672ff6039683f20dd518b3a3",
    "Whole Foods": "672ff6039683f20dd518b3a4",
    "McDonald's": "672ff6039683f20dd518b3a5",
    "Movie Theater": "672ff6039683f20dd518b3a6",
    "Target": "672ff6039683f20dd518b3a7",
    "Best Buy": "672ff6039683f20dd518b3a8",
    "Chipotle": "672ff6039683f20dd518b3a9",
    "Netflix": "672ff6039683f20dd518b3aa",
    "Walmart": "672ff6039683f20dd518b3ab",
    "Starbucks": "672ff6049683f20dd518b3ac"
}

# Print the dictionary to verify
print(vendor_id_mapping)

file_path = 'C:/Users/mlakkoju/Downloads/HackPrinceton/server/Extended_Financial_Data_for_Account_1__2022-2024_.csv'
df = pd.read_csv(file_path)


# Iterating through each transaction in the dataset
for _, transaction in df.iterrows():
    account_id = ACCOUNT_ID


    transaction_data = {
        "merchant_id": vendor_id_mapping[transaction['vendor']],
        "medium": "balance",
        "purchase_date": transaction["date"],
        "amount": transaction["amount"],
        "status": "completed",
        "description": transaction["category"]
        }
    

    # Post transaction to the corresponding account
    response = requests.post(
        f"{BASE_URL}/accounts/{ACCOUNT_ID}/purchases?key={API_KEY}",
        json=transaction_data,
        headers=headers
    )

    if response.status_code == 201:
        print(f"Transaction {transaction['transaction_id']} for Account {account_id} posted successfully: {response.json()}")
    else:
        print(f"Failed to post transaction {transaction['transaction_id']} for Account {account_id}: {response.status_code} - {response.json()}")




input()