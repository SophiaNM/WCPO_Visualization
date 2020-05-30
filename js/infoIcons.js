    $(document).ready(function () {
        var hoverHTMLDemoBasic = '<p>' +
            'The bar chart represents the % of weight in MT  for a country over the total global tuna fish weight caught or processed per beneficiary type';
        $("#barchartInfo").hovercard({
            detailsHTML: hoverHTMLDemoBasic,
            width: 285,

        });
    });
    $(document).ready(function () {
        var hoverHTMLDemoBasic = '<p>' +
            'Sankey diagram indictes the direction of MES flows from origin to destination in the supply value chain';
        $("#sankeyInfo").hovercard({
            detailsHTML: hoverHTMLDemoBasic,
            width: 250,

        });
    });
    $(document).ready(function () {
        var hoverHTMLDemoBasic = '<p>' +
            'Map panel shows the flows of economic benefits of tuna fish caught, processed or exported in the supply value chain from resource owner or fleet owner to processing then to market';
        $("#flowmapInfo").hovercard({
            detailsHTML: hoverHTMLDemoBasic,
            width: 320,

        });
    });
    $(document).ready(function () {
        var hoverHTMLDemoBasic = '<p>' +
            'Click the legend to interactively filter the flows.';
        $("#maplegendInfo").hovercard({
            detailsHTML: hoverHTMLDemoBasic,
            width: 150,

        });
    });
