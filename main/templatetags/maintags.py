import main.models as m
from django import template
from datetime import datetime

register = template.Library()

@register.inclusion_tag('snippet/furniture-builder.html', takes_context=True)
def FurnitureBuilder(x, y, z):
	pass

@register.inclusion_tag('snippet/furniture-picker.html', takes_context=True)
def FurniturePicker(context, includePins):
	if includePins:
		furnitures = m.Furniture.objects.filter(user=context["user"])
	else:
		furnitures = None
	return {"furnitures":furnitures, "user":context["user"],"STATIC_URL":context['STATIC_URL']}