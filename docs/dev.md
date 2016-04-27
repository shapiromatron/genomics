# Development startup.

The development instructions here list setup for both the backend (a Python django application with a PostgreSQL database), as well as the frontend (a React application with Babel ES6 javascript). Note that this is a complex web application, and therefore multiple steps are required: 

1. Setting up the [python webserver](#python-webserver-setup) backend
2. Setting up the [database](#database-setup)
3. Syncing the [webserver and the database](#webserver-database-sync)
4. Setting up the [frontend bundling environment](#frontend-javascript-bundling)
5. Loading example [ENCODE data](#loading-encode-data)
6. Running the [development server](#starting-the-development-server)

## Python webserver setup

Requires the following software before beginning:

- Python 3.4+
- PostgreSQL 9.4+
- Python virtualenv and virtualenvwrapper

Create a new python virtual environment, we'll use the virtual environment name `genomics` throughout the documentation. Next, change paths to the root level of this project. Then, we'll install all python requirements by running the command:

    pip install -r requirements/dev.txt
        
Next, change directories into the `/project` path. Copy default django local-development settings:

    cp django_project/settings/local.example.py django_project/settings/local.py

Setup commands to start when activating the virtual environment:

    echo "export DJANGO_SETTINGS_MODULE=django_project.settings.local" >> $VIRTUAL_ENV/bin/postactivate
    echo "unset DJANGO_SETTINGS_MODULE" >> $VIRTUAL_ENV/bin/postdeactivate

## Database setup

Next, create a database:

    createdb -E UTF-8 genomics
    
## Webserver database sync

Restart your virtual environment (`deactivate`, then `workon genomics`). Navigate
to the `/project` path in the repository.

    python manage.py migrate
    python manage.py createsuperuser
    python manage.py download_ucsc_tools

## Frontend Javascript bundling

Make sure [node.js](https://nodejs.org/en/foundation/) and [npm](https://www.npmjs.com/) are installed, and are accessible in our environment.

Then, change directory  to the `/project` path of our project. Run the following command, which will install all javascript packages for our development environment:

    npm install --save-dev

After loading all frontend dependencies with the command above, we can run a command to watch our javascript location to compile and push updates to the website (detailed below).

*Note*: if you're using sublime text as a text editor, you may want to download the [Babel](https://github.com/babel/babel-sublime) package for updated syntax definitions. Then, with a Javascript file open, change the default syntax highlighting to Babel.

References:

- [Webpack and django](http://owaislone.org/blog/webpack-plus-reactjs-and-django/)
- [React for beginners](https://reactforbeginners.com/)


## Loading ENCODE data

Input bigWig data are very large and therefore not included in the repository. To load ENCODE data into the development environment, you'll need to have the bigWig files and a JSON file with additional metadata describing these files.

Example data can be downloaded here:

- [ENCODE data subset](http://manticore.niehs.nih.gov/ucscview/shapiroaj4/encode.zip) (:bangbang: 15GB! :bangbang:)
- [ENCODE data subset JSON metadata](http://manticore.niehs.nih.gov/ucscview/shapiroaj4/load_encode.json) (6 MB)
- [Example feature-list](http://manticore.niehs.nih.gov/ucscview/shapiroaj4/unt1hr.obsTSS.bed) (0.4 MB)
- [Example sort-vector](http://manticore.niehs.nih.gov/ucscview/shapiroaj4/wgEncodeBroadHistoneA549CtcfEtoh02Sig.sortVector.txt) (0.2 MB)
  
The feature-list and sort-vector are loaded from the the web-interface after the server has been started (see below). 

To load the encode data:

1. Unzip the encode data subset into a `/data` folder from the root-folder of the application. After unzipping, the file structure should look like this:
        
        /
            data/
                encode/
                    hg19/
            docs/
            project/
            ...

2. Navigate to the `/project` path, an execute the following command, using the downloaded ENCODE JSON metadata file above:

        python manage.py load_encode /path/to/load_encode.json

**Caution: This management command will delete all ENCODE objects in the database**

## Starting the development server

Whenever we want to start coding, we'll need to start the django backend application and the javascript frontend hot--reloading application. We need to be sure that we're in the python virtual environment with all our packages installed, and then we change directories to the `/project` path of the genomics application:

    workon genomics
    cd /path/to/genomics/project/

After running the commands above, start the backend python client in one terminal window:

    python manage.py runserver 9000

After running the commands above, start the javascript bundler in another terminal window:

    node webpack.devserver.js

Navigate to [localhost:9000](http://127.0.0.1:9000/), and start developing!

# Additional optional commands

## IPython/Jupyter notebooks (optional)

If interested in the [ipython/jupyter notebooks](http://jupyter.org/) , you can run the notebook server using this command:

    workon genomics
    python manage.py shell_plus --notebook

Then, navigate to [localhost:8888](http://127.0.0.1:8888/) to view the notebooks.
