# ----------------------------------------------------------------------------
# Copyright (c) 2018--, empress development team.
#
# Distributed under the terms of the Modified BSD License.
#
# ----------------------------------------------------------------------------
import unittest
from skbio import TreeNode
from empress import Tree


class TestTree(unittest.TestCase):

    def mock_tree_from_nwk(self):
        return TreeNode.read(['(((a:1,e:2)f:1,b:2)g:1,(c:1,d:3)h:2)i:1;'])

    def setUp(self):
        self.tree = self.mock_tree_from_nwk()

    def test_from_tree(self):
        t = Tree.from_tree(self.tree)
        self.assertEqual(t.__class__, Tree)

    def test_coords(self):
        t = Tree.from_tree(self.tree)
        t.coords(500, 500)

        coords = [(-10.222747306219219, 195.06163867407446),
                  (118.00044943013512, 262.22444928198297),
                  (36.73032180166217, 137.07942714215795),
                  (184.76890317443747, 23.95196521134946),
                  (40.6350638142365, 62.57251106991248),
                  (-77.36538561589865, -199.6519382120705),
                  (-290.23109682556253, -205.35762294073118),
                  (-81.27012762847295, -125.14502213982503),
                  (0.0, 0.0)]

        for i, node in enumerate(t.postorder()):
            x_test, y_test = (node.x2, node.y2)
            x, y = coords[i]
            self.assertAlmostEqual(x_test, x, places=5)
            self.assertAlmostEqual(y_test, y, places=5)

    def test_rescale_unrooted(self):
        t = Tree.from_tree(self.tree)
        self.assertAlmostEqual(
            t.rescale_unrooted(500, 500), 74.609165340334656, places=5)

    def test_to_igraph(self):
        t = Tree.from_tree(self.tree)
        ig, n2i = t.to_igraph()
        # Check that node -> integer ID mapping is valid
        self.assertEqual(
            set([n.name for n in n2i.keys()]),
            set(["a", "b", "c", "d", "e", "f", "g", "h", "i"])
        )
        self.assertEqual(n2i[t.root()], 0)
        self.assertEqual(set(n2i.values()), set(range(9)))

        # Check that the topology of the igraph matches the tree topology
        for n in t.preorder():
            if n.has_children():
                child_ids = [n2i[c] for c in n.children]
                self.assertEqual(
                    set(ig.neighbors(n2i[n], mode="OUT")),
                    set(child_ids)
                )


if __name__ == "__main__":
    unittest.main()
