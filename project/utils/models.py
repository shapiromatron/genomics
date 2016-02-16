import os
import uuid


from django.core.files.storage import FileSystemStorage


class ReadOnlyFileSystemStorage(FileSystemStorage):

    @classmethod
    def create_store(cls, location):
        return cls(location=location)

    def save(self, name, content, max_length=None):
        raise NotImplementedError()

    def delete(self, name):
        raise NotImplementedError()


def get_random_filename(root):
    # get new, unused, random filename
    while True:
        fn = os.path.abspath(
            os.path.join(
                root, "{}.txt".format(uuid.uuid4())
            )
        )
        if not os.path.exists(fn):
            break
    return fn
