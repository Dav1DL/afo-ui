
require([
    "config/paths",
    "submodules/fenix-ui-menu/js/paths",
    "submodules/fenix-ui-common/js/Compiler"    
], function(Paths, menuConfig, Compiler) {

    menuConfig['baseUrl'] = "submodules/fenix-ui-menu/js";

    Compiler.resolve([menuConfig], {
        placeholders : {
            FENIX_CDN: Paths.FENIX_CDN
        },
        config: Paths
    });

	require([
	    'jquery', 'underscore', 'bootstrap', 'highcharts', 'jstree', 'handlebars', 'swiper', 'leaflet',
	    'config/services',
	    'src/renderAuthMenu',

	    'fx-common/js/WDSClient',
	    
		'text!html/accordion.html',

		'fenix-map',
		'fenix-map-config'
	], function($,_,bts,highcharts,jstree,Handlebars,Swiper,L,

		Config,
		renderAuthMenu,
		WDSClient,

		accordion) {

		renderAuthMenu(true);

		accordionTmpl = Handlebars.compile(accordion);

/*		function getWDS(queryTmpl, queryVars, callback) {

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
		}*/

var wdsClient = new WDSClient({
	datasource: Config.dbName,
	collection: Config.dbCollectionData,
	outputType: 'array'
});

function getWDS(queryTmpl, queryVars, callback) {

	return wdsClient.retrieve({
		payload: {
			query: queryTmpl,
			queryVars: queryVars
		},
		success: function(data) {
			callback(data);
		}
	});	
}
		_.extend(FMCONFIG, {
			BASEURL: 'submodules/fenix-ui-map',
			BASEURL_LANG: 'submodules/fenix-ui-map/dist/i18n/'
		});

		function initListFamilies(fmLayer) {

			getWDS(Config.queries.fertilizers_tree, null, function(data) {
				var dataTree = [],
					lastCatCode = '';

				for(var i in data)
					dataTree.push({
						fertilizer_category_code: data[i][0],
						fertilizer_code: data[i][1],
						fertilizer_category_label: data[i][2],
						fertilizer_label: data[i][3]
					});

				dataTree = _.groupBy(dataTree, 'fertilizer_category_label');

				dataTree = _.map(dataTree, function(cat, catName) {

					if(catName.toUpperCase()!=='OTHERS')
						catName += ' <small>('+(''+cat[0].fertilizer_code).substr(0,4)+')</small>';

					return {
						id: cat[0].fertilizer_category_code,
						text: catName,
						children: _.map(cat, function(fert) {
							return {
								id: fert.fertilizer_code,
								text: fert.fertilizer_label+' <small>('+fert.fertilizer_code+')</small>'
							};
						})
					};
				});

				$('#listFamilies').jstree({
					core: {
						data: dataTree,
						themes: {
							icons: false
						}
					},
					"plugins": ["search", "wholerow", "checkbox"],
					"search": {
						show_only_matches: true
					}
				}).on('changed.jstree', function (e, data) {
					e.preventDefault();
					initMapFamilies( data.selected, fmLayer );
				});		

	            var to = false;
	            $('#product-search-c').keyup(function (e) {
	                if (to) {
	                    clearTimeout(to);
	                }
	                to = setTimeout(function () {
	                    var v = $(e.target).val();
	                    $('#listFamilies').jstree(true).search(v);
	                }, 250);
	            });
			});
		}

		function initMapFamilies(ferts, fmLayer) {

			getWDS(Config.queries.countries_byfertilizers, {
				
				ids: "'"+ferts.join("','")+"'"

				}, function(resp) {

					resp = _.map(resp, function(val) {
						val[1] = val[1].split('|');
						return val;
					});

					updateLayer(fmLayer, resp);
			});
		}

		function initListCountries() {

			getWDS(Config.queries.countries_withfertizers, null, function(countriesData) {

				countriesData = _.map(countriesData, function(val) {
					return { id: val[0], text: val[1] };
				});

				$('#listCountries').jstree({
					core: {
						themes: { icons: false },
						data: countriesData
					},
					plugins: ["checkbox", "wholerow"],
					checkbox: {
						keep_selected_style: false
					}
				}).on('changed.jstree', function (e, data) {
					e.preventDefault();

					var selected = _.map(data.selected, function(val) {
						return _.findWhere(countriesData, {id: val});
					});

					$('#resultsCountries').empty();
					_.each(selected, function(val) {
						initResultsCountries( val.id, val.text );
					});

				});
			});			
		}
		function initResultsCountries(adm0_code, countryName) {

			getWDS(Config.queries.fertilizers_bycountry, {id: adm0_code}, function(resp) {
		
				if(resp.length>0) {

					resp = _.sortBy(resp, function(val) {
						return val[0];
					});

					$('#resultsCountries').append( accordionTmpl({
						id: adm0_code,
						title: countryName+' ('+resp.length+')',
						items: resp,
						expand: resp.length > 9
					}) );
				}
			});
		}

	//CROPS
		function initListCrops() {

			var cropsData = [];

			getWDS(Config.queries.crops_withfertizers, null, function(cropsData) {

				cropsData = _.map(cropsData, function(val) {
					return { id: val[0], text: val[1] };
				});

				$('#listCrops').jstree({
					core: {
						themes: { icons: false },
						data: cropsData
					},
					plugins: ["checkbox", "wholerow"],
					checkbox: {
						keep_selected_style: false
					}
				}).on('changed.jstree', function (e, data) {
					e.preventDefault();

					var selected = _.map(data.selected, function(val) {
						return _.findWhere(cropsData, {id: val});
					});

					$('#resultsCrops').empty();
					_.each(selected, function(val) {
						initResultsCrops( val.id, val.text );
					});
				});

			});
		}

		function initResultsCrops(cropId, cropName) {

			getWDS(Config.queries.fertilizers_bycrop, {id: cropId}, function(resp) {

				if(resp.length>0) {

					resp = _.sortBy(resp, function(val) {
						return val[0];
					});

					$('#resultsCrops').append( accordionTmpl({
						id: cropId,
						title: cropName+' ('+resp.length+')',
						items: resp,
						expand: resp.length > 9
					}) );
				}
			});
		}

		var setLayerStyle = function(ccodes, opacities) {

			var style = '',
				sld = '';
				
			_.each(ccodes, function(val, adm0_code) {
				style += "[adm0_code = '"+adm0_code+"'] { fill: #309000; fill-opacity: "+opacities[adm0_code]+"; stroke: #FFFFFF; }";
			});

			$.ajax({
				url: Config.sldUrl,
				data: {
					stylename: "fenix:"+Config.gaulLayer,
					style: style
				},
				async: false,
				type: 'POST',
				success: function(response) {
					sld = response;
				}
			});
			return sld;
		};

		var updateLayer = function(fmLayer, codes) {

			var retCodes = {};
			_.each(codes, function(val) {
				if(!retCodes[ val[0] ])
					retCodes[ val[0] ] = '';
				val[1].sort();
				retCodes[ val[0] ] += '&bull; '+val[1].join('<br>&bull; ');
			});

			var opacities = {};
			_.each(codes, function(val) {

				if(!opacities[ val[0] ])
					opacities[ val[0] ]= 0.2;
				
				opacities[ val[0] ]= parseFloat( val[1].length * 0.18 ).toFixed(2);
				opacities[ val[0] ]= Math.min(opacities[val[0]], 1);			
			});
			
			var data = [];
			_.each(retCodes, function(val, key) {
				var o = _.object([key],[val]);
				data.push( o );
			});
			//'[{"TZA":"testtt<br>iuahsiduh"},{"BDI":"11"}]';

			fmLayer.layer.joindata = JSON.stringify(data);

			fmLayer.layer.customgfi = {
				showpopup: true,
				content: {
					en: "<div class='fm-popup'>"+
							"<div class='fm-popup-join-title'>{{"+ fmLayer.layer.joincolumnlabel +"}}</div>"+
							"<div class='fm-popup-join-content'>"+
							"<em>Fertilizers used:</em><br>"+
								"{{{adm0_code}}}"+
							"</div>"+
						"</div>"
				}
			};

			fmLayer.leafletLayer.wmsParams.sld = setLayerStyle(retCodes, opacities);
			fmLayer.leafletLayer.redraw();

			retCodes = _.keys(retCodes);

			fmLayer._fenixmap.zoomTo("country", "adm0_code", retCodes);
		};

		var fmMap = new FM.Map('fertMap', {
			plugins: {
				geosearch: false,
				mouseposition: false,
				controlloading: true,
				zoomControl: 'bottomright'
			},
			guiController: {
				overlay : true,
				baselayer: false,
				wmsLoader: true
			},
			gui: {
				disclaimerfao: true
			},
			usedefaultbaselayers: false
		}, {
			zoomControl: false,
			attributionControl: true
		});
		
		fmMap.map.attributionControl.setPrefix(Config.map_attribution);

		fmMap.createMap(0, 20, 3);

		L.tileLayer(Config.url_baselayer).addTo(fmMap.map);

		var fmLayer = new FM.layer({
			urlWMS: Config.wmsUrl,
			layers: "fenix:"+Config.gaulLayer,
			styles: "none",
			layertitle: "Fertilizers",
			defaultgfi: true,
			opacity: '0.7',		
			lang: "en",
			zindex: 500,
			joincolumn: "adm0_code",
			joincolumnlabel: "areanamee",
			customgfi: {
				showpopup: true,
				content: {
					en: "<div class='fm-popup'>"+
							"<div class='fm-popup-join-title'></div>"+
							"<div class='fm-popup-join-content'><i></i></div>"+
						"</div>"
				}
			}
		});

		fmMap.addLayer(fmLayer);

		$('#catalogue_tabs').find('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {

			switch($(e.target).attr('href'))
			{
				case '#families':
					initListFamilies(fmLayer);
				break;
				case '#countries':
					initListCountries();
				break;
				case '#crops':
					initListCrops();
				break;
			}
		});

		initListFamilies(fmLayer);

	});

});