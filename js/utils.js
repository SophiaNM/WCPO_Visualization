const countrylist = {
    "name": [ "-99", "AE", "AF", "AG", "AL", "AM", "AO", "AQ", "AR", "AT", "AU", "AZ", "BA", "BB", "BD", "BE", "BF", "BG", "BH", "BI", "BJ", "BN", "BO", "BR", "BS", "BT", "BW", "BY", "BZ", "CA", "CD", "CF", "CG", "CH", "CI", "CK", "CL", "CM", "CN", "CO", "CR", "CU", "CV", "CW", "CY", "CZ", "DE", "DJ", "DK", "DM", "DO", "DZ", "EC", "EE", "EG", "EH", "ER", "ES", "ET", "FI", "FJ", "FK", "FM", "FR", "GA", "GB", "GE", "GF", "GH", "GL", "GM", "GN", "GP", "GQ", "GR", "GT", "GU", "GW", "GY", "HK", "HN", "HR", "HT", "HU", "ID", "IE", "IL", "IM", "IN", "IQ", "IR", "IS", "IT", "JM", "JO", "JP", "KE", "KG", "KH", "KI", "KM", "KP", "KR", "KW", "KZ", "LA", "LB", "LC", "LK", "LR", "LS", "LT", "LU", "LV", "LY", "MA", "MD", "ME", "MG", "MH", "MK", "ML", "MM", "MN", "MP", "MR", "MT", "MU", "MV", "MW", "MX", "MY", "MZ", "NA", "NC", "NE", "NF", "NG", "NI", "NL", "NO", "NP", "NR", "NU", "NZ", "OM", "PA", "PE", "PF", "PG", "PH", "PK", "PL", "PR", "PS", "PT", "PW", "PY", "QA", "RE", "RO", "RS", "RU", "RW", "SA", "SB", "SC", "SD", "SE", "SG", "SI", "SK", "SL", "SN", "SO", "SR", "SS", "ST", "SV", "SY", "SZ", "TC", "TD", "TF", "TG", "TH", "TJ", "TK", "TL", "TM", "TN", "TO", "TR", "TT", "TV", "TW", "TZ", "UA", "UG", "US", "UY", "UZ", "VA", "VC", "VE", "VI", "VN", "VU", "WF", "WS", "XK", "YE", "YT", "ZA", "ZM", "ZW" ],
    "fullname": [ "Null", "United Arab Emirates", "Afghanistan", "Antigua and Barbuda", "Albania", "Armenia", "Angola", "Antarctica", "Argentina", "Austria", "Australia", "Azerbaijan", "Bosnia and Herzegovina", "Barbados", "Bangladesh", "Belgium", "Burkina Faso", "Bulgaria", "Bahrain", "Burundi", "Benin", "Brunei Darussalam", "Bolivia, Plurinational State of", "Brazil", "Bahamas", "Bhutan", "Botswana", "Belarus", "Belize", "Canada", "Dem. Rep. of the Congo", "Central African Republic", "Congo", "Switzerland", "Côte d'Ivoire", "Cook Islands", "Chile", "Cameroon", "China", "Colombia", "Costa Rica", "Cuba", "Cape Verde", "Curaçao", "Cyprus", "Czech Republic", "Germany", "Djibouti", "Denmark", "Dominica", "Dominican Republic", "Algeria", "Ecuador", "Estonia", "Egypt", "Western Sahara", "Eritrea", "Spain", "Ethiopia", "Finland", "Fiji", "Falkland Islands", "Micronesia", "France", "Gabon", "United Kingdom", "Georgia", "French Guiana", "Ghana", "Greenland", "Gambia", "Guinea", "Guadeloupe", "Equatorial Guinea", "Greece", "Guatemala", "Guam", "Guinea-Bissau", "Guyana", "Hong Kong", "Honduras", "Croatia", "Haiti", "Hungary", "Indonesia", "Ireland", "Israel", "Isle of Man", "India", "Iraq", "Iran (Islamic Rep. of)", "Iceland", "Italy", "Jamaica", "Jordan", "Japan", "Kenya", "Kyrgyzstan", "Cambodia", "Kiribati", "Comoros", "Korea, Democratic People's Republic of", "Republic of Korea", "Kuwait", "Kazakhstan", "Laos", "Lebanon", "Saint Lucia", "Sri Lanka", "Liberia", "Lesotho", "Lithuania", "Luxembourg", "Latvia", "Libya", "Morocco", "Moldova", "Montenegro", "Madagascar", "Marshall Islands", "Macedonia", "Mali", "Myanmar", "Mongolia", "Northern Mariana Islands", "Mauritania", "Malta", "Mauritius", "Maldives", "Malawi", "Mexico", "Malaysia", "Mozambique", "Namibia", "New Caledonia", "Niger", "Norfolk Island", "Nigeria", "Nicaragua", "Netherlands", "Norway", "Nepal", "Nauru", "Niue", "New Zealand", "Oman", "Panama", "Peru", "French Polynesia", "Papua New Guinea", "Philippines", "Pakistan", "Poland", "Puerto Rico", "Palestinian", "Portugal", "Palau", "Paraguay", "Qatar", "Réunion", "Romania", "Serbia", "Russian Federation", "Rwanda", "Saudi Arabia", "Solomon Islands", "Seychelles", "Sudan", "Sweden", "Singapore", "Slovenia", "Slovakia", "Sierra Leone", "Senegal", "Somalia", "Suriname", "South Sudan", "São Tomé and Príncipe", "El Salvador", "Syrian Arab Rep.", "Swaziland", "Turks and Caicos Islands", "Chad", "French Southern Territories", "Togo", "Thailand", "Tajikistan", "Tokelau", "East Timor", "Turkmenistan", "Tunisia", "Tonga", "Turkey", "Trinidad and Tobago", "Tuvalu", "Taiwan", "United Rep. of Tanzania", "Ukraine", "Uganda", "United States of America", "Uruguay", "Uzbekistan", "Vatican City", "Saint Vincent and the Grenadines", "Venezuela", "U.S. Virgin Islands", "Vietnam", "Vanuatu", "Wallis and Futuna", "Samoa", "Kosovo", "Yemen", "Mayotte", "South Africa", "Zambia", "Zimbabwe" ]};

