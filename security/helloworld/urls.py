from django.urls import path
from . import views
from django.http import StreamingHttpResponse

from camera import VideoCamera, gen

urlpatterns = [
    path('', views.signIn, name='signIn'),
    path('postsign', views.postsign, name='welcome'),
    path('screen', views.homePage, name='homePage'),
    path('get_log', views.get_log, name='get_log'),
    path('user/addPerson', views.addPerson, name='submitted'),
    path('monitor/', lambda r: StreamingHttpResponse(gen(VideoCamera()),
                                                     content_type='multipart/x-mixed-replace; boundary=frame')),
    path('logout', views.logout, name='loggedout'),
    path('index', views.index, name='index'),
    path('logs',views.logs,name="logs"),
    path('logsOf',views.logsOf,name="logsOf")
]
