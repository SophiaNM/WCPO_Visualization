CREATE TABLE countrycontinent 
AS (
WITH new AS 
(SELECT *, ST_PointOnSurface(geom) as Centroid
FROM countrydata) 
SELECT  *, ROUND(ST_X(Centroid)) as X, ROUND(ST_Y(Centroid)) as Y
FROM new)