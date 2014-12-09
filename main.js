

require.config({

	baseUrl: 'src/',

	paths: {
		'i18n'                  :'lib/i18n',
		'text'                  :'lib/text',
		'domready'              :'lib/domready',
		'bootstrap'             :'lib/bootstrap',	
		//'backbone'              :'//cdnjs.cloudflare.com/ajax/libs/backbone.js/1.1.2/backbone-min',
		'highcharts'            :'//fenixapps.fao.org/repository/js/highcharts/4.0.4/js/highcharts',
		//'highcharts_exporting'  :'//fenixapps.fao.org/repository/js/highcharts/4.0.4/js/modules/exporting',
		//'highcharts-heatmap'    :'http://code.highcharts.com/maps/modules/heatmap',
		//'highcharts-data'       :'http://code.highcharts.com/maps/modules/data',
		'jquery'                :'lib/jquery',
		'underscore'            :'lib/underscore',
		'jstree'                :'lib/jstree/jstree.min',
		'handlebars'            :'lib/handlebars',

		//fenix-map-js
		'fenix-map'             :'fenix_modules/fenix-map-js/fenix-map-min',
		'fenix-map-config'      :'fenix_modules/fenix-map-js/fenix-map-config',		
		'chosen'                :'//fenixapps.fao.org/repository/js/chosen/1.0.0/chosen.jquery.min',		
		'leaflet'               :'//fenixapps.fao.org/repository/js/leaflet/0.7.3/leaflet',	    
		'import-dependencies'   :'//fenixapps.fao.org/repository/js/FENIX/utils/import-dependencies-1.0',
		'jquery.power.tip'      :'//fenixapps.fao.org/repository/js/jquery.power.tip/1.1.0/jquery.powertip.min',
		'jquery-ui'             :'//fenixapps.fao.org/repository/js/jquery-ui/1.10.3/jquery-ui-1.10.3.custom.min',
		'jquery.i18n.properties':'//fenixapps.fao.org/repository/js/jquery/1.0.9/jquery.i18n.properties-min',
		'jquery.hoverIntent'    :'//fenixapps.fao.org/repository/js/jquery.hoverIntent/1.0/jquery.hoverIntent',
		'fenix-ui-topmenu'      :'../scripts/components/fenix-ui-topmenu'
	},

	shim: {
		'bootstrap' : ['jquery'],
		'chosen'    : ['jquery'],
		'highcharts': ['jquery'],
		'jstree'    : ['jquery'],
		'jquery-ui'             : ['jquery'],
		'jquery.power.tip'      : ['jquery'],
		'jquery.i18n.properties': ['jquery'],
		'jquery.hoverIntent'    : ['jquery'],
		'underscore': {
		    exports: '_'
		},
//		'fenix-map-config': {
//			exports: 'FMCONFIG'
//		},
		'fenix-map': {
			deps: [
				'i18n',
				'jquery',
				'chosen',
				'leaflet',
				'jquery-ui',
				'jquery.hoverIntent',
				'jquery.power.tip',
				'jquery.i18n.properties',
				'import-dependencies',
				'fenix-map-config'
			]
		}
	}
});

require([
	'jquery','underscore','bootstrap','highcharts','jstree','handlebars',
	'fenix-map',
	'text!../config/catalogue-map.json',
	'text!html/accordion.html',
	'fenix-ui-topmenu/main',
	'domready!'
], function($,_,bts,highcharts,jstree,Handlebars,
	FenixMap,
	mapConf, accordion, TopMenu) {

	new TopMenu({
		url: 'json/fenix-ui-topmenu_config.json',
		active: "home"
	});

});