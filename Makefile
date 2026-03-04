VENV := .venv
PYTHON := $(VENV)/bin/python3
PIP := $(VENV)/bin/pip

.PHONY: install run test

$(VENV):
	python3 -m venv $(VENV)

install: $(VENV)
	$(PIP) install -e '.[dev]'

run: install
	$(PYTHON) -m qai_checker_mini examples/doc_a.md examples/doc_b.md

test: install
	$(VENV)/bin/pytest -v
