from django.http import HttpResponse
from django.http import HttpResponseRedirect
from django.template import RequestContext
from django.shortcuts import render_to_response
from django.contrib.auth.decorators import login_required
from django.core.mail import send_mail
from django.views.decorators.csrf import csrf_exempt

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
	floorplan = m.Floorplan.objects.get(pk=id)
	if request.method == "POST":
		return HttpResponse("Works")

