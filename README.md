To setup this repo:

$ git clone https://github.com/tabdon/django-backbone-shop-full.git .
$ virtualenv venv
$ source venv/bin/activate
$ pip install -r requirements.txt 
$ python manage.py migrate
$ python manage.py loaddata core/fixtures/initial_data.json 
$ python manage.py runserver
