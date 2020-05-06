
"""
Modified on 2020-04-17

@author: Njeri Murage

wcpo_tblinstance.py:
    connect to postgreSQL database
    create wcpo  tables
    access data from shapefiles and csv
    write records  into the respective PostregSQL database table
    oad request as a JSON object

"""

import psycopg2  # PostgreSQL database adapter for the Python
from psycopg2.extras import RealDictCursor  # Access results returned by a cursor
import pandas as pd
import json  # Needed for conversion to json format
import requests  # A package that allows to access the web.

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


##################################################
# Creation of Database Tables
##################################################

def create_beneftable():
    """Function used to create country distribution tables in PostgreSQL database and specified schema."""

    print("#####Creating Table########")
    query = "CREATE TABLE IF NOT EXISTS public.beneficiary" \
            "(id serial NOT NULL,country_name character varying,country_code character varying," \
            "continent_code character varying, perc_resource numeric, resource_catch numeric, resource_value numeric, " \
            "perc_fleet numeric, fleet_catch numeric, fleet_vessels integer, perc_processing numeric, " \
            "processing_weight numeric,CONSTRAINT pk_id PRIMARY KEY (id))"
    cursor.execute(query)
    pg.commit()
    print("Finished")


def create_markettable():
    """Function used to create market distribution tables in PostgreSQL database and specified schema."""

    print("#####Creating Table########")
    query = "CREATE TABLE IF NOT EXISTS public.market" \
            "(id serial NOT NULL,region character varying, weight numeric, cases integer, " \
            "perc_market numeric, continent_code character varying, CONSTRAINT mk_id PRIMARY KEY (id))"
    cursor.execute(query)
    pg.commit()
    print("Finished")


def create_ODtable():
    """Function used to create origin destination tables in PostgreSQL database and specified schema."""

    print("#####Creating Table########")
    query = "CREATE TABLE IF NOT EXISTS public.flows" \
            "(id serial NOT NULL,origin character varying,origin_councode character varying," \
            "origin_contcode character varying, destination character varying,dest_councode character varying," \
            "dest_contcode character varying, value_share numeric, stepfrom integer, stepto integer, " \
            "origin_benef character varying, dest_benef character varying,CONSTRAINT odk_id PRIMARY KEY (id))"
    cursor.execute(query)
    pg.commit()
    print("Finished")

def create_flowtable():
    """Function used to create origin destination tables in PostgreSQL database and specified schema."""

    print("#####Creating Table########")
    query = "CREATE TABLE IF NOT EXISTS public.flows" \
            "(id serial NOT NULL,origin character varying,origin_councode character varying, countrycode integer," \
            "origin_contcode character varying, destination character varying,countrydestcode integer, " \
            "dest_councode character varying, dest_contcode character varying, value_share numeric, stepfrom integer, stepto integer, " \
            "origin_benef character varying, dest_benef character varying,CONSTRAINT flk_id PRIMARY KEY (id))"
    cursor.execute(query)
    pg.commit()
    print("Finished")

beneficiary_tbl = create_beneftable()
market_tbl = create_markettable()
oddata_tbl = create_ODtable()
oddata_tbl = create_flowtable()


#######################################################
# Reading and Cleaning Data
#######################################################


def read_benef_file(file_path):
    """Function that reads the csv file creates and returns a list of its records."""

    beneficiary = pd.read_csv(file_path, encoding="ISO-8859-1")
    beneficiary.fillna('0', inplace=True)
    beneficiary[['PercResource','resourceCatch_metricTons','resourceDollar_value ','PercFleet',
               'fleetCatch_mT','PercProcessing','processingCatch_mT']].round(2)
    beneficiary['fleetVessels'].astype('int')
    return beneficiary


def read_market_file(file_path):
    """Function that reads the csv file creates and returns a list of its records."""
    market = pd.read_csv(file_path, encoding="ISO-8859-1")
    market.fillna('0', inplace=True)
    market[['Perc_Market','Weight']].round(2)
    market['Cases'].astype('int')
    return market


def read_od_file(file_path):
    """Function that reads the csv file creates and returns a list of its records."""
    od_data = pd.read_csv(file_path, encoding="ISO-8859-1")
    od_data.fillna('0', inplace=True)
    od_data['Value_share'].round(2)
    od_data[['StepFrom','StepTo']].astype('int')
    return od_data

def read_flow_file(file_path):
    """Function that reads the csv file creates and returns a list of its records."""
    od_data = pd.read_csv(file_path, encoding="ISO-8859-1")
    od_data.fillna('0', inplace=True)
    od_data['Value_share'].round(2)
    od_data[['StepFrom','StepTo','countrycode','countrydestcode']].astype('int')
    return od_data

beneficiary_data = read_benef_file(r'Z:\projects\WCPO\data\Data_Curation\country_distribution.csv')
market_data = read_market_file(r'Z:\projects\WCPO\data\Data_Curation\market_data.csv')
od_data = read_od_file(r'Z:\projects\WCPO\data\Data_Curation\od_data.csv')
flow_data = read_flow_file(r'Z:\projects\WCPO\data\Data_Curation\flow_revised.csv')
# Insert correct file locations


#######################################################
# Insert records into database table
#######################################################
def insert_benefdata(data):
    """ Function used to retrieve data from dataframes and insert the values in PostgreSQL areas table.
    """

    data = data.sort_values(by = 'Country')
    for (index_label, row_series) in data.iterrows():
        print('Row Index label : ', index_label)
        country = row_series['Country']
        count_code = row_series['Country_code']
        cont_code = row_series['Continent_code']
        perc_resource = row_series['PercResource']
        resource_catch = row_series['resourceCatch_metricTons']
        resource_value = row_series['resourceDollar_value ']
        perc_fleet = row_series['PercFleet']
        fleet_catch = row_series['fleetCatch_mT']
        fleet_vessel = row_series['fleetVessels']
        perc_process = row_series['PercProcessing']
        processing = row_series['processingCatch_mT']


        print('Row Content as Series : ', country)
        print(country.replace("'", "\'"))

        query = '''INSERT INTO public.beneficiary (country_name,country_code,continent_code,perc_resource, 
        resource_catch,resource_value, perc_fleet, fleet_catch, fleet_vessels, perc_processing, processing_weight) 
                VALUES ('{}','{}','{}',{},{},{},{},{},{},{},{})'''\
            .format(country.replace("'", "\'"), count_code, cont_code,perc_resource,resource_catch,
                    resource_value, perc_fleet, fleet_catch,int(fleet_vessel),perc_process,processing)
        cursor.execute(query)
        pg.commit()
        print("END")
        print()

def insert_marketdata(data):
    """ Function used to retrieve data from dataframes and insert the values in PostgreSQL areas table.
    """

    data = data.sort_values(by = 'Region')
    for (index_label, row_series) in data.iterrows():
        print('Row Index label : ', index_label)
        region = row_series['Region']
        weight = row_series['Weight']
        cases = row_series['Cases']
        perc_market = row_series['Perc_Market']
        cont_code = row_series['Cont_code']

        print('Row Content as Series : ', region)
        print(region.replace("'", "\'"))

        query = '''INSERT INTO public.market (region,weight,cases,perc_market, continent_code) 
                VALUES ('{}',{},{},{},'{}')'''\
            .format(region.replace("'", "\'"), weight, int(cases),perc_market,cont_code)

        cursor.execute(query)
        pg.commit()
        print("END")
        print()


def insert_oddata(data):
    """ Function used to retrieve data from dataframes and insert the values in PostgreSQL areas table.
    """

    data = data.sort_values(by = 'Origin')
    for (index_label, row_series) in data.iterrows():
        print('Row Index label : ', index_label)
        origin = row_series['Origin']
        orig_countrycode = row_series['orig_countCode']
        orig_continentcode = row_series['orig_contCode']
        destination = row_series['Destination']
        dest_countrycode = row_series['dest_countCode']
        dest_continentcode = row_series['dest_contCode']
        value_share = row_series['Value_share']
        stepfrom = row_series['StepFrom']
        stepto = row_series['StepTo']
        origin_beneficiary = row_series['O']
        dest_beneficiary = row_series['D']

        print('Row Content as Series : ', origin)
        print(origin.replace("'", "\'"))

        query = '''INSERT INTO public.oddata (origin,origin_councode,origin_contcode,destination, dest_councode,
        dest_contcode,value_share, stepfrom, stepto, origin_benef, dest_benef) 
                VALUES ('{}','{}','{}','{}','{}','{}',{},{},{},'{}','{}')'''\
            .format(origin.replace("'", "\'"), orig_countrycode,orig_continentcode, destination,
                    dest_countrycode,dest_continentcode,value_share,int(stepfrom),int(stepto),
                    origin_beneficiary,dest_beneficiary)

        cursor.execute(query)
        pg.commit()
        print("END")
        print()


def insert_flowdata(data):
    """ Function used to retrieve data from dataframes and insert the values in PostgreSQL areas table.
    """

    data = data.sort_values(by = 'Origin')
    for (index_label, row_series) in data.iterrows():
        print('Row Index label : ', index_label)
        origin = row_series['Origin']
        orig_countrycode = row_series['orig_countCode']
        countrycode = row_series['countrycode']
        orig_continentcode = row_series['orig_contcode']
        destination = row_series['Destination']
        countrydestcode = row_series['countrydestcode']
        dest_countrycode = row_series['dest_countCode']
        dest_continentcode = row_series['dest_contCode']
        value_share = row_series['Value_share']
        stepfrom = row_series['StepFrom']
        stepto = row_series['StepTo']
        origin_beneficiary = row_series['O']
        dest_beneficiary = row_series['D']

        print('Row Content as Series : ', origin)
        print(origin.replace("'", "\'"))

        query = '''INSERT INTO public.flows (origin, origin_councode, countrycode, origin_contcode,destination,
        countrydestcode, dest_councode, dest_contcode,value_share, stepfrom, stepto, origin_benef, dest_benef) 
                VALUES ('{}','{}',{},'{}','{}',{},'{}','{}',{},{},{},'{}','{}')'''\
            .format(origin.replace("'", "\'"), orig_countrycode,countrycode,orig_continentcode, destination,countrydestcode,
                    dest_countrycode,dest_continentcode,value_share,int(stepfrom),int(stepto),
                    origin_beneficiary,dest_beneficiary)

        cursor.execute(query)
        pg.commit()
        print("END")
        print()

insert_benefdata(beneficiary_data)
insert_marketdata(market_data)
insert_oddata(od_data)
insert_flowdata(flow_data)

#################### End ###########################