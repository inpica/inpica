from django.db import models
from django.contrib.auth.models import User
from datetime import datetime

#RCD	Record Creation Date
#RUD	Record Update Date

class UserDetails(models.Model):
	'''
	Additional user information (if needed)
	confirmCode = when user creates account, confirmCode is emailed to them so that they can activate their account
	'''
	user = models.OneToOneField(User, primary_key=True)
	confirmCode = models.CharField(max_length=40, null=True)



def FloorplanMap_Filename(instance, filename):
	return '/'.join(['image/floorplan/map', str(instance.id) + '.' + filename.split('.')[-1]])

class Floorplan(models.Model):
	'''
	User generated floor plans. jsonObjects represents a JSON of all Layout objects composing the Floorplan - used for performance boost. map represents the floorplan map uploaded by the user (this may be null). Users can only upload 1 map per floorplan. All maps are positioned in the same x,y top left coordinate for simplification.
	scalePixelsPerFoot = zoom setting in pixels per foot 
	panX = x pixels canvas is panned left
	panY = y pixels canvas is panned up
	'''
	id = models.AutoField(primary_key=True)
	user = models.ForeignKey(User, db_index=True)
	title = models.CharField(max_length=255)
	jsonObjects = models.CharField(max_length=9999, null=True)
	scalePixelsPerFoot = models.IntegerField(default=20)
	panX = models.IntegerField(default=0)
	panY = models.IntegerField(default=0)
	map = models.ImageField(upload_to=FloorplanMap_Filename, null=True)
	mapxFeet = models.FloatField(null=True)
	mapyFeet = models.FloatField(null=True)
	RCD = models.DateTimeField(default=datetime.now)
	RUD = models.DateTimeField(default=datetime.now)



def IdeaPic_Filename(instance, filename):
	return '/'.join(['image/floorplan/idea', instance.floorplan.id,str(instance.id) + filename.split('.')[-1]])

class IdeaPic(models.Model):
	'''
	List of Idea Pictures tagged to each floorplan. If url not null: img src = url. if url null, img src = image.
	'''
	id = models.AutoField(primary_key=True)
	floorplan = models.ForeignKey('Floorplan', db_index=True)
	image = models.ImageField(upload_to=IdeaPic_Filename, null=True)
	url = models.CharField(max_length=255, null=True)
	RCD = models.DateTimeField(default=datetime.now)



class Furnishing(models.Model):
	'''
	1+ furnishings tagged to floorplan. Furnishing can be generated by floorplan owner or a contributor. jsonObjects represents a JSON of all furniture objects tagged to furnishing - used for performance boost.
	scalePixelsPerFoot = zoom setting in pixels per foot 
	panX = x feel canvas is panned left
	panY = y feet canvas is panned up
	'''
	id = models.AutoField(primary_key=True)
	floorplan = models.ForeignKey('Floorplan', db_index=True)
	user = models.ForeignKey(User, db_index=True)
	title = models.CharField(max_length=255, null=True)	
	furnitures = models.ManyToManyField('Furniture', through='FurnitureFurnishing')
	jsonObjects = models.CharField(max_length=9999, null=True)
	comment = models.CharField(max_length=4000, null=True)
	isDefault = models.BooleanField(default=False)
	RCD = models.DateTimeField(default=datetime.now)
	RUD = models.DateTimeField(default=datetime.now)



def FurnitureSymbol_Filename(instance, filename):
	return '/'.join(['image/furniture/symbol', str(instance.id) + filename.split('.')[-1]])


class Furniture(models.Model):
	'''
	All of a users furnitures. if url not null, then user pinned furniture from url, otherwise they created their own furniture item. Symbol is the symbolic image of the furniture piece represented on the furnishing canvas. For now we will have a defined list of furnishing images a user chooses from - so the "upload-to" attribute is irrelevant for now. bucket represents the bucket in which the furniture is placed into. For now it is system defined as "Pinned" and "My Furniture" but there is an option to expand if needed.
	'''
	id = models.AutoField(primary_key=True)
	user = models.ForeignKey(User, db_index=True)
	title = models.CharField(max_length=255)
	url = models.CharField(max_length=255, null=True, db_index=True)
	symbolPath = models.CharField(max_length=255, null=True)
	symbol = models.ImageField(upload_to=FurnitureSymbol_Filename, null=True)
	RCD = models.DateTimeField(default=datetime.now)
	bucket = models.CharField(max_length=255, choices=[('PIN','Pin Board'), ('MY', 'My Furniture')], db_index=True)
	h = models.IntegerField(null=True)
	w = models.IntegerField(null=True)



