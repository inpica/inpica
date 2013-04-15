import main.models as m
from django import template
from datetime import datetime

from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger


register = template.Library()

@register.inclusion_tag('snippet/furniture-builder.html', takes_context=True)
def FurnitureBuilder(x, y, z):
	pass

@register.inclusion_tag('snippet/furniture-picker.html', takes_context=True)
def FurniturePicker(context, includePins):
	return {"includePins":includePins, "STATIC_URL":context['STATIC_URL']}
	if includePins:
		furnitures = m.Furniture.objects.filter(user=context["user"])
	else:
		furnitures = None
	return {"furnitures":furnitures, "user":context["user"],"STATIC_URL":context['STATIC_URL']}

@register.inclusion_tag('snippet/furniture-dashboard.html',takes_context=True)
def FurnitureDashboard(context, pageNumber):
	furniture_list = m.Furniture.objects.filter(user=context['user']).order_by('-RCD')
	paginator_furniture = Paginator(furniture_list, 5) 
	page_furniture = pageNumber
	try:
		furniture = paginator_furniture.page(page_furniture)
	except PageNotAnInteger:
		furniture = paginator_furniture.page(1)
	except EmptyPage:
		furniture = paginator_furniture.page(paginator_furniture.num_pages)
	return {'furniture':furniture, "STATIC_URL":context['STATIC_URL']}
