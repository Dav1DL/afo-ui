

require(["submodules/fenix-ui-menu/js/paths",
		 "submodules/fenix-ui-common/js/Compiler"
		 ], function(Menu, Compiler) {

    var menuConfig = Menu;
    
    menuConfig['baseUrl'] = "submodules/fenix-ui-menu/js";

    Compiler.resolve([menuConfig], {
        placeholders : {
            FENIX_CDN: "//fenixrepo.fao.org/cdn"
        },
        config: {
			paths: {
				'text': "//fenixrepo.fao.org/cdn/js/requirejs/plugins/text/2.0.12/text",
				'i18n': "//fenixrepo.fao.org/cdn/js/requirejs/plugins/i18n/2.0.4/i18n",
				'domready': "//fenixrepo.fao.org/cdn/js/requirejs/plugins/domready/2.0.1/domReady",

				'amplify' : "//fenixrepo.fao.org/cdn/js/amplify/1.1.2/amplify.min",
				'highcharts': "//fenixrepo.fao.org/cdn/js/highcharts/4.0.4/js/highcharts",

				'underscore': "//fenixrepo.fao.org/cdn/js/underscore/1.7.0/underscore.min",
				'handlebars': "//fenixrepo.fao.org/cdn/js/handlebars/2.0.0/handlebars",

				'swiper': "//fenixrepo.fao.org/cdn/js/swiper/2.7.5/dist/idangerous.swiper.min",
				'bootstrap': "//fenixrepo.fao.org/cdn/js/bootstrap/3.3.2/js/bootstrap.min",
				'draggabilly': "//fenixrepo.fao.org/cdn/js/draggabilly/dist/draggabilly.pkgd.min",
				'intro': "//fenixrepo.fao.org/cdn/js/introjs/1.0.0/intro",
				'isotope': "//fenixrepo.fao.org/cdn/js/isotope/2.1.0/dist/isotope.pkgd.min",
				'jquery': "//fenixrepo.fao.org/cdn/js/jquery/2.1.1/jquery.min",
				'jqwidgets': "//fenixrepo.fao.org/cdn/js/jqwidgets/3.1/jqx-light",
				'jstree': "//fenixrepo.fao.org/cdn/js/jstree/3.0.8/dist/jstree.min"
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
		        'underscore': {
		            exports: '_'
		        },
                'amplify': {
                    deps: ['jquery'],
                    exports: 'amplifyjs'
                }        
		    }
		}
    });


	require([
	    'jquery', 'underscore', 'bootstrap', 'highcharts', 'jstree', 'handlebars', 'swiper', 
	    'config/services',
		
		'text!html/events.html',
		'config/event_category',
		'fx-menu/start',
        './scripts/components/AuthenticationManager',

        'amplify',

		'domready!'
	], function($,_,bts,highcharts,jstree,Handlebars,Swiper,
		Config,
		tmplEvents,
		matchingCategory,
		TopMenu,
		AuthenticationManager
		) {
        new TopMenu({
            active: 'events',        	
            url: 'config/fenix-ui-menu.json',
            className : 'fx-top-menu',
            breadcrumb : {
                active : true,
                container : "#breadcumb_container",
                showHome : true
            }
        });

        new AuthenticationManager();
        

		eventsTmpl = Handlebars.compile(tmplEvents);

		Config.url_events_attachments = '//fenixrepo.fao.org/afo/events/attachments/';
		
		
		function getWDS(queryTmpl, queryVars, callback) {

			var sqltmpl, sql;

			if(queryVars) {
				sqltmpl = _.template(queryTmpl);
				sql = sqltmpl(queryVars);
			}
			else{
				sql = queryTmpl;
			}
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


	


	//$.getJSON('data/publications.json', function(json) {	
	
	function getData(sql) {
		var test = 2;

		getWDS(sql, null, function(json)	{
			
		$('#listPubs').empty();

		var idPub = 0;
 
		_.each(json, function(pub2) {

			var eve = {
				"eventInternalId": idPub++,
				"id": pub2[0],
				"category": pub2[1],
				"date_start": pub2[2],
				"date_end": pub2[3],
				"description": pub2[4],
				"title": pub2[5],
				"venue": pub2[13],
				"country": pub2[14]
			};

			if(pub2[4]==pub2[6])
				console.log("no long");
			else
				eve["long_description"] = pub2[6];
			
			var nbDoc=pub2[7];
			attachments={L:[],PR:[],D:[],PI:[]};
			
			var EA_type=pub2[8].split('@|');
			var EA_file_name=pub2[9].split('@|');
			var EA_attachment_title=pub2[10].split('@|');
			var EA_attachment_size=pub2[11].split('@|');
			var EA_attachment_description=pub2[12].split('@|');
			for (var nd=0; nd<nbDoc; nd++)
			{
				attachments[EA_type[nd]].push({
					"type":EA_type[nd],
					"file_name": (EA_type[nd]!=='L'?Config.url_events_attachments:'')+EA_file_name[nd],
					"attachment_title":EA_attachment_title[nd],
					"attachment_size":EA_attachment_size[nd],
					"attachment_description":EA_attachment_description[nd],
				});
			}
			
			eve.attachments=attachments;
			
			eve.category = eve.category ? eve.category.split('|') : '';
			
			for(var cat in eve.category)
				eve.category[cat]= matchingCategory[eve.category[cat]];

			$('#listPubs').append( eventsTmpl(eve) );
		});		
	});}
	
	
	getData(Config.queries.events_reformat);
	Config.queries.events_reformat2=Config.queries.events_reformat;


	$("#txtSearch").on("input" ,function(){
	$(".afo-category-list-li").removeClass("active");
	$(".afo-category-list-li").addClass("noactive");
	getData(Config.queries.events_reformat+" where description ilike '%"+this.value.split(" ").join("%")+"%' or title ilike '%"+this.value.split(" ").join("%")+"%'");
	
	Config.queries.events_reformat2=Config.queries.events_reformat+" where description ilike '%"+this.value.split(" ").join("%")+"%' or title ilike '%"+this.value.split(" ").join("%")+"%' "
	});
	
	
	$(".afo-category-list-li").click(function(){
	$(".afo-category-list-li").removeClass("active");
	$(".afo-category-list-li").addClass("noactive");
	//console.log(this.innerHTML)
	document.getElementById("txtSearch").value="";
	var tempCategory = $(this).attr('cat');
	
	//console.log('tempCategory',tempCategory)

	if(tempCategory=="All")
	{
		getData(Config.queries.events_reformat);
		Config.queries.events_reformat2=Config.queries.events_reformat;
	}
	else{
		
	getData(Config.queries.events_reformat+" where category = '"+tempCategory+"'");
	Config.queries.events_reformat2=Config.queries.events_reformat+" where category = '"+tempCategory+"' ";
	}
	//console.log(Config.queries.events_reformat+" where upper(category) like '%"+this.innerHTML.toUpperCase()+"%' ")
	this.className="afo-category-list-li active";
	});
	
	$("#mostRecentOreder").click(function(){
	getData(Config.queries.events_reformat2 +"  order by date_start DESC");
	
	});
	
	$("#alphabeticOrder").click(function(){
	
	getData(Config.queries.events_reformat2 +"  order by title");
	
	});
	$("#alphabeticOrderInv").click(function(){
		getData(Config.queries.events_reformat2 +"  order by title DESC");	});	
	
	
	

	$('.footer').load('html/footer.html');

	});

});