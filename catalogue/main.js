
requirejs.config({

    baseUrl: "../src/",

    paths : {
        domready: "lib/domready",
        text: "lib/text",
        jquery: "lib/jquery",
        bootstrap : "lib/bootstrap",
        jqwidgets: "//fenixapps.fao.org/repository/js/jqwidgets/3.1/jqx-all",
        //fenix modules
        'fenix-ui-topmenu': "fenix_modules/fenix-ui-topmenu/main"
    },

    shim: {
        bootstrap: {
            deps: ['jquery']
        },
        jqwidgets: {
            deps: ['jquery']
        },
        'fenix-ui-topmenu': {
            deps: ['jquery','bootstrap']
        }
    }
});

require(['fenix-ui-topmenu', 'domready!'], function( TopMenu ) {

console.log('domready');

/*    new TopMenu({
        url: "../config/fenix-ui-topmenu.json",
        active: "home"
    });*/

});

