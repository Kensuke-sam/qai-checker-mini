.PHONY: install run test

install:
	python3 -m pip install -e '.[dev]'

run:
	python3 -m qai_checker_mini examples/doc_a.md examples/doc_b.md

test:
	pytest -v
