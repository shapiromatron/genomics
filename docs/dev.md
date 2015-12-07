# Development startup.

The development instructions here list setup for both the backend (a Python django application with a PostgreSQL database), as well as the frontend (a React application with Babel ES6 javascript).

## Backend setup

Requires the following software before beginning:

- Python 2.7
- PostgreSQL 9.4+
- Python virtualenv and virtualenvwrapper

Create a new python virtual environment, we'll use `genomics` throughout the
documentation. Next, change paths to the root level of this project. Then, we'll install
all python requirements by runing the command:

```
pip install -r requirements/dev.txt
```

Next, change directories into the `/project` path. Copy default django local-development settings:

```
cp django_project/settings/local.example.py django_project/settings/local.py
```

Setup commands to start when activating the virtual environment:

```
echo "export DJANGO_SETTINGS_MODULE=django_project.settings.local" >> $VIRTUAL_ENV/bin/postactivate
echo "unset DJANGO_SETTINGS_MODULE" >> $VIRTUAL_ENV/bin/postdeactivate
```

Next, create a database:

```
createdb -E UTF-8 genomics
```

Restart your virtual environment (`deactivate`, then `workon genomics`). Navigate
to the `/project` path in the repository.

```
python manage.py migrate
python manage.py createsuperuser
```

### Setting up React and Javascript webpack.

Two references I used for setup help:

- [Webpack and django](http://owaislone.org/blog/webpack-plus-reactjs-and-django/)
- [React for beginners](https://reactforbeginners.com/)

First make sure [node.js](https://nodejs.org/en/foundation/) and [npm](https://www.npmjs.com/) are installed, and are accessible in our environment.

Then, change directory  to the `/project` path of our project. Run the following command, which will install all javascript packages for our development environment:

```
npm install --save-dev
```

Next, we run this server to hot-reload updates to any new javascript code that we write:

*Note*: if you're using sublime text as a text editor, you may want to download the [Babel](https://github.com/babel/babel-sublime) package for updated syntax definitions. Then, with a Javascript file open, change the default syntax highlighting to Babel.

##Development testing


Whenever we want to start coding, we'll need to start the django backend application and the javascript frontend hot--reloading application. Execute these commands in separate terminal windows (from the `/project` path of our application):
```
workon genomics
cd /path/to/application/project/
python manage.py runserver 9000
node webpack.devserver.js
```

Navigate to [localhost:9000](http://127.0.0.1:9000/), and start developing!

### IPython/Jupyter notebooks

If interested in the [ipython/jupyter notebooks](http://jupyter.org/) , you can run the notebook server using this command:

```
workon genomics
ipython notebook --no-browser --notebook-dir=/path/to/application/notebooks
```

Then, navigate to [localhost:8888](http://127.0.0.1:8888/) to view the notebooks.
