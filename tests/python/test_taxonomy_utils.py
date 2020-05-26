# ----------------------------------------------------------------------------
# Copyright (c) 2018--, empress development team.
#
# Distributed under the terms of the Modified BSD License.
#
# ----------------------------------------------------------------------------
import unittest
import pandas as pd
from pandas.testing import assert_frame_equal, assert_series_equal
import empress.taxonomy_utils as tax_utils


class TestTaxonomyUtils(unittest.TestCase):

    def setUp(self):
        self.feature_metadata = pd.DataFrame(
            {
                "Taxonomy": [
                    (
                        "k__Bacteria; p__Bacteroidetes; c__Bacteroidia; "
                        "o__Bacteroidales; f__Bacteroidaceae; g__Bacteroides; "
                        "s__"
                    ),
                    (
                        "k__Bacteria; p__Proteobacteria; "
                        "c__Gammaproteobacteria; o__Pasteurellales; "
                        "f__Pasteurellaceae; g__; s__"
                    ),
                    (
                        "k__Bacteria; p__Bacteroidetes; c__Bacteroidia; "
                        "o__Bacteroidales; f__Bacteroidaceae; g__Bacteroides; "
                        "s__uniformis"
                    ),
                    "k__Bacteria; p__Firmicutes; c__Bacilli"
                ],
                "Confidence": [0.95, 0.8, 0, 1]
            },
            index=["f1", "f2", "f3", "f4"]
        )

    def test_split_taxonomy_no_tax_column(self):
        fm2 = self.feature_metadata.copy()
        fm2.columns = ["asdf", "ghjkl"]
        fm3 = tax_utils.split_taxonomy(fm2)
        assert_frame_equal(fm2, fm3)

    def test_split_taxonomy_multiple_tax_columns(self):
        bad_fm = self.feature_metadata.copy()
        bad_fm.columns = ["Taxonomy", "taxon"]
        # As with above, parentheses mess up regexes -- raw strings fix that
        with self.assertRaisesRegex(
            tax_utils.TaxonomyError,
            (
                "Multiple columns in the feature metadata have one of the "
                r"following names \(case insensitive\): "
                r"\('taxon', 'taxonomy'\). At most one feature metadata "
                "column can have a name from that list."
            )
        ):
            tax_utils.split_taxonomy(bad_fm)

    def test_split_taxonomy_invalid_level_column(self):
        bad_fm = self.feature_metadata.copy()
        bad_fm.columns = ["Taxonomy", "Level 20"]
        with self.assertRaisesRegex(
            tax_utils.TaxonomyError,
            (
                "The feature metadata contains a taxonomy column, but also "
                r"already contains column\(s\) starting with the text 'Level' "
                r"\(case insensitive\)."
            )
        ):
            tax_utils.split_taxonomy(bad_fm)

    def test_split_taxonomy_level_column_but_no_taxonomy_column(self):
        meh_fm = self.feature_metadata.copy()
        meh_fm.columns = ["I'm ambivalent!", "Level 20"]
        meh_fm2 = tax_utils.split_taxonomy(meh_fm)
        assert_frame_equal(meh_fm, meh_fm2)

    def test_split_taxonomy_basic_case(self):
        initial_fm = self.feature_metadata.copy()
        split_fm = tax_utils.split_taxonomy(initial_fm)

        # First off, check that initial_fm was NOT modified: the input DF
        # should remain untouched
        assert_frame_equal(self.feature_metadata, initial_fm)

        # Next, let's verify that split_fm looks how we expect it to look.
        # ...First, by checking the columns -- should indicate that the
        # correct number of taxonomic levels were identified
        self.assertCountEqual(split_fm.columns, [
            "Level 1", "Level 2", "Level 3", "Level 4", "Level 5", "Level 6",
            "Level 7", "Confidence"
        ])
        # ...Next, check the index -- no features should've been dropped (that
        # isn't even a thing that this function does, but let's be safe :P)
        self.assertCountEqual(split_fm.index, ["f1", "f2", "f3", "f4"])

        # Now, let's check each row individually. This is kinda inelegant.
        assert_series_equal(
            split_fm.loc["f1"],
            pd.Series({
                "Level 1": "k__Bacteria",
                "Level 2": "p__Bacteroidetes",
                "Level 3": "c__Bacteroidia",
                "Level 4": "o__Bacteroidales",
                "Level 5": "f__Bacteroidaceae",
                "Level 6": "g__Bacteroides",
                "Level 7": "s__",
                "Confidence": 0.95
            }, name="f1")
        )
        assert_series_equal(
            split_fm.loc["f2"],
            pd.Series({
                "Level 1": "k__Bacteria",
                "Level 2": "p__Proteobacteria",
                "Level 3": "c__Gammaproteobacteria",
                "Level 4": "o__Pasteurellales",
                "Level 5": "f__Pasteurellaceae",
                "Level 6": "g__",
                "Level 7": "s__",
                "Confidence": 0.8
            }, name="f2")
        )
        assert_series_equal(
            split_fm.loc["f3"],
            pd.Series({
                "Level 1": "k__Bacteria",
                "Level 2": "p__Bacteroidetes",
                "Level 3": "c__Bacteroidia",
                "Level 4": "o__Bacteroidales",
                "Level 5": "f__Bacteroidaceae",
                "Level 6": "g__Bacteroides",
                "Level 7": "s__uniformis",
                "Confidence": 0
            }, name="f3")
        )
        assert_series_equal(
            split_fm.loc["f4"],
            pd.Series({
                "Level 1": "k__Bacteria",
                "Level 2": "p__Firmicutes",
                "Level 3": "c__Bacilli",
                "Level 4": "Unspecified",
                "Level 5": "Unspecified",
                "Level 6": "Unspecified",
                "Level 7": "Unspecified",
                "Confidence": 1
            }, name="f4")
        )


if __name__ == "__main__":
    unittest.main()