const idToName = function(id){
    var fixedId = countrylist.name.indexOf(id);
    if (fixedId != - 1){
        return countrylist.fullname[fixedId];
    } else{
        return - 1;
    }
};

const nameToId = function(name){
    var fixedId = countrylist.fullname.indexOf(name);
    if (fixedId != - 1){
        return countrylist.name[fixedId];
    } else{
        return - 1;
    }
};
const createArcs = function (path){
    var x1 = parseFloat(path.split("L")[0].substring(1).split(",")[0]);
    var y1 = parseFloat(path.split("L")[0].substring(1).split(",")[1]);
    var x2 = parseFloat(path.split("L")[1].split(",")[0]);
    var y2 = parseFloat(path.split("L")[1].split(",")[1]);
    var ax1 = 0;
    var ay1 = 0;
    var ax2 = 0;
    var ay2 = 0;
    var dx = 70;
    var dy = 70;
    var distance = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
    //only create a bezier if the distance is long enough
    if (distance > 100){
        if (x2 > x1){
            if (y2 > y1){
                ax1 = (x1 + x2) / 2 - dx;
                ay1 = (y1 + y2) / 2 + dy;
            } else {
                ax1 = (x1 + x2) / 2 + dx;
                ay1 = (y1 + y2) / 2 + dy;
            }
        }
        else {
            if (y2 > y1){
                ax1 = (x1 + x2) / 2 + dx;
                ay1 = (y1 + y2) / 2 - dy;
            } else {
                ax1 = (x1 + x2) / 2 - dx;
                ay1 = (y1 + y2) / 2 - dy;
            }
        }
        path = "M" + x1 + "," + y1 + "Q" + ax1 + "," + ay1 + " " + x2 + "," + y2;
    }else{
		xRotation = -45;
		largeArc = 1;
        drx = 15;
        dry = 10;
		x2 = x2 + 1;
		y2 = y2 + 1;
		sweep = 1;
		path = "M" + x1 + "," + y1 + "A" + drx + "," + dry + " " + xRotation + "," + largeArc + "," + sweep + " " + x2 + "," + y2;
	}
    return path;
}
function escapeRegExp(str) {
    return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}
function replaceAll(str, find, newtext) {
  str = str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "");
  return str.replace(new RegExp(escapeRegExp(find), 'g'), newtext);
}

function gradientNameFun(d) { return "grd"+replaceAll(d.fromName," ","_")+"_"+replaceAll(d.toName," ","_"); }
function gradientRefNameFun(d) { return "url(#"+gradientNameFun(d)+")"; }