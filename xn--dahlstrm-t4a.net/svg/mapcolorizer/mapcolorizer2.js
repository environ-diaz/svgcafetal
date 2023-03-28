/**
 * A simple map colorizer. This variant keeps the mapping between countrycode and countryname.
 *
 * By Erik Dahlstrom, ed@opera.com, 2008.
 * (c) Opera Software ASA
 *
 * This work is licensed under the Creative Commons Attribution-Share Alike 3.0 license.
 * http://creativecommons.org/licenses/by-sa/3.0/
 *
 * Official site for the script (and further enhancements):
 *   http://github.com/zui/mapcolorizer/tree
 *
 * @param elm The {embed,object,iframe} element that points to a compatible svg (map) graphic
 */
function MapColorizer(elm) {
  var cc = new Array();   // array of countrycodes
  var ctol = new Array(); // countrycode to long countryname
  var cn = new Array();   // array of long countrynames
  var ctov = new Array(); // countrycode to value
  var maxcolor = null;
  var mincolor = null;
  var picker = null;
  var lastevent = null;
  var selectedCountry = null;
  var stylesheet = null;
  var zoomview = null;
  var mapsvgdoc = null;
  var mapurl = "";
  var mb = null;

  init(elm);

  function init(elm) {
    try {
      mapsvgdoc = elm.contentDocument;
    }
    catch(e) {
      mapsvgdoc = elm.getSVGDocument();
    }

    mapurl = elm.src || elm.data;

    createCountries();
    picker = new ColorPicker(8, 32, 10, colorSelectedCallback, mapsvgdoc);

    mapsvgdoc.documentElement.setAttributeNS(null, "focusHighlight", "none"); // prevents showing a focusrect in Opera 9.5

    mapsvgdoc.documentElement.addEventListener("mousedown", countryMousedown, false);
    mapsvgdoc.documentElement.addEventListener("mouseup", countryMouseup, false);
    mapsvgdoc.documentElement.addEventListener("mousemove", countryHovered, false);

    mb = new MessageBox(elm, "", 24);
  }

  function createCountries() {
      // http://www.iso.org/iso/iso3166_en_code_lists.txt
      var ccnames = "AFGHANISTAN;AF;ÅLAND ISLANDS;AX;ALBANIA;AL;ALGERIA;DZ;AMERICAN SAMOA;AS;ANDORRA;AD;ANGOLA;AO;ANGUILLA;AI;ANTARCTICA;AQ;ANTIGUA AND BARBUDA;AG;ARGENTINA;AR;ARMENIA;AM;ARUBA;AW;AUSTRALIA;AU;AUSTRIA;AT;AZERBAIJAN;AZ;BAHAMAS;BS;BAHRAIN;BH;BANGLADESH;BD;BARBADOS;BB;BELARUS;BY;BELGIUM;BE;BELIZE;BZ;BENIN;BJ;BERMUDA;BM;BHUTAN;BT;BOLIVIA;BO;BOSNIA AND HERZEGOVINA;BA;BOTSWANA;BW;BOUVET ISLAND;BV;BRAZIL;BR;BRITISH INDIAN OCEAN TERRITORY;IO;BRUNEI DARUSSALAM;BN;BULGARIA;BG;BURKINA FASO;BF;BURUNDI;BI;CAMBODIA;KH;CAMEROON;CM;CANADA;CA;CAPE VERDE;CV;CAYMAN ISLANDS;KY;CENTRAL AFRICAN REPUBLIC;CF;CHAD;TD;CHILE;CL;CHINA;CN;CHRISTMAS ISLAND;CX;COCOS (KEELING) ISLANDS;CC;COLOMBIA;CO;COMOROS;KM;CONGO;CG;CONGO, THE DEMOCRATIC REPUBLIC OF THE;CD;COOK ISLANDS;CK;COSTA RICA;CR;CÔTE D'IVOIRE;CI;CROATIA;HR;CUBA;CU;CYPRUS;CY;CZECH REPUBLIC;CZ;DENMARK;DK;DJIBOUTI;DJ;DOMINICA;DM;DOMINICAN REPUBLIC;DO;ECUADOR;EC;EGYPT;EG;EL SALVADOR;SV;EQUATORIAL GUINEA;GQ;ERITREA;ER;ESTONIA;EE;ETHIOPIA;ET;FALKLAND ISLANDS (MALVINAS);FK;FAROE ISLANDS;FO;FIJI;FJ;FINLAND;FI;FRANCE;FR;FRENCH GUIANA;GF;FRENCH POLYNESIA;PF;FRENCH SOUTHERN TERRITORIES;TF;GABON;GA;GAMBIA;GM;GEORGIA;GE;GERMANY;DE;GHANA;GH;GIBRALTAR;GI;GREECE;GR;GREENLAND;GL;GRENADA;GD;GUADELOUPE;GP;GUAM;GU;GUATEMALA;GT;GUERNSEY;GG;GUINEA;GN;GUINEA-BISSAU;GW;GUYANA;GY;HAITI;HT;HEARD ISLAND AND MCDONALD ISLANDS;HM;HOLY SEE (VATICAN CITY STATE);VA;HONDURAS;HN;HONG KONG;HK;HUNGARY;HU;ICELAND;IS;INDIA;IN;INDONESIA;ID;IRAN, ISLAMIC REPUBLIC OF;IR;IRAQ;IQ;IRELAND;IE;ISLE OF MAN;IM;ISRAEL;IL;ITALY;IT;JAMAICA;JM;JAPAN;JP;JERSEY;JE;JORDAN;JO;KAZAKHSTAN;KZ;KENYA;KE;KIRIBATI;KI;KOREA, DEMOCRATIC PEOPLE'S REPUBLIC OF;KP;KOREA, REPUBLIC OF;KR;KUWAIT;KW;KYRGYZSTAN;KG;LAO PEOPLE'S DEMOCRATIC REPUBLIC;LA;LATVIA;LV;LEBANON;LB;LESOTHO;LS;LIBERIA;LR;LIBYAN ARAB JAMAHIRIYA;LY;LIECHTENSTEIN;LI;LITHUANIA;LT;LUXEMBOURG;LU;MACAO;MO;MACEDONIA, THE FORMER YUGOSLAV REPUBLIC OF;MK;MADAGASCAR;MG;MALAWI;MW;MALAYSIA;MY;MALDIVES;MV;MALI;ML;MALTA;MT;MARSHALL ISLANDS;MH;MARTINIQUE;MQ;MAURITANIA;MR;MAURITIUS;MU;MAYOTTE;YT;MEXICO;MX;MICRONESIA, FEDERATED STATES OF;FM;MOLDOVA, REPUBLIC OF;MD;MONACO;MC;MONGOLIA;MN;MONTENEGRO;ME;MONTSERRAT;MS;MOROCCO;MA;MOZAMBIQUE;MZ;MYANMAR;MM;NAMIBIA;NA;NAURU;NR;NEPAL;NP;NETHERLANDS;NL;NETHERLANDS ANTILLES;AN;NEW CALEDONIA;NC;NEW ZEALAND;NZ;NICARAGUA;NI;NIGER;NE;NIGERIA;NG;NIUE;NU;NORFOLK ISLAND;NF;NORTHERN MARIANA ISLANDS;MP;NORWAY;NO;OMAN;OM;PAKISTAN;PK;PALAU;PW;PALESTINIAN TERRITORY, OCCUPIED;PS;PANAMA;PA;PAPUA NEW GUINEA;PG;PARAGUAY;PY;PERU;PE;PHILIPPINES;PH;PITCAIRN;PN;POLAND;PL;PORTUGAL;PT;PUERTO RICO;PR;QATAR;QA;REUNION;RE;ROMANIA;RO;RUSSIAN FEDERATION;RU;RWANDA;RW;SAINT BARTHÉLEMY;BL;SAINT HELENA;SH;SAINT KITTS AND NEVIS;KN;SAINT LUCIA;LC;SAINT MARTIN;MF;SAINT PIERRE AND MIQUELON;PM;SAINT VINCENT AND THE GRENADINES;VC;SAMOA;WS;SAN MARINO;SM;SAO TOME AND PRINCIPE;ST;SAUDI ARABIA;SA;SENEGAL;SN;SERBIA;RS;SEYCHELLES;SC;SIERRA LEONE;SL;SINGAPORE;SG;SLOVAKIA;SK;SLOVENIA;SI;SOLOMON ISLANDS;SB;SOMALIA;SO;SOUTH AFRICA;ZA;SOUTH GEORGIA AND THE SOUTH SANDWICH ISLANDS;GS;SPAIN;ES;SRI LANKA;LK;SUDAN;SD;SURINAME;SR;SVALBARD AND JAN MAYEN;SJ;SWAZILAND;SZ;SWEDEN;SE;SWITZERLAND;CH;SYRIAN ARAB REPUBLIC;SY;TAIWAN, PROVINCE OF CHINA;TW;TAJIKISTAN;TJ;TANZANIA, UNITED REPUBLIC OF;TZ;THAILAND;TH;TIMOR-LESTE;TL;TOGO;TG;TOKELAU;TK;TONGA;TO;TRINIDAD AND TOBAGO;TT;TUNISIA;TN;TURKEY;TR;TURKMENISTAN;TM;TURKS AND CAICOS ISLANDS;TC;TUVALU;TV;UGANDA;UG;UKRAINE;UA;UNITED ARAB EMIRATES;AE;UNITED KINGDOM;GB;UNITED STATES;US;UNITED STATES MINOR OUTLYING ISLANDS;UM;URUGUAY;UY;UZBEKISTAN;UZ;VANUATU;VU;VENEZUELA;VE;VIET NAM;VN;VIRGIN ISLANDS, BRITISH;VG;VIRGIN ISLANDS, U.S.;VI;WALLIS AND FUTUNA;WF;WESTERN SAHARA;EH;YEMEN;YE;ZAMBIA;ZM;ZIMBABWE;ZW";
      var ccsplit = ccnames.split(/;/);

      for(var i = 0; i < ccsplit.length; i+=2) {
        var longname = ccsplit[i].toLowerCase();
        var code = ccsplit[i+1].toLowerCase();
        cc.push(code);
        cn.push(longname);
        ctol[code] = longname;
      }
    }

    function colorSelectedCallback(color) {
      setCountryColor(selectedCountry, color);
    }

    function countryMousedown(evt) {
      lastevent = evt;
      picker.startShowTimer(evt.clientX, evt.clientY, 250);
    }

    function countryMouseup(evt) {
      dx = Math.abs(lastevent.clientX-evt.clientX);
      dy = Math.abs(lastevent.clientY-evt.clientY);
      if(dx > 2 || dy > 2)
        picker.stopShowTimer();
      picker.hide();
      lastevent = evt;
    }

    function countryHovered(evt) {
      if(picker.visible())
        return false;

      if(!lastevent)
        lastevent = evt;

      dx = Math.abs(lastevent.clientX-evt.clientX);
      dy = Math.abs(lastevent.clientY-evt.clientY);
      if(lastevent.type == "mousedown" && (dx > 2 || dy > 2))
        picker.stopShowTimer();

      lastevent = evt;

      var elm = evt.target;
      var classattr = null;
      while(elm && !classattr) {
        if(elm.nodeType == Node.ELEMENT_NODE && elm.hasAttribute("class"))
          classattr = elm.getAttribute("class");
        elm = elm.parentNode;
      }

      var found = false;
      if(classattr) {
        var classnames = classattr.split(/ /);
        var cc = classnames[classnames.length-1];
        if(cc.length == 2) {
          selectedCountry = cc;
          found = true;
        }
      }

      if(found) {
        mb.setText(ctol[selectedCountry]);
        if(!mb.visible())
          mb.show(300,50);
      } else {
        mb.hide();
      }
    }

    function setCountryColor(cc,color) {
      ctov[cc] = color; // for bookkeeping
      var stylesheet = mapsvgdoc.styleSheets[0];
      for(var i = 0; i < stylesheet.cssRules.length; i++) {
        if(stylesheet.cssRules[i].selectorText == "."+cc) {
          stylesheet.cssRules[i].style.setProperty("fill", color, "important");
          return;
        }
      }
      stylesheet.insertRule("." + cc + " { fill: " + color + " !important }", stylesheet.cssRules.length);
    }

    function getStylesheetText(onlyChanges) {
      var str = "";

      if(onlyChanges) {
        for(var i = 0; i < cc.length; i++) {
        if(ctov[cc[i]])
          str += "." + cc[i] + " {" + ctov[cc[i]] + "} \n";
        }
      } else {
        var stylesheet = mapsvgdoc.styleSheets[0];
        for(var i = 0; i < stylesheet.cssRules.length; i++) {
          str += stylesheet.cssRules[i].cssText + " \n";
        }
      }

      return str;
    }

    return {
      export_svg : function() {
        var xs = new XMLSerializer();

        // workaround for style changes that don't get serialized properly
        var oldstyle = mapsvgdoc.styleSheets[0].ownerNode;
        var styletxt = getStylesheetText(false);
        var newstyle = mapsvgdoc.createElementNS("http://www.w3.org/2000/svg", "style");
        newstyle.textContent = styletxt;
        oldstyle.parentNode.replaceChild(newstyle, oldstyle);

        var str = xs.serializeToString(mapsvgdoc);
        window.open("data:image/svg+xml;charset=utf-8," + str, "Colorized Map", "height=" + 400 + ",width=" + 500);
      },
      export_stylesheet : function() {
        var str = getStylesheetText(false);
        window.open("data:text/css;charset=utf-8," + encodeURIComponent(str), "Map Stylesheet", "height=" + 400 + ",width=" + 500);
      }
    };
}