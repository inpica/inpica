from django import forms
from django.forms import ModelForm
from django.core.validators import RegexValidator
from django.core.exceptions import ValidationError
from django.contrib.auth.models import User
from django.forms.widgets import PasswordInput

from django.forms import ModelForm
import re

import main.models as m
class Login(forms.Form):
	auth = forms.CharField(label="Username or Email", widget=forms.TextInput(attrs={'placeholder':'username or email'}))
	password = forms.CharField(widget=forms.PasswordInput(attrs={'placeholder': 'password'}))

class Create(forms.Form):
	username = forms.CharField(label="Username")
	email = forms.EmailField(label="Email")
	password = forms.CharField(widget=PasswordInput, label="Password")
	passwordConfirm = forms.CharField(widget=PasswordInput, label="Confirm Password")

	def clean_passwordConfirm(self):
		#TODO: Validate for password strength
		#cleaned_data = super(Create, self).clean()
		password = self.cleaned_data["password"]
		passwordConfirm = self.cleaned_data["passwordConfirm"]
		if password != passwordConfirm:
			raise ValidationError('Passwords do not match')
		return passwordConfirm

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

class FurnitureBuilder(ModelForm):
	error_css_class='error'
	required_css_class ='required'
	class Meta:
		model = m.Furniture
		fields = ("title","symbolPath","h","w")