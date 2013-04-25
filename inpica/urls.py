from django.conf.urls import patterns, include, url
from django.conf import settings
from django.conf.urls.static import static

# Uncomment the next two lines to enable the admin:
# from django.contrib import admin
# admin.autodiscover()

urlpatterns = patterns('',

    url(r'^$', 'main.views.Index'),
    url(r'^home/login$', 'main.views.Login'),
    url(r'^home/logout$', 'main.views.Logout'),
    url(r'^home/create$', 'main.views.Create'),

	#Account#############################################
    url(r'^login$', 'account.views.Login'),
    url(r'^logout$', 'account.views.Logout'),
    url(r'^account/create$', 'account.views.Create'),
    url(r'^account/confirm/(?P<id>\d+)$', 'account.views.Confirm'),
    
    #Main################################################
    url(r'^floorplan/(?P<id>\d+)$', 'main.views.Floorplan'),
    url(r'^floorplan/new$', 'main.views.NewFloorplan'),
    url(r'^floorplan/map-upload/(?P<id>\d+)$', 'main.views.MapUpload'),
    url(r'^floorplan/map-remove/(?P<id>\d+)$', 'main.views.MapRemove'),
    url(r'^floorplan/save/layout/(?P<id>\d+)$', 'main.views.SaveLayout'),
    url(r'^floorplan/save/furnishing/(?P<id>\d+)$', 'main.views.SaveFurnishing'),
    url(r'^floorplan/delete/furnishing/(?P<id>\d+)$', 'main.views.DeleteFurnishing'),
    url(r'^floorplan/set-default/furnishing/(?P<id>\d+)$', 'main.views.SetDefaultFurnishing'),

    url(r'^furniture/prop/(?P<id>\d+)$', 'main.views.FurnitureProp'),

    url(r'^dashboard$', 'main.views.Dashboard'),
    url(r'^dashboard/furniture/(?P<page>\d+)$', 'main.views.FurnitureDashboard'),

    url(r'^furniture/builder$','main.views.FurnitureBuilder'),
    url(r'^furniture/builder-submit$','main.views.FurnitureBuilderSubmit'),
    
    url(r'^pin/(?P<id>\d+)/(?P<ss>.+)$','main.views.Pin'),
    url(r'^pin/save/(?P<id>\d+)/(?P<ss>.+)$','main.views.PinSave'),

    url(r'^bookmarklet/(?P<id>\d+)/(?P<ss>.+)$','main.views.Bookmarklet'),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    # url(r'^admin/', include(admin.site.urls)),
) + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)