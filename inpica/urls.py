from django.conf.urls import patterns, include, url
<<<<<<< HEAD
from django.conf import settings
from django.conf.urls.static import static
=======
>>>>>>> init django project (using django 1.5)

# Uncomment the next two lines to enable the admin:
# from django.contrib import admin
# admin.autodiscover()

urlpatterns = patterns('',
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> account management

    url(r'^$', 'main.views.Index'),

	#Account#############################################
    url(r'^login$', 'account.views.Login'),
    url(r'^logout$', 'account.views.Logout'),
    url(r'^account/create$', 'account.views.Create'),
    url(r'^account/confirm/(?P<id>\d+)$', 'account.views.Confirm'),
<<<<<<< HEAD
    
    #Main################################################
    url(r'^floorplan/(?P<id>\d+)$', 'main.views.Floorplan'),
    url(r'^floorplan/new$', 'main.views.NewFloorplan'),
    url(r'^floorplan/map-upload/(?P<id>\d+)$', 'main.views.MapUpload'),
    url(r'^floorplan/save/layout/(?P<id>\d+)$', 'main.views.SaveLayout'),

    url(r'^furniture/prop/(?P<id>\d+)$', 'main.views.FurnitureInfoProp'),

    
    url(r'^dashboard$', 'main.views.Dashboard'),






=======
    # Examples:
    # url(r'^$', 'inpica.views.home', name='home'),
    # url(r'^inpica/', include('inpica.foo.urls')),
>>>>>>> init django project (using django 1.5)
=======




>>>>>>> account management

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    # url(r'^admin/', include(admin.site.urls)),
<<<<<<< HEAD
<<<<<<< HEAD
) + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
=======
)
>>>>>>> init django project (using django 1.5)
=======
)
>>>>>>> account management
