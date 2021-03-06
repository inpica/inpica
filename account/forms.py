from django import forms
from django.forms import ModelForm
from django.core.validators import RegexValidator
from django.core.exceptions import ValidationError
from django.contrib.auth.models import User
from django.forms.widgets import PasswordInput
import re


class Login(forms.Form):
	auth = forms.CharField(label="Username or Email")
	password = forms.CharField(widget=PasswordInput)

class Create(forms.Form):
	username = forms.CharField(label="Username")
	email = forms.EmailField(label="Email")
	password = forms.CharField(widget=PasswordInput, label="Password")
	passwordConfirm = forms.CharField(widget=PasswordInput, label="Confirm Password")

	def clean(self):
		#TODO: Validate for password strength
		cleaned_data = super(Create, self).clean()
		password = cleaned_data.get("password")
		passwordConfirm = cleaned_data.get("passwordConfirm")
		if password != passwordConfirm:
			raise ValidationError('Passwords do not match')
		return cleaned_data

	def clean_username(self):
		username = self.cleaned_data['username']
		try:
			user = User.objects.get(username=username)
			raise ValidationError('The username "%s" already exists, please select another.'%(username))
		except User.DoesNotExist:
			return username

	def clean_email(self):
		email = self.cleaned_data['email']
		try:
			user = User.objects.get(email=email)
			raise ValidationError('The email "%s" already exists in our system, please select another or log in with that email.'%(email))
		except User.DoesNotExist:
			return email

