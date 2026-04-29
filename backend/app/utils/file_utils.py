import os


def ensure_directory(path: str):
    if not os.path.exists(path):
        os.makedirs(path)


def get_file_extension(filename: str):
    return filename.split(".")[-1]
