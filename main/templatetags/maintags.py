import main.models as m
from django import template
from datetime import datetime

register = template.Library()

@register.inclusion_tag('snippet/furniture-builder.html')
def FurnitureBuilder(x, y, z):
	pass

@register.inclusion_tag('snippet/furniture-picker.html')
def FurniturePicker(includePins):
	return {"includePins":includePins}