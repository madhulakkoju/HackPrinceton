import requests
import pandas as pd

# Load the dataset from the CSV file
file_path = 'C://Users//mlakkoju//Downloads//HackPrinceton//server//Comprehensive_Financial_Data_with_Spending_Habits.csv'
df = pd.read_csv(file_path)

# Set Nessie API key and base URL
API_KEY = "0992b98e27891f11d3e16d1a5b6adf29"
BASE_URL = "http://api.nessieisreal.com"
CUSTOMER_ID = "672fdac99683f20dd518b395"

headers = {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "apikey": API_KEY
}

# Extract unique accounts from the dataset to create each one only once
unique_accounts = df[['account_id', 'account_type', 'initial_balance', 'credit_limit']].drop_duplicates()

print("Datafrae created")

# Create accounts in Nessie
for _, account in unique_accounts.iterrows():
    account_data = {
        "type": str(account["account_type"]),
        "nickname": f"{account['account_type']} Account",  # Using a simple nickname format
        "balance": account["initial_balance"],
        "rewards": 0
    }
    input("Trying next 1: ")
    
    # Include credit limit only for Credit Card accounts
    if account["account_type"] == "Credit Card" and not pd.isna(account["credit_limit"]):
        account_data["account_number"] = str(account["account_id"])  # Example account number from account_id
        account_data["credit_limit"] = account["credit_limit"]

    response = requests.post(f"{BASE_URL}/customers/{CUSTOMER_ID}/accounts?key={API_KEY}", json=account_data, headers=headers)

    if response.status_code == 201:
        print(f"Account {account['account_id']} created successfully: {response.json()}")
    else:
        print(f"Failed to create account {account['account_id']}: {response.status_code} - {response.json()}")
    input("Move next: ")


input("Done..")