import main.models as m
from django import template
from datetime import datetime
import main.data

from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger


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
	return {"furnitures":furnitures, "default_furnitures":main.data.default_furnitures, "user":context["user"],"STATIC_URL":context['STATIC_URL']}

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

@register.inclusion_tag('snippet/comments-dashboard.html', takes_context = True)
def CommentsDashboard(context, pageNumber):
	#floorplan = m.Floorplan.objects.filter(user=context['user']).order_by('-RCD')
	#comments_list = m.Furnishing.objects.filter(floorplan__exact=context['user']).exclude()
	comments_list = m.Furnishing.objects.filter(floorplan__user_id__exact=context['user'].pk)
	comments_list = comments_list.exclude(user_id=context['user'])
	print comments_list
	'''Blog.objects.filter(entry__headline__contains='Lennon')
	paginator_furniture = Paginator(furniture_list, 5) 
	page_furniture = pageNumber
	try:
		furniture = paginator_furniture.page(page_furniture)
	except PageNotAnInteger:
		furniture = paginator_furniture.page(1)
	except EmptyPage:
		furniture = paginator_furniture.page(paginator_furniture.num_pages)
	return {'furniture':furniture, "STATIC_URL":context['STATIC_URL']}'''
	return {'comments': comments_list, "STATIC_URL":context['STATIC_URL']}
