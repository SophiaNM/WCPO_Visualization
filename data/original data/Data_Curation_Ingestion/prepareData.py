
"""
    Modified on 2021-04-17

    @author: Njeri Murage

    prepareData.py:
        connect to postgreSQL database
        read wcpo  tables
        create json object and files

"""

import psycopg2  # PostgreSQL database adapter for the Python
from psycopg2.extras import RealDictCursor  # Access results returned by a cursor
from django.core.serializers.json import DjangoJSONEncoder
import json  # Needed for conversion to json format


##################################################
# Connection to Database and Authentication
##################################################
host = "gip.itc.utwente.nl"
port = 5434
user = ""  # insert your username
password = ""  # insert password
database = "wcpo"  # database name
schema = "public"  # insert schema name

# Connect to PostgreSQL Database
pg = psycopg2.connect(("dbname='%s' user='%s' host='%s' password='%s' port=%d") % (database, user, host, password, port))
cursor = pg.cursor(cursor_factory=RealDictCursor)


# Centroid data and Flow Reformatting
# Read SQL Statements
flow_Query = "select * from flows"
cont_Query = "select * from continentcentroid"
country_Query = "select * from countrycentroid"

#Define function to create json files
def create_json(query, name):
    """ Function used to create json files
    """
    print("Selecting rows from table")
    cursor.execute(query)
    jsonObj = json.dumps(cursor.fetchall(), indent=2, cls=DjangoJSONEncoder)
    print(jsonObj)
    with open(name, 'w') as jsonfile:
        jsonfile.write(jsonObj)
    print('END')


flowsJSON = create_json(flow_Query, 'originalflows.json')
contJSON = create_json(cont_Query, 'continentcentroid.json')
countryJSON = create_json(country_Query, 'countrycentroid.json')


# Write JSON Files
def read_json(file_path):
    with open(file_path, 'r') as handle:
        parsed = json.load(handle)

        return parsed


flowsData = read_json('originalflows.json')
continentData = read_json('continentcentroid.json')
countryData = read_json('countrycentroid.json')



############# Flows data Prepared ##################
import pandas as pd
def read_asdataframe(file_path):
    dataf = pd.read_json (file_path)
    return dataf


flowsdf = read_asdataframe(r'originalflows.json')
continentdf = read_asdataframe(r'continentcentroid.json')
countrydf = read_asdataframe(r'countrycentroid.json')

mergeddforigin = flowsdf.merge(countrydf[['name','continent','x','y','gucode']], left_on='origin_councode', right_on='gucode', suffixes=('_Flow', '_CountryO'))
mergeddfdest = flowsdf.merge(countrydf[['name','continent','x','y','gucode']], left_on='dest_councode', right_on='gucode', suffixes=('_Flow', '_CountryD'))
mergeddforigin = mergeddforigin.rename(columns={"name": "fromName", "x": "x_origin", "y": "y_origin"})
mergeddfdest = mergeddfdest.rename(columns={"name": "toName", "x": "x_dest", "y": "y_dest"})


countryM = mergeddforigin.merge(mergeddfdest, left_on='id', right_on='id', suffixes=('_Or', '_De'))



mergedoriginCont = flowsdf.merge(continentdf[['continent','x','y','cucode']], left_on='origin_contcode', right_on='cucode', suffixes=('_Flow', '_Cont'))
mergeddestCont = flowsdf.merge(continentdf[['continent','x','y','cucode']], left_on='dest_contcode', right_on='cucode', suffixes=('_Flow', '_Cont'))
mergedoriginCont = mergedoriginCont.rename(columns={"continent": "fromName", "x": "x_origin", "y": "y_origin"})
mergeddestCont = mergeddestCont.rename(columns={"continent": "toName", "x": "x_dest", "y": "y_dest"})

continentM = mergedoriginCont.merge(mergeddestCont, left_on='id', right_on='id', suffixes=('_Or','_De'))


countrylist =[]
for index, rows in countryM.iterrows():
    countrydict = {}
    countrydict['id'] = rows['id']
    countrydict['fromName'] = rows['fromName']
    countrydict['origin'] = [rows['x_origin'],rows['y_origin']]
    countrydict['toName'] = rows['toName']
    countrydict['destination'] = [rows['x_dest'], rows['y_dest']]
    countrydict['beneficiary_typefrom'] = rows['origin_benef_Or']
    countrydict['beneficiary_typeto'] = rows['dest_benef_Or']
    countrylist.append(countrydict)
print (countrylist)



contlist =[]
for index, rows in continentM.iterrows():
    contdict = {}
    contdict['id'] = rows['id']
    contdict['fromName'] = rows['fromName']
    contdict['origin'] = [rows['x_origin'],rows['y_origin']]
    contdict['toName'] = rows['toName']
    contdict['destination'] = [rows['x_dest'], rows['y_dest']]
    contdict['beneficiary_typefrom'] = rows['origin_benef_Or']
    contdict['beneficiary_typeto'] = rows['dest_benef_Or']
    contlist.append(contdict)
print (contlist)


vallist = []
for index, rows in countryM.iterrows():
    valdict = {}
    valdict['id'] = rows['id']
    valdict['value'] = rows['value_share_Or']
    vallist.append(valdict)
print(vallist)

newl = []
for i in range(0, len(contlist)):
    for j in range(0, len(vallist)):
        for k in range(0, len(countrylist)):
            nDict = {}
            if contlist[i]['id'] == vallist[j]['id'] == countrylist[k]['id']:
                nDict['id'] = contlist[i]['id']
                nDict['continent'] = contlist[i]
                nDict['country'] = countrylist[k]
                nDict['value'] = vallist[j]['value']
                newl.append(nDict)

print(newl)



import json
with open('flowsdata.json', 'w', encoding='utf-8') as f:
    json.dump(newl, f, ensure_ascii=False, indent=4)

########### End ###########################



######### Sankey prepared #######

with open('data/revisedflows.json', 'r') as handle:
    parsed = json.load(handle)

parsed[1]['origin_contcode']



with open('data/Flows/flowsVersion2.json', 'r') as handle:
    parsed = json.load(handle)

# jsonObj = json.dumps(parsed, sort_keys=True, indent=2)
for i in range(0, len(parsed)):
    if parsed[i]['destination'] == 'US' or parsed[i]['destination'] == 'US (North America)':
        parsed[i]['destination'] = 'United States'
    parsed[i]['source'] = parsed[i].pop('origin')
    parsed[i]['target'] = parsed[i].pop('destination')


parsedlist = []
for i in (range(0, len(parsed))):
    parsedlist.append(parsed[i]['target'])
    parsedlist.append(parsed[i]['source'])


uniquelist = []
for x in parsedlist:
    if x not in uniquelist:
        uniquelist.append(x)
print(len(uniquelist))

nodelist = []
for i in range(0, len(uniquelist)):
    mydict = {}
    mydict['name'] = uniquelist[i]
    nodelist.append(mydict)

sank = {'links':parsed, 'nodes':nodelist}
#
with open('sankeydata.json', 'w') as jsonfile:
    jsonfile.write(json.dumps(sank, indent=2, cls=DjangoJSONEncoder))

############## End ###################
