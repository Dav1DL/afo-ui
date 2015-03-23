

require(["submodules/fenix-ui-menu/js/paths",
		 "submodules/fenix-ui-common/js/Compiler"
		 ], function(Menu, Compiler) {

    var menuConfig = Menu;
    
    menuConfig['baseUrl'] = "submodules/fenix-ui-menu/js";

    Compiler.resolve([menuConfig], {
        placeholders : {
            FENIX_CDN: "//fenixapps.fao.org/repository"
        },
        config: {
			paths: {
				'text': "//fenixapps.fao.org/repository/js/requirejs/plugins/text/2.0.12/text",
				'i18n': "//fenixapps.fao.org/repository/js/requirejs/plugins/i18n/2.0.4/i18n",
				'domready': "//fenixapps.fao.org/repository/js/requirejs/plugins/domready/2.0.1/domReady",

				'amplify' : "//fenixapps.fao.org/repository/js/amplify/1.1.2/amplify.min",
				'highcharts': "//fenixapps.fao.org/repository/js/highcharts/4.0.4/js/highcharts",

				'underscore': "//fenixapps.fao.org/repository/js/underscore/1.7.0/underscore.min",
				'handlebars': "//fenixapps.fao.org/repository/js/handlebars/2.0.0/handlebars",
				//'swag': "//fenixapps.fao.org/repository/js/handlebars/swag/0.6.1/lib/swag.min",

				'domReady': "//fenixapps.fao.org/repository/js/requirejs/plugins/domready/2.0.1/domReady",
				'swiper': "//fenixapps.fao.org/repository/js/swiper/2.7.5/dist/idangerous.swiper.min",
				'bootstrap': "//fenixapps.fao.org/repository/js/bootstrap/3.3.2/js/bootstrap.min",
				'draggabilly': "//fenixapps.fao.org/repository/js/draggabilly/dist/draggabilly.pkgd.min",
				'intro': "//fenixapps.fao.org/repository/js/introjs/1.0.0/intro",
				'isotope': "//fenixapps.fao.org/repository/js/isotope/2.1.0/dist/isotope.pkgd.min",
				'jquery': "//fenixapps.fao.org/repository/js/jquery/2.1.1/jquery.min",
				'jqwidgets': "//fenixapps.fao.org/repository/js/jqwidgets/3.1/jqx-light",
				'jstree': "//fenixapps.fao.org/repository/js/jstree/3.0.8/dist/jstree.min",

				'jquery-ui': "//fenixapps.fao.org/repository/js/jquery-ui/1.10.3/jquery-ui-1.10.3.custom.min",
				'jquery.hoverIntent': "//fenixapps.fao.org/repository/js/jquery.hoverIntent/1.0/jquery.hoverIntent",
				'jquery.i18n.properties': "//fenixapps.fao.org/repository/js/jquery/1.0.9/jquery.i18n.properties-min",
				'import-dependencies': "//fenixapps.fao.org/repository/js/FENIX/utils/import-dependencies-1.0",

                'jquery.rangeSlider': '//fenixapps.fao.org/repository/js/jquery.rangeslider/5.7.0/jQDateRangeSlider-min',
			},

		    shim: {
		        'bootstrap': ['jquery'],
		        'chosen': ['jquery'],
		        'highcharts': ['jquery'],
		        'jstree': ['jquery'],
		        'jquery-ui': ['jquery'],
		        'jquery.power.tip': ['jquery'],
		        'jquery.i18n.properties': ['jquery'],
		        'jquery.hoverIntent': ['jquery'],
                'jquery.rangeSlider': ['jquery', 'jquery-ui'],
		        'underscore': {
		            exports: '_'
		        },
                'amplify': {
                    deps: ['jquery'],
                    exports: 'amplifyjs'
                },
                'swag': ['handlebars']        
		    }
		}
    });

	require([
	    'jquery', 'underscore', 'bootstrap', 'highcharts', 'jstree', 'handlebars', 'swiper', 
	    'text!config/services.json',
		'text!html/table.html',

		'fx-menu/start',
        './scripts/components/AuthenticationManager',

        'amplify',
        'jquery.rangeSlider',
		'domready!'
	], function($,_,bts,highcharts,jstree,Handlebars,Swiper,
		Config,
		table,

		TopMenu,
		AuthenticationManager
		) {

		Config = JSON.parse(Config);

		tableTmpl = Handlebars.compile(table);

		function getWDS(queryTmpl, queryVars, callback) {

			var sqltmpl, sql;

			if(queryVars) {
				sqltmpl = _.template(queryTmpl);
				sql = sqltmpl(queryVars);
			}
			else
				sql = queryTmpl;

			var	data = {
					datasource: Config.dbName,
					thousandSeparator: ',',
					decimalSeparator: '.',
					decimalNumbers: 2,
					cssFilename: '',
					nowrap: false,
					valuesIndex: 0,
					json: JSON.stringify({query: sql})
				};

			$.ajax({
				url: Config.wdsUrl,
				data: data,
				type: 'POST',
				dataType: 'JSON',
				success: callback
			});
		}

		function formatMonth(date) {
			return [date.slice(0,4),'/',date.slice(4)].join('')
		}
        //JQUERY range slider
        $(".afo-range").dateRangeSlider();

        new TopMenu({
            active: 'prices_international',
            url: 'config/fenix-ui-menu.json',
            className : 'fx-top-menu',
            breadcrumb : {
                active : true,
                container : "#breadcumb_container",
                showHome : true
            }
        });

        new AuthenticationManager();
        amplify.subscribe('login', function (user) {
            console.warn("Event login intercepted");
            console.log(amplify.store.sessionStorage('afo.security.user'));
        });

		var table$ = $('#prices_international_grid'),
			chart$ = $('#prices_international_chart');

		var date = new Date();
		chart$.attr({
			src:'http://classic.africafertilizer.org/AF-media/Docs-for-international-prices-pages/AfricaFertilizer-price-trend-graphs-('+
				//date.toString().toLowerCase().substr(4,3) + date.getFullYear()+
				'jan2015'+
				').aspx'});

		$('.footer').load('html/footer.html');

		//$('#prices_international_grid').load("prices/html/prices_international.html");
		table$.html('<big class="text-center">Loading data...<br /><br /></big>');
		getWDS(Config.queries.prices_international, null, function(data) {

console.log(data);

			var cols = data[0][2].split('|'),
				year = cols.pop(),
				month = cols.pop(),
				months = _.map(cols, function(val) {
					return formatMonth(val);
				});

			var	headers = _.union(['Nutrient','Fertilizer'], months, [month, year]),
				rows = _.map(data, function(val) {
					var vv = val[3].split('|');
					vv[vv.length-1] += '%';
					vv[vv.length-2] += '%';
					return [val[0], val[1]].concat( vv );
				});

			table$.html( tableTmpl({
				headers: headers,
				rows: rows
			}) );

			//var mdate = (new Date()).toDateString().split(' ');
			//$('#market_date').text(mdate[1]+' '+mdate[3]);

			console.log(rows);

		});
    });
});