from django import forms
from django.forms import ModelForm
from django.core.validators import RegexValidator
from django.core.exceptions import ValidationError
from django.contrib.auth.models import User
from django.forms.widgets import PasswordInput
import re

