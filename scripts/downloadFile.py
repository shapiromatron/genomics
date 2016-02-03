#!/usr/bin/env python

import requests
import click
import os

class DownloadFile(object):
    
    def __init__(self, file_url, download_location):
        
        self.file_url = file_url
        self.download_location = download_location
        
        self.checkFileLocation()
        self.getFile()
        
    def checkFileLocation(self):
        if os.path.isfile(self.download_location):
            raise Exception("File exists at download location!!")
    
    def getFile(self):
        r = requests.get(self.file_url, stream=True)
        f = open(self.download_location, "w")
        for chunk in r.iter_content(chunk_size=1024):
            if chunk:
                f.write(chunk)
        f.close()

@click.command()
@click.argument('file_url')
@click.argument('download_location')

def cli(file_url, download_location):
    """
    Download file specified by url.
    """
    DownloadFile(file_url, download_location)

if __name__ == '__main__':
    cli()