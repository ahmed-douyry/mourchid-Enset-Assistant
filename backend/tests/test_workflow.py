import pytest

from app.graph.conditions import after_classify, route_specialized
from app.graph.state import LegalGraphState


def test_afterClassify_routesOutOfScope():
    s: LegalGraphState = {"query_type": "out_of_scope"}
    assert after_classify(s) == "out"


def test_routeSpecialized_procedure():
    s: LegalGraphState = {"query_type": "procedure"}
    assert route_specialized(s) == "procedure"


def test_routeSpecialized_academicDefault():
    s: LegalGraphState = {"query_type": "legal_question"}
    assert route_specialized(s) == "academic"
