import unittest
import xdsmjs


class TestXdsmjs(unittest.TestCase):
    def test_bundlejs(self):
        self.assertTrue(len(xdsmjs.bundlejs()) > 100)

    def test_css(self):
        self.assertTrue(len(xdsmjs.css()) > 100)


if __name__ == "__main__":
    unittest.main()
