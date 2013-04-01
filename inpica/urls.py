from django.conf.urls import patterns, include, url

# Uncomment the next two lines to enable the admin:
# from django.contrib import admin
# admin.autodiscover()

urlpatterns = patterns('',

    url(r'^$', 'main.views.Index'),

	#Account#############################################
    url(r'^login$', 'account.views.Login'),
    url(r'^logout$', 'account.views.Logout'),
    url(r'^account/create$', 'account.views.Create'),
    url(r'^account/confirm/(?P<id>\d+)$', 'account.views.Confirm'),
    
    #Main################################################
    url(r'^floorplan/(?P<id>\d+)$', 'main.views.Floorplan'),
    url(r'^floorplan/new$', 'main.views.NewFloorplan'),
    url(r'^floorplan/map-upload/(?P<id>\d+)$', 'main.views.MapUpload'),

    
    url(r'^dashboard$', 'main.views.Dashboard'),







    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    # url(r'^admin/', include(admin.site.urls)),
)