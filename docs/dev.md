# Development startup.

Requires the following software before beginning:

- Python 2.7
- PostgreSQL 9.4+
- Python virtualenv and virtualenvwrapper

Create a new python virtual environment, we'll use `genomics` throughout the
documentation. Next, `cd` to the root level of this project. Then, we'll install
all python requirements by runing the command:

```
pip install -r requirements/dev.txt
```

Next, change directories into the `project` path.
Copy default django local-development settings:

```
cp django_project/settings/local.example.py django_project/settings/local.py
```

Setup commands to start when activating the virtual environment:

```
echo "export DJANGO_SETTINGS_MODULE=django_project.settings.local" >> $VIRTUAL_ENV/bin/postactivate
echo "unset DJANGO_SETTINGS_MODULE" >> $VIRTUAL_ENV/bin/postdeactivate
```

Next, create a database. Use the following command:

```
createdb -E UTF-8 genomics
```

Restart your virtual environment (`deactivate`, then `workon genomics`). Navigate
to the `/project` path in the repository. Now start your application using these
commands:

```
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver 4000
```

Navigate to [localhost:3000](http://127.0.0.1:3000/), and start developing!
