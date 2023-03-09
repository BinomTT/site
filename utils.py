from pathlib import Path

from typing import Union


def get_filename_without_ext(filepath: Union[Path, str]) -> str:
    if not isinstance(filepath, Path):
        filepath = Path(filepath)

    return ".".join(filepath.name.split(".")[:-1])


def extract_timetable_number(filename: str) -> str:
    return filename.split("_")[-1]
