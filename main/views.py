<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> account management
from django.http import HttpResponse
from django.http import HttpResponseRedirect
from django.template import RequestContext
from django.shortcuts import render_to_response
from django.contrib.auth.decorators import login_required
from django.core.mail import send_mail
<<<<<<< HEAD
from django.views.decorators.csrf import csrf_exempt
import json

from django.contrib.auth.models import User

import main.models as m

@login_required
def Index(request):
	#For now, when a user logs in they go straight to the dashboard.
	return Dashboard(request)

@login_required
def Dashboard(request):
	floorplans = m.Floorplan.objects.filter(user=request.user)
	return render_to_response('main/dashboard.html',
		{"floorplans":floorplans},
		context_instance=RequestContext(request))

@login_required
def NewFloorplan(request):
	floorplan = m.Floorplan(title=request.POST.get('title'), user=request.user)
	floorplan.save()
	furnishing = m.Furnishing(floorplan=floorplan, user=request.user, title="My Furnishing", isDefault=True)
	furnishing.save()
	return Dashboard(request)

@login_required
def Floorplan(request, id):
	floorplan = m.Floorplan.objects.get(pk=id)
	furnishing = m.Furnishing.objects.filter(floorplan=floorplan, isDefault=True)[0]
	isOwner = True if floorplan.user == request.user else False
	return render_to_response('main/floorplan.html', 
		{"floorplan":floorplan, "furnishing":furnishing, "isOwner":isOwner}, 
		context_instance=RequestContext(request))

@login_required
@csrf_exempt
def MapUpload(request, id):
	if request.method == "POST":
		floorplan = m.Floorplan.objects.get(pk=id)
		floorplan.mapxFeet = float(request.POST.get("mapxFeet"))
		floorplan.mapyFeet = float(request.POST.get("mapyFeet"))
		floorplan.map = request.FILES["file"]
		floorplan.save()
		data = {
			"type":"image",
			"src":floorplan.map.url,
			"dim":{"x":0, "y":0, "r":0, "w":floorplan.mapxFeet, "h":floorplan.mapyFeet}
		}
		return HttpResponse(json.dumps(data), mimetype='application/json')
	return HttpResponse("Error - this was not uploaded correctly.")

@login_required
@csrf_exempt
def SaveLayout(request, id):
	if request.method == "POST":
		floorplan = m.Floorplan.objects.get(pk=id)
		floorplan.jsonObjects = request.body
		floorplan.save()
		return HttpResponse('')
		#TODO - save each object individually to FloorplanObjectInstance
	

@login_required
def FurnitureInfoProp(request, id):
	return HttpResponse("TODO: Furniture Properies box showing info only")

@login_required
def FurnitureEditProp(request, id):
	return HttpResponse("TODO: Furniture Properties box showing edit properties")
=======
# Create your views here.
>>>>>>> svg library
=======

from django.contrib.auth.models import User

@login_required
def Index(request):
	return HttpResponse("TODO")
>>>>>>> account management
