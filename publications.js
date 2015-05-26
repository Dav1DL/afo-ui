

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

				'swiper': "//fenixapps.fao.org/repository/js/swiper/2.7.5/dist/idangerous.swiper.min",
				'bootstrap': "//fenixapps.fao.org/repository/js/bootstrap/3.3.2/js/bootstrap.min",
				'draggabilly': "//fenixapps.fao.org/repository/js/draggabilly/dist/draggabilly.pkgd.min",
				'intro': "//fenixapps.fao.org/repository/js/introjs/1.0.0/intro",
				'isotope': "//fenixapps.fao.org/repository/js/isotope/2.1.0/dist/isotope.pkgd.min",
				'jquery': "//fenixapps.fao.org/repository/js/jquery/2.1.1/jquery.min",
				'jqwidgets': "//fenixapps.fao.org/repository/js/jqwidgets/3.1/jqx-light",
				'jstree': "//fenixapps.fao.org/repository/js/jstree/3.0.8/dist/jstree.min"
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
		
		'text!html/publication.html',

		'fx-menu/start',
        './scripts/components/AuthenticationManager',

        'amplify',

		'domready!'
	], function($,_,bts,highcharts,jstree,Handlebars,Swiper,
		Config,
		publication,

		TopMenu,
		AuthenticationManager
		) {

        new TopMenu({
            active: 'publications',        	
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


	publicationTmpl = Handlebars.compile(publication);


	//$.getJSON('data/publications.json', function(json) {	
	
	function getData(sql){getWDS(sql, null, function(json)	{
		$('#listPubs').empty();
			
			console.log(json);

		var idPub = 0;

		_.each(json, function(pub2) {

			var pub = {
				"PublicationId": idPub++,
				"Category": pub2[0],
				"PublicationName": pub2[1],
				"PublicationDescription": pub2[2],
				"PublicationSource": pub2[5],
				"PublicationAuthorName": pub2[6],
				"PublicationSector&Theme": pub2[7],
				"PublicationDate":pub2[4],
				"DocumentLanguage":pub2[8],
				"REC":pub2[9],
				"Countries":pub2[10],
				"DocumentTags":pub2[15],
				"PublicationRating":pub2[16],
				"PublicationComments":"",
				"DocumentType":pub2[11],
				"DocumentSource":pub2[13]
			};

			pub.DocumentTags = pub.DocumentTags ? pub.DocumentTags.split(', ') : '';
			pub.Category = pub.Category ? pub.Category.split('|') : '';
			pub.DocumentType = pub.DocumentType.replace('.','');

			$('#listPubs').append( publicationTmpl(pub) );

		});		
	});}
	
	
	getData(Config.queries.pubs_reformat);
	Config.queries.pubs_reformat2=Config.queries.pubs_reformat;


	$("#txtSearch").on("input" ,function(){
	$(".afo-category-list-li").removeClass("active");
	$(".afo-category-list-li").addClass("noactive");
	getData(Config.queries.pubs_reformat+" where upper(description) like '%"+this.value.toUpperCase().split(" ").join("%")+"%' or upper(title) like '%"+this.value.toUpperCase().split(" ").join("%")+"%' or upper(author_name) like '%"+this.value.toUpperCase().split(" ").join("%")+"%' or upper(source) like '%"+this.value.toUpperCase().split(" ").join("%")+"%'");
	
	Config.queries.pubs_reformat2=Config.queries.pubs_reformat+" where upper(description) like '%"+this.value.toUpperCase().split(" ").join("%")+"%' or upper(title) like '%"+this.value.toUpperCase().split(" ").join("%")+"%' or upper(author_name) like '%"+this.value.toUpperCase().split(" ").join("%")+"%' or upper(source) like '%"+this.value.toUpperCase().split(" ").join("%")+"%' "
	});
	
	
	/*getWDS("select * from publications",null,function(data)	{
	console.log(data);
	});*/
	
	
	$(".afo-category-list-li").click(function(){
	$(".afo-category-list-li").removeClass("active");
	$(".afo-category-list-li").addClass("noactive");
	//console.log(this.innerHTML)
	document.getElementById("txtSearch").value="";
	if(this.innerHTML=="All")
	{
		getData(Config.queries.pubs_reformat);
	Config.queries.pubs_reformat2=Config.queries.pubs_reformat;
	
		
	}
	else{
	getData(Config.queries.pubs_reformat+" where upper(category) like '%"+this.innerHTML.toUpperCase()+"%' ");
	Config.queries.pubs_reformat2=Config.queries.pubs_reformat+" where upper(category) like '%"+this.innerHTML.toUpperCase()+"%' ";
	}
	//console.log(Config.queries.pubs_reformat+" where upper(category) like '%"+this.innerHTML.toUpperCase()+"%' ")
	this.className="afo-category-list-li active";
	});
	
	$("#mostRecentOreder").click(function(){
	
	getData(Config.queries.pubs_reformat2 +"  order by posting_date DESC");
	
	});
	
	$("#alphabeticOrder").click(function(){
	
	getData(Config.queries.pubs_reformat2 +"  order by title");
	
	});
	$("#alphabeticOrderInv").click(function(){
	
	getData(Config.queries.pubs_reformat2 +"  order by title DESC");
	
	});	
	
	
	

	$('.footer').load('html/footer.html');

	});

});