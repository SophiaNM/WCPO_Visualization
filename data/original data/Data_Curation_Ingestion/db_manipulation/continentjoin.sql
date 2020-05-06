CREATE TABLE continetmarkt AS
	SELECT c.gid, c.continent, c.cucode as continent_code, m.weight, m.cases, m.perc_market, c.geom
	FROM continents as c FULL OUTER JOIN market as m
	ON c.cucode = m.continent_code 