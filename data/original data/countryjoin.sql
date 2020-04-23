CREATE TABLE countrybenefit AS
	SELECT c.gid, c.name, c.gucode as country_code, c.cucode as continent_code, b.perc_resource, b.perc_fleet, b.perc_processing, b.resource_catch, b.fleet_catch, b.fleet_vessels, b.processing_weight, c.geom
	FROM country as c FULL OUTER JOIN beneficiary as b
	ON c.gucode = b.country_code 