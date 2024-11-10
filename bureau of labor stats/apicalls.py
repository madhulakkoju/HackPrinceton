import requests
import json
import prettytable
headers = {'Content-type': 'application/json'}

popular = requests.post('https://api.bls.gov/publicAPI/v2/timeseries/popular',  headers=headers)
popular_data = json.loads(popular.text)

print("popular_data")

#print(popular_data)

popularSeries = []

for i in popular_data['Results']['series']:
    # print(i)
    popularSeries.append(i['seriesID'])

popularSeries= [
    'WMU00140201020000001300002500',  # Average hourly wage for business and financial operations
    'CES0500000001',  # Average hourly earnings for all workers
    'CES0000000001',  # Hourly wages by industry
    'LNS14000000',  # Unemployment rate (national)
    'LNS14000006',  # Unemployment rate by demographic group
    'LNS11300000',  # Labor force participation rate
    'CUUR0000SA0',  # Consumer Price Index (CPI) for all urban consumers
    'CUSR0000SA0L1E',  # CPI for specific goods and services
    'CUSR0000SAM1',  # PCE price index (Personal Consumption Expenditures)
    'CPS0000000001',  # Median household income
    'LNS12300000',  # Poverty rate
    'LNS12000000',  # Income inequality (Gini Index)
    'CES3000000001',  # Projected employment growth by industry
    'LNS12035019',  # Projected job openings by occupation
    'CUUR0000SA0',  # CPI for All Urban Consumers, U.S. City Average, All Items
    'CUSR0000SA0',  # CPI for All Urban Consumers, U.S. City Average, All Items (Not Seasonally Adjusted)
    'CUUR0000SA0L1E',  # CPI, All Urban Consumers, U.S. City Average, All Items (Excluding Food and Energy)
    'CUSR0000SA0L1E',  # CPI, All Urban Consumers, U.S. City Average, All Items (Excluding Food and Energy) - NSA
    'CUUR0000SEMC01',  # CPI, All Urban Consumers, U.S. City Average, All Items Less Food and Energy
    'CUUR0000SEMC02',  # CPI, All Urban Consumers, U.S. City Average, All Items Less Food and Energy - NSA
    'PCU327320327320',  # PPI for Manufactured Goods
    'PCU33312033312014',  # PPI for Machinery and Equipment Manufacturing
    'CUUR0000SAM1',  # PCE Price Index for All Urban Consumers
]


data = json.dumps({"seriesid": popularSeries ,"startyear":"2010", "endyear":"2025"})
p = requests.post('https://api.bls.gov/publicAPI/v2/timeseries/data/', data=data, headers=headers)
json_data = json.loads(p.text)
for series in json_data['Results']['series']:
    x=prettytable.PrettyTable(["series id","year","period","value","footnotes"])
    seriesId = series['seriesID']
    for item in series['data']:
        year = item['year']
        period = item['period']
        value = item['value']
        footnotes=""
        for footnote in item['footnotes']:
            if footnote:
                footnotes = footnotes + footnote['text'] + ','
        if 'M01' <= period <= 'M12':
            x.add_row([seriesId,year,period,value,footnotes[0:-1]])
    output = open("training_data/"+seriesId + '.txt','w')
    output.write (x.get_string())
    output.close()