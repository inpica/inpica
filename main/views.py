from django.http import HttpResponse
from django.http import HttpResponseRedirect
from django.template import RequestContext
from django.shortcuts import render_to_response
from django.contrib.auth.decorators import login_required
from django.core.mail import send_mail
from django.views.decorators.csrf import csrf_exempt
import json

from django.contrib.auth import logout, login, authenticate
from django.contrib.auth.models import User

import main.models as m

import main.forms
import uuid
from django.core.mail import send_mail
from django.core.mail import EmailMultiAlternatives

'''@login_required
def Index(request):
	#For now, when a user logs in they go straight to the dashboard.
	return Dashboard(request)'''

def Index(request):
	login_form = main.forms.Login()
	create_form = main.forms.Create()
	return render_to_response('main/home.html', {"login_form":login_form, "create_form":create_form}, context_instance=RequestContext(request))


def Login(request):
	errormsg = None
	form = main.forms.Login()
	if request.method == 'POST':
		form = main.forms.Login(request.POST)
		if form.is_valid():
			try:
				if '@' in form.cleaned_data['auth']:
					isEmail = True
					user = User.objects.get(email=form.cleaned_data['auth'])
					username = user.username
				else:
					isEmail = False
					username = form.cleaned_data['auth']
				user = authenticate(username=username, password=form.cleaned_data['password'])
				if user:
					if not user.is_active:
						errormsg = "Your account is not active"
					else:
						login(request, user)
						return render_to_response('account/logged.html', context_instance=RequestContext(request))
				else:
					if isEmail:errormsg = "Your email/password is incorrect"
					else:errormsg = "Your username/password is incorrect"
			except User.DoesNotExist:
				errormsg = 'Your email could not be found'
	print form.errors
	return render_to_response('account/login.html', {"login_form":form, "login_errormsg":errormsg}, context_instance=RequestContext(request))

def Logout(request):
	logout(request)
	return HttpResponseRedirect('/')

def Create(request):
	form = main.forms.Create()
	if request.method == 'POST':
		form = main.forms.Create(request.POST)
		print form.is_valid()
		if form.is_valid():
			user = User.objects.create_user(username=form.cleaned_data['username'], password=form.cleaned_data['password'], email=form.cleaned_data['email'])
			user.is_active = False
			user.save()
			code = uuid.uuid4()
			userDetails = m.UserDetails.objects.create(user=user, confirmCode=code)
			confirmURL = 'http://www.inpica.com/account/confirm/%s'%(user.id) + '?c=%s'%(code)

			subject, from_email, to = 'Inpica New Account', 'accounts@inpica.com', form.cleaned_data['email']
			text_content = 'Thank you for signing up with Inpica! Please go to the following url to confirm your new account: %s'%(confirmURL)
			html_content = '<p>Thank you for signing up with Inpica! Please go to the following url to confirm your new account: <a href="%s">%s</a></p>'%(confirmURL, confirmURL)
			msg = EmailMultiAlternatives(subject, text_content, from_email, [to])
			msg.attach_alternative(html_content, "text/html")
			msg.send()
			return render_to_response('account/createsuccess.html')
	return render_to_response('account/create.html', {'create_form':form}, context_instance=RequestContext(request))


def Confirm(request, id):
	try:
		ud = m.UserDetails.objects.get(user_id=id)
		if ud.confirmCode == request.GET.get('c'):
			ud.user.is_active = True
			ud.user.save()
			return render_to_response('account/confirm.html', {"confirmed":True}, context_instance=RequestContext(request))
	except m.UserDetails.DoesNotExist:
		pass
	return render_to_response('account/confirm.html', {"confirmed":False}, context_instance=RequestContext(request))

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
	#furnishing = m.Furnishing(floorplan=floorplan, user=request.user, title="My Furnishing", isDefault=True)
	#furnishing.save()
	return Dashboard(request)

@login_required
def Floorplan(request, id):
	floorplan = m.Floorplan.objects.get(pk=id)
	furnishings = m.Furnishing.objects.select_related(depth=1).filter(floorplan=floorplan).order_by("-RCD")
	isOwner = True if floorplan.user == request.user else False
	return render_to_response('main/floorplan.html', 
		{"floorplan":floorplan, "furnishings":furnishings, "isOwner":isOwner}, 
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
def MapRemove(request, id):
	floorplan = m.Floorplan.objects.get(pk=id)
	if floorplan.user == request.user:
		floorplan.mapyFeet = floorplan.mapxFeet = None
		floorplan.map.delete(save=True)
		return HttpResponse("Success")

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
@csrf_exempt
def SaveFurnishing(request, id):
	if request.method == "POST":
		floorplan = m.Floorplan.objects.get(pk=id)
		data = json.loads(request.body)
		furnishing = m.Furnishing(floorplan=floorplan, user=request.user)
		furnishing.title = data.get('title')
		furnishing.comment = data.get('comment')
		if data.get('objects'):
			furnishing.jsonObjects = json.dumps(data.get('objects'))
		furnishing.save()
		return render_to_response('snippet/furnishing.html', {"furnishing":furnishing}, context_instance=RequestContext(request))

@login_required
@csrf_exempt
def DeleteFurnishing(request, id):
	if request.method == "POST":
		furnishing = m.Furnishing.objects.get(pk=id)
		furnishing.delete()
		return HttpResponse("Success")

@login_required
@csrf_exempt
def SetDefaultFurnishing(request, id):
	if request.method == "POST":
		furnishing = m.Furnishing.objects.get(pk=id)
		furnishings = m.Furnishing.objects.filter(floorplan=furnishing.floorplan).update(isDefault=False)
		furnishing.isDefault = True
		furnishing.save()
		return HttpResponse("Success")

@login_required
def FurnitureInfoProp(request, id):
	return HttpResponse("TODO: Furniture Properies box showing info only")

@login_required
def FurnitureEditProp(request, id):
	return HttpResponse("TODO: Furniture Properties box showing edit properties")

@login_required
def FurnitureBuilder(request):
	body = request.POST.get("body")
	#scrape = Jacob(body)
	scrape = {'w':10,'h':10}
	return render_to_response('snippet/furniture-builder.html', {"scrape":scrape}, context_instance=RequestContext(request))

@login_required
def FurnitureBuilderSubmit(request):
	return None