def FurniturePic_Filename(instance, filename):
	return '/'.join(['image/furniture/pic', instance.furniture.id,str(instance.id) + filename.split('.')[-1]])

class FurniturePic(models.Model):
	'''
	List of Furniture pictures tagged to each furniture. if url is not null: image src = url. if url is null: image src = image.
	'''
	id = models.AutoField(primary_key=True)
	furniture = models.ForeignKey('Furniture', db_index=True)
	image = models.ImageField(upload_to=FurniturePic_Filename, null=True)
	url = models.CharField(max_length=255, null=True)
	RCD = models.DateTimeField(default=datetime.now)



class Dim(models.Model):
	'''
	Abstract model object. Defines the positional metadata of objects placed on the canvas
	x = Feet the center of object (image, top left of object) is from the left
	y = Feet the center of object (image, top left of object) is from the top 
	r = rotation angle about the center
	l = length of object (only for line objects)
	h = height of object (only for certain objects)
	w = width of object (only for certain objects)
	snapX = percentage value of left x snapto point. percentage based on w. (only for certain objects)
	snapY = percentage value of top y snapto point. percentage based on h. (only for certain objects)
	'''
	x = models.IntegerField()
	y = models.IntegerField()
	r = models.IntegerField()
	l = models.IntegerField(null=True)
	h = models.IntegerField(null=True)
	w = models.IntegerField(null=True)
	snapX = models.IntegerField(null=True)
	snapY = models.IntegerField(null=True)
	class Meta:
		abstract = True


class FurnitureFurnishing(Dim):
	'''
	M2M Proxy Table. includes Dim information on placement of Furniture on the Furnishing. Note, the h and w fields are copied from from the Furniture attributes (they are included in Dim) so that it provides us with the option where if use makes any modification to furniture h/w, it does not affect the furniture piece on any of the Furnishing canvases. 
	'''
	id = models.AutoField(primary_key=True)
	furniture = models.ForeignKey('Furniture', db_index=True)
	furnishing = models.ForeignKey('Furnishing', db_index=True)



class FloorplanObjectInstance(Dim):
	'''
	List of all the objects that are placed on the floorplan (i.e. walls, doors, etc.). These objects are also stored in the jsonObjects field of the Floorplan object for fast performance.
	'''
	id = models.AutoField(primary_key=True)
	floorplan = models.ForeignKey('Floorplan', db_index=True)
	type = models.CharField(max_length=255)



class FloorplanCameraInstance(Dim):
	'''
	These are camera objects placed on the Floorplan. Note, the camera objects are available on the floorplan and all of its furnishings. The Dim specifies the location and orientation of the camera object, which will be a simple image SVG object.
	'''
	id = models.AutoField(primary_key=True)
	floorplan = models.ForeignKey('Floorplan', db_index=True)



def FloorplanCameraPic_Filename(instance, filename):
	return '/'.join(['image/floorplan/camera', instance.camera.floorplan.id, str(instance.id) + filename.split('.')[-1]])

class FloorplanCameraPic(models.Model):
	'''
	List of pictures tagged to each Camera on a floorplan. A camera object can have 1+ pics tagged to it. Each pic can have an optional comment.
	'''
	id = models.AutoField(primary_key=True)
	camera = models.ForeignKey('FloorplanCameraInstance', db_index=True)
	image = models.ImageField(upload_to=FloorplanCameraPic_Filename)
	comment = models.CharField(max_length=4000, null=True)
	RCD = models.DateTimeField(default=datetime.now)



class Bookmarklet(models.Model):
	user = models.ForeignKey(User, db_index=True)
	uuid = models.CharField(max_length=40)
	EOL = models.DateTimeField() #End of Life
	RCD = models.DateTimeField(datetime.now)
