from django.urls import path
from . import views
from django.http import StreamingHttpResponse

from camera import VideoCamera, gen

urlpatterns = [

    path('', views.signIn, name='signIn'),
    path('postsign', views.postsign, name='welcome'),
    path('screen', views.homePage, name='homePage'),
    path('capture_img', views.capture_img, name='capture_img'),
    path('user/addPerson', views.addPerson, name='submitted2'),
    path('user/dateChanged', views.dateChanged, name='submitted'),
    path('monitor/', lambda r: StreamingHttpResponse(gen(VideoCamera()),
                                                     content_type='multipart/x-mixed-replace; boundary=frame')),
    path('logout', views.logout, name='loggedout'),
    path('reset', views.resetPassword, name='reset'),
    path('logsOf', views.logsOf, name="logsOf"),
    # path('back', views.back, name="back"),
    path('unregistered', views.unregistered, name="unregistered"),

]
