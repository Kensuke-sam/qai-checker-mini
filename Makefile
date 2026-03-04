.PHONY: install run test

install:
	python -m pip install -e '.[dev]'

run:
	python -m qai_checker_mini examples/doc_a.md examples/doc_b.md

test:
	pytest -v
