import main.models as m
from django import template
from datetime import datetime, timedelta
from django.utils.timesince import timesince
import main.data
from django.utils import formats
from django.contrib.auth.decorators import login_required

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

@register.inclusion_tag('snippet/layout-picker.html', takes_context=True)
def LayoutPicker(context):
	return {"default_layouts":main.data.default_layouts, "STATIC_URL":context['STATIC_URL']}

@login_required
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

@login_required
@register.inclusion_tag('snippet/my-comments-dashboard.html', takes_context = True)
def MyCommentsDashboard(context, pageNumber):
	comments_list  = m.Furnishing.objects.filter(user_id=context['user']).exclude(floorplan__user=context['user']).select_related(depth=2) #select all furnishings created by me on floorplans excluding mine
	paginator_comments = Paginator(comments_list, 5) 
	page_comments = pageNumber
	try:
		comments = paginator_comments.page(page_comments)
	except PageNotAnInteger:
		comments = paginator_comments.page(1)
	except EmptyPage:
		comments = paginator_comments.page(page_comments.num_pages)
	return {'mycomments':comments, "STATIC_URL":context['STATIC_URL']}

@register.filter
def timesince_threshold(value, hours=1):
	if datetime.utcnow() - value.replace(tzinfo=None) < timedelta(hours=hours):
		return  str(timesince(value)) + " ago"
	else:
		return formats.date_format(value, "DATE_FORMAT")
		#return value|date:"d M, Y"
	timesince_threshold.is_safe = False
