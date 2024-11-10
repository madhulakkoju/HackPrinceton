import requests
import pandas as pd

# Load the dataset from the CSV file
file_path = 'C:/Users/mlakkoju/Downloads/HackPrinceton/server/Extended_Financial_Data_for_Account_1__2022-2024_.csv'
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
unique_vendors = df['vendor'].unique()

print(unique_vendors)

vendor_category_map = {
    "Con Edison": "Utilities",
    "CVS": "Healthcare",
    "Trader Joe's": "Groceries",
    "Spotify": "Entertainment",
    "Rent Payment": "Rent",
    "Walgreens": "Healthcare",
    "Amazon": "Retail",
    "Comcast": "Utilities",
    "Whole Foods": "Groceries",
    "McDonald's": "Dining",
    "Movie Theater": "Entertainment",
    "Target": "Retail",
    "Best Buy": "Electronics",
    "Chipotle": "Dining",
    "Netflix": "Entertainment",
    "Walmart": "Retail",
    "Starbucks": "Dining"
}

vendor_id_map= {}


for vendor in unique_vendors:

    vendorData = {
        "name": vendor,
        "category": vendor_category_map[vendor],
        "address": {
            "street_number": "X",
            "street_name": "Friend",
            "city": "Princeton",
            "state": "NJ",
            "zip": "11790"
        },
        "geocode": {
            "lat": 0,
            "lng": 0
        }
    }

    response = requests.post(f"{BASE_URL}/merchants?key={API_KEY}", json = vendorData, headers=headers)
    if response.status_code == 201:

        print(response)

        vendorValue = response.json()

        print(vendorValue)

        vendor_id_map[vendor] = vendorValue["objectCreated"]["_id"]

    else:
        print(vendor," Failed....")


print("\n\n\n[\n")

for i in unique_vendors:
    print(i," : ", vendor_id_map[i]," ,\n")
print("]")



'''


[

Con Edison  :  672ff6039683f20dd518b39c  ,

CVS  :  672ff6039683f20dd518b39d  ,

Trader Joe's  :  672ff6039683f20dd518b39e  ,

Spotify  :  672ff6039683f20dd518b39f  ,

Rent Payment  :  672ff6039683f20dd518b3a0  ,

Walgreens  :  672ff6039683f20dd518b3a1  ,

Amazon  :  672ff6039683f20dd518b3a2  ,

Comcast  :  672ff6039683f20dd518b3a3  ,

Whole Foods  :  672ff6039683f20dd518b3a4  ,

McDonald's  :  672ff6039683f20dd518b3a5  ,


McDonald's  :  672ff6039683f20dd518b3a5  ,


McDonald's  :  672ff6039683f20dd518b3a5  ,



McDonald's  :  672ff6039683f20dd518b3a5  ,

Movie Theater  :  672ff6039683f20dd518b3a6  ,

Target  :  672ff6039683f20dd518b3a7  ,

Best Buy  :  672ff6039683f20dd518b3a8  ,

Chipotle  :  672ff6039683f20dd518b3a9  ,

Netflix  :  672ff6039683f20dd518b3aa  ,

Walmart  :  672ff6039683f20dd518b3ab  ,

Starbucks  :  672ff6049683f20dd518b3ac  ,

]



'''