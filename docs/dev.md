# Development startup.

The development instructions here list setup for both the backend (a Python django application with a PostgreSQL database), as well as the frontend (a React application with Babel ES6 javascript).

## Backend setup

Requires the following software before beginning:

- Python 3.4+
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
python manage.py download_ucsc_tools
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
python manage.py shell_plus --notebook
```

Then, navigate to [localhost:8888](http://127.0.0.1:8888/) to view the notebooks.

### Loading ENCODE data into your environment

Input bigWig data are very large and therefore not included in the repository.
To load ENCODE data into the development environment, you'll need to have the
bigWig files and a JSON file with additional metadata describing these files.

Importing data requires three steps:

1. Place the bigWig files in a location where the web-application can find
    these files. The default path is in `/data/encode` from the root-path of
    the project (but this can be changed by modifying `ENCODE_PATH` django 
    the JSON file created in the next step (see below)
2. Create a JSON metadata file which describes the ENCODE datafiles. The file
    should be contain a list of ENCODE datasets, each object having a format
    such as this: 

            {
                "name": "wgEncodeHaibTfbsHepg2Tcf12Pcr1xRawRep2",
                "ambig_bigwig": "hg19/wgEncodeHaibTfbs/wgEncodeHaibTfbsHepg2Tcf12Pcr1xRawRep2.bigWig",
                "minus_bigwig": null,
                "plus_bigwig": null,
                "data_type": "ChipSeq",
                "genome_assembly": "hg19",
                "treatment": "None",
                "antibody": "TCF12",
                "cell_type": "HepG2",
                "rna_extract": "",
                "phase": "",
                "localization": "",
                "extra_content": {
                    "geoSampleAccession": "GSM803336",
                    "ambig_size": "11M",
                    "project": "wgEncode",
                    "dccAccession": "wgEncodeEH001544",
                    "composite": "wgEncodeHaibTfbs",
                    "ambig_md5sum": "31ec7bea63894895ed2d13beb321127f",
                    "grant": "Myers",
                    "dataVersion": "ENCODE Jan 2011 Freeze",
                    "protocol": "PCR1x",
                    "dateUnrestricted": 734431.0,
                    "dateSubmitted": 734158.0,
                    "controlId": "SL1401",
                    "type": "bigWig",
                    "ambig_view": "RawSignal",
                    "subId": 3026.0,
                    "ambig_tableName": "wgEncodeHaibTfbsHepg2Tcf12Pcr1xRawRep2",
                    "setType": "exp",
                    "lab": "HudsonAlpha",
                    "labExpId": "SL1167",
                    "replicate": 2.0
                }                
            }

3. Load the JSON metadata into the web application, which will then allow
    these datasets to be used in the analysis. Use the following management
    command to attempt import:

        python manage.py load_encode /path/to/load_encode.json

**Caution: This management command will delete all ENCODE objects in the database**
