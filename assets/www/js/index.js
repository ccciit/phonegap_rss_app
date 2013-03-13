function start() {
	var app = {
			
		currentArticle : null,
		currentBlog : null,
		
	    // Application Constructor
	    initialize: function() {
	    	this.isNative = navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry)/);
	        //Cargamos las plantillas con mustache
	        $.Mustache.load('./markup/templates.htm').done(function() {
	            $.proxy(app.start(), app);
	        });
	    },
	
	    start: function() {
	    	var blogs = window.localStorage.getItem('blogs');
	    	this.blogs = [];
	    	if(blogs) {
	    		this.blogs = JSON.parse(blogs);
	    	}
	        this.setListeners();
	        this.renderHome();
	    },
	
	    setListeners: function() {
	    	var _self = this;
	        $('#page_principal').on('click', '.add_button', function() {
	        	$('#add_rss .content').html($.Mustache.render('plantilla-add-feed'));
	        	$.mobile.changePage('#add_rss', {transition: 'slide'});
	        	
	        	$('#add_feed .button').off('click');
	        	$('#add_feed .button').on('click', function() {
	        		if( $('#add_feed input[name=nombre]').val()=='' || $('#add_feed input[name=url]').val()=='' ) {
	        			if(app.isNative) {
	        				navigator.notification.alert('Debe completar los campos de texto.', null, 'ERROR', 'Aceptar');
	        			}else {
	        				alert('Debe completar los campos de texto.');
	        			}
	        			return;
	        		}
	        		var new_blog = {
	    				nombre: $('#add_feed input[name=nombre]').val(),
	    				url: $('#add_feed input[name=url]').val(),
	    				content: null,
	    				time: null
	        		}
	        		app.blogs.push(new_blog);
	        		window.localStorage.setItem('blogs', JSON.stringify(app.blogs));
	        		$.proxy(app.renderHome(), app);
	        		app.backPage();
	        	})
	        });
	        
	        $('.content').on('click', 'a', function(evt) {
	        	if(app.isNative) {
	        		evt.preventDefault();
	        		window.plugins.childBrowser.showWebPage($(evt.currentTarget).attr("href"));
	        	}
	        })
	        
	        $('#page_principal').on('click', '.listado_portada li', app.loadBlog);
	        $('#listado_blog').on('click', '.content ul li', app.loadDetalle);
	    },
	    
	    backPage: function() {
	    	$('.ui-icon-back').trigger('click');
	    },
	    
	    renderHome: function() {
	    	var index = 0;
	    	var data = {
				blogs: this.blogs,
				indice: function() {
					return index++;
				}
	    	}
	        $('#page_principal .content').html($.Mustache.render('plantilla-portada', data));    	
	    },
	    
	    renderListadoBlog: function(index) {
	    	var ind = 0;
	    	var data = {
				articulos: app.blogs[index].content.entries,
				indice: function() {
					return ind++;
				}
	    	}
	    	$('#listado_blog h1').html(app.blogs[index].nombre);
	    	$('#contenido_blog .header h1').html(app.blogs[index].nombre);
	    	$('#listado_blog .content').html('');
	    	$('#listado_blog .content').html($.Mustache.render('plantilla-listado-blog', data));
	    },
	    
	    renderDetalle: function(index) {
	    	$('#contenido_blog .content').html($.Mustache.render('plantilla-detalle-blog', app.blogs[app.currentBlog].content.entries[index]));
	    },
	    
	    loadDetalle: function(evt) {
	    	app.currentArticle = $(evt.currentTarget).data('index');    
	    	app.renderDetalle(app.currentArticle);
	    	while($("table").parent().next().length == 1) {
	    		$("table").parent().next().remove();
	    	}
	    	$("table").parent().remove();
	    	$.mobile.changePage('#contenido_blog', {transition: 'slide'});
	    },
	    
	    loadBlog: function(evt) {
	    	var index = $(evt.currentTarget).data("index");
	    	app.currentBlog = index;
	    	if (app.blogs[index].content && ((new Date()) - app.blogs[index].time) < 360000) {
	    		app.renderListadoBlog(index);
		    	$.mobile.changePage('#listado_blog', {transition: 'slide'});	 
	    	}else {
	    		//Cargamos la informacion de los ultimos 20 elementos del feed
	    		var feed = new google.feeds.Feed(app.blogs[index].url);
	    		feed.setNumEntries(20);
	    		feed.setResultFormat(google.feeds.Feed.JSON_FORMAT);
	    		feed.load(function(data) {
	    			app.blogs[index].content = data.feed;
	    			app.blogs[index].time = new Date().getTime();
	    			window.localStorage.setItem('blogs', JSON.stringify(app.blogs));
	    			app.renderListadoBlog(index);
	    	    	$.mobile.changePage('#listado_blog', {transition: 'slide'});	 
	    		})
	    	}   	
	    }
	};
	
	if(navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry)/)) {
		$(document).bind('deviceready', function() {
		    $.mobile.page.prototype.options.backBtnText = 'Atr&aacute;s';
		    $.mobile.defaultPageTransition = 'slide';
		    app.initialize();
		});
	}else{
		$(document).ready(function() {
			app.initialize();
		});
	}
	
	return app;
}
