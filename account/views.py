from django.http import HttpResponse
from django.http import HttpResponseRedirect
from django.template import RequestContext
from django.shortcuts import render_to_response
from django.contrib.auth.decorators import login_required
from django.core.mail import send_mail
from django.core.mail import EmailMultiAlternatives

from django.contrib.auth.models import User
from django.contrib.auth import logout, login, authenticate

import account.forms
import main.models as m

from django.views.decorators.csrf import csrf_exempt
import uuid

import main.templatetags.maintags as maintags
import main.forms

# def Login(request):
# 	errormsg = None
# 	form = account.forms.Login()
# 	if request.method == 'POST':
# 		form = account.forms.Login(request.POST)
# 		if form.is_valid():
# 			try:
# 				if '@' in form.cleaned_data['auth']:
# 					isEmail = True
# 					user = User.objects.get(email=form.cleaned_data['auth'])
# 					username = user.username
# 				else:
# 					isEmail = False
# 					username = form.cleaned_data['auth']
# 				user = authenticate(username=username, password=form.cleaned_data['password'])
# 				if user:
# 					if not user.is_active:
# 						errormsg = "Your account is not active"
# 					else:
# 						login(request, user)
# 						return HttpResponseRedirect('/')
# 				else:
# 					if isEmail:errormsg = "Your email/password is incorrect"
# 					else:errormsg = "Your username/password is incorrect"
# 			except User.DoesNotExist:
# 				errormsg = 'Your email could not be found'
# 	return render_to_response('account/login.html', {"form":form, "errormsg":errormsg}, context_instance=RequestContext(request))


# def Logout(request):
# 	logout(request)
# 	return HttpResponseRedirect('/')


# def Create(request):
# 	form = account.forms.Create()
# 	if request.method == 'POST':
# 		form = account.forms.Create(request.POST)
# 		if form.is_valid():
# 			user = User.objects.create_user(username=form.cleaned_data['username'], password=form.cleaned_data['password'], email=form.cleaned_data['email'])
# 			user.is_active = False
# 			user.save()
# 			code = uuid.uuid4()
# 			userDetails = m.UserDetails.objects.create(user=user, confirmCode=code)
# 			confirmURL = 'http://www.inpica.com/account/confirm/%s'%(user.id) + '?c=%s'%(code)

# 			subject, from_email, to = 'Inpica New Account', 'accounts@inpica.com', form.cleaned_data['email']
# 			text_content = 'Thank you for signing up with Inpica! Please go to the following url to confirm your new account: %s'%(confirmURL)
# 			html_content = '<p>Thank you for signing up with Inpica! Please go to the following url to confirm your new account: <a href="%s">%s</a></p>'%(confirmURL, confirmURL)
# 			msg = EmailMultiAlternatives(subject, text_content, from_email, [to])
# 			msg.attach_alternative(html_content, "text/html")
# 			msg.send()
# 			return render_to_response('account/create.html', {'created':True}, context_instance=RequestContext(request))
# 	return render_to_response('account/create.html', {'created':False, 'form':form}, context_instance=RequestContext(request))


# def Confirm(request, id):
# 	try:
# 		ud = m.UserDetails.objects.get(user_id=id)
# 		if ud.confirmCode == request.GET.get('c'):
# 			ud.user.is_active = True
# 			ud.user.save()
# 			return render_to_response('account/confirm.html', {"confirmed":True}, context_instance=RequestContext(request))
# 	except m.UserDetails.DoesNotExist:
# 		pass
# 	return render_to_response('account/confirm.html', {"confirmed":False}, context_instance=RequestContext(request))


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

@csrf_exempt
def Create(request):
	form = main.forms.Create()
	if request.method == 'POST':
		form = main.forms.Create(request.POST)
		if form.is_valid():
			user = User.objects.create_user(username=form.cleaned_data['username'], password=form.cleaned_data['password'], email=form.cleaned_data['email'])
			user.is_active = False
			user.save()
			code = uuid.uuid4()
			bookmarkletss = uuid.uuid4()
			userDetails = m.UserDetails.objects.create(user=user, confirmCode=code, bookmarkletss=bookmarkletss)
			confirmURL = 'http://www.inpica.com/home/confirm/%s'%(user.id) + '?c=%s'%(code)
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
