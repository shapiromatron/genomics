from django.core.files.storage import FileSystemStorage


class ReadOnlyFileSystemStorage(FileSystemStorage):

    @classmethod
    def create_store(cls, location):
        return cls(location=location)

    def save(self, name, content, max_length=None):
        raise NotImplementedError()

    def delete(self, name):
        raise NotImplementedError()
