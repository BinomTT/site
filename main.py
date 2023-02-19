from pathlib import Path
from jinja2 import Template
from yaml import load as load_yaml, Loader
from hashlib import md5
from json import dumps as dumps_json

from typing import Dict, Any, List


CURRENT_DIR: Path = Path(__file__).parent
FILES_PATH: Path = CURRENT_DIR / "files"

ENCODING: str = "utf-8"
CHUNK_SIZE: int = 8192


# TODO: dataclasses
site_config: Dict[str, Any] = load_yaml(
    stream = (CURRENT_DIR / "site_config.yml").read_text(
        encoding = ENCODING
    ),
    Loader = Loader
)


(CURRENT_DIR / "template.html").write_text(
    data = Template(
        source = (FILES_PATH / "index.html").read_text(
            encoding = ENCODING
        )
    ).render(
        school_name = site_config["school_name"]
    ),
    encoding = ENCODING
)


TIMETABLE_FILES_PATH: Path = FILES_PATH / "timetable"


timetable_numbers: List[str] = []

timetable_path: Path
timetable_filename: str
timetable_number: str
timetable_json_filename: str

for timetable_path in TIMETABLE_FILES_PATH.rglob("*.xlsx"):
    timetable_filename = timetable_path.name.split(".")[0]
    timetable_number = timetable_filename.split("_")[-1]

    if timetable_number not in site_config["timetables"]:
        raise SystemExit(
            "{timetable_number!r} is incorrect timetable number.".format(
                timetable_number = timetable_number
            )
        )

    from edu_xlsx import XLSXParser

    xlsx_parser: XLSXParser = XLSXParser(
        xlsx_filepath = timetable_path,
        timetable_number = timetable_number
    )

    xlsx_parser.parse()

    json_filepath: Path = timetable_path.parent / "{}.json".format(timetable_number)

    try:
        json_filepath.unlink()
    except:
        pass

    xlsx_parser.save(
        json_filepath = json_filepath,
        json_indent = None
    )

    timetable_path.unlink()


timetable_hashes: List[str] = []


for timetable_path in TIMETABLE_FILES_PATH.rglob("*.json"):
    timetable_filename = timetable_path.name.split(".")[0]
    timetable_number = timetable_filename.split("_")[-1]

    if timetable_number == "list":
        continue

    if timetable_number not in site_config["timetables"]:
        raise SystemExit(
            "{timetable_number!r} is incorrect timetable number.".format(
                timetable_number = timetable_number
            )
        )

    timetable_json_path: Path = timetable_path.parent / "{}.json".format(timetable_number)

    if timetable_filename != timetable_json_path:
        timetable_path.rename(timetable_json_path)

    timetable_numbers.append(timetable_number)

    timetable_hash = md5()

    with timetable_path.open("rb") as file:
        while chunk := file.read(8192):
            timetable_hash.update(chunk)

    timetable_hashes.append(timetable_hash.hexdigest())


if not timetable_numbers:
    raise SystemExit("No timetables.")


(TIMETABLE_FILES_PATH / "list.json").write_text(
    data = dumps_json(
        obj = {
            "r": {
                "allow_my_items": {},
                "defaults": {
                    "showColors": True,
                    "timeMode": False,
                    "swapAxis": False
                },
                "current": {
                    "allow": False
                },
                "regular": {
                    "default_num": timetable_numbers[0],
                    "timetables": [
                        {
                            "tt_num": timetable_number,
                            "year": site_config["year"],
                            "text": site_config["timetables"][timetable_number]["text"],
                            "datefrom": site_config["timetables"][timetable_number]["datefrom"],
                            "hash": timetable_hashes[index],
                            "hidden": False
                        }
                        for index, timetable_number in enumerate(timetable_numbers, 0)
                    ]
                },
                "_changeEvents": {
                    "dbi:global_settings": 1
                }
            }
        },
        ensure_ascii = True
    ),
    encoding = ENCODING
)
