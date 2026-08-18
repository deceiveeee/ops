#!/usr/bin/env python
"""Fallback PDF text extractor for the OPS source pipelines.

The Node pipelines prefer Poppler's ``pdftotext -layout``. When Poppler is not
installed, they may invoke this helper through ``OPS_SOURCE_PYTHON``. A form
feed is written after every source page so the caller can count pages without
guessing from the extracted content.
"""

from __future__ import annotations

import sys
from pathlib import Path

import pdfplumber


def main() -> None:
    if len(sys.argv) != 3:
        raise SystemExit("usage: extract-pdf-text.py INPUT.pdf OUTPUT.txt")

    source = Path(sys.argv[1])
    output = Path(sys.argv[2])
    with pdfplumber.open(source) as document:
        with output.open("w", encoding="utf-8", newline="") as handle:
            for page in document.pages:
                handle.write(page.extract_text(layout=True) or "")
                handle.write("\f")


if __name__ == "__main__":
    main()
