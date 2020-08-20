require(["jquery", "chroma", "UtilitiesForTesting", "Legend"], function (
    $,
    chroma,
    UtilitiesForTesting,
    Legend
) {
    $(document).ready(function () {
        module("Legend", {
            // Create and destroy the container HTML element within the test,
            // to avoid having to directly mess around with the test HTML file.
            // (I can't find the exact source, but I read about this on a
            // StackOverflow post somewhere.)
            setup: function () {
                this.containerEle = document.createElement("div");
                this.validateRefSVG = function (obsContainerSVG, expSVG) {
                    equal(obsContainerSVG.tagName, "svg");
                    equal(
                        obsContainerSVG.namespaceURI,
                        "http://www.w3.org/2000/svg"
                    );
                    // When rendering the SVG on the page, the browser replaces
                    // <stop .../> with <stop ...></stop> (and
                    // <rect .../> with <rect ...></rect). I don't know why this is
                    // happening, but so that we can directly compare the HTML strings
                    // we just replace things in the observed SVG to make them
                    // consistent.
                    var obsContainerSVGInnerHTML = obsContainerSVG.innerHTML
                        .split("></stop>")
                        .join("/>")
                        .split("></rect>")
                        .join("/>");
                    equal(obsContainerSVGInnerHTML, expSVG);
                };
            },
            tearDown: function () {
                this.containerEle.remove();
            },
        });
        test("On initialization, clear() isn't called", function () {
            // Check that clear() isn't called on constructing the legend, so
            // preexisting elements remain until addCategoricalKey() /
            // addContinuousKey() is called (there isn't really an important
            // reason for this, it's just how things work; the caller is
            // responsible for making sure Legends aren't created in already-
            // populated containers, at least when initially constructing a
            // Legend)
            var funkyP = this.containerEle.appendChild(
                document.createElement("p")
            );
            funkyP.innerText = "asdfasdfasdf";
            var legend = new Legend(this.containerEle);
            equal(this.containerEle.firstChild, funkyP);
        });
        test("addCategoricalKey", function () {
            var legend = new Legend(this.containerEle);
            var colorInfo = {
                "Thing 1": "#ff0000",
                "Thing 2": "#00ff00",
                "Thing 3": "#0000ff",
                "Thing 4": "#ffffff",
                "Thing 5": "#000000",
            };
            legend.addCategoricalKey("qwerty", colorInfo);

            // There should only be two top-level elements added to the legend
            // container element
            equal(this.containerEle.children.length, 2);

            // The first of these child elements should be a title
            var title = this.containerEle.children[0];
            ok(title.classList.contains("legend-title"));
            equal(title.innerText, "qwerty");

            // The second is a table containing the color map
            var tbl = this.containerEle.children[1];
            equal(tbl.tagName, "TABLE");
            // Iterate over every row in the table using jQuery: see
            // https://stackoverflow.com/a/10432012/10730311
            // Note that the order of the parameters of the .each() callback
            // differs from underscore.js' .each() callbacks. To quote
            // Socrates, "sometimes it be like that."
            $(tbl)
                .find("tr")
                .each(function (i, tr) {
                    var cellsInRow = $(tr).children();
                    equal(cellsInRow.length, 2);

                    // First off, check that the colors are as expected.

                    // The color returned by jQuery is formatted something like
                    // "rgb(255, 0, 0)". Fortunately, chroma.js recognizes this, so
                    // we can just chuck both colors to compare through chroma
                    // before checking equality.
                    var shownColor = $(cellsInRow[0]).css("background");
                    // key -> color mappings should be sorted based on the key
                    // using util.naturalSort(). So we can assume that Thing 1 is
                    // the first row, Thing 2 is the second row, etc.
                    var expectedKey = "Thing " + (i + 1);
                    equal(
                        chroma(shownColor).hex(),
                        chroma(colorInfo[expectedKey]).hex()
                    );

                    // Now, check that the legend is as expected.
                    equal(cellsInRow[1].innerText, expectedKey);
                });
            // Legend should be visible
            notOk(this.containerEle.classList.contains("hidden"));
        });
        test("addCategoricalKey (just 1 color)", function () {
            var legend = new Legend(this.containerEle);
            var darkBrown = "#52330b";
            var colorInfo = { hjkl: darkBrown };
            legend.addCategoricalKey("Single-color test", colorInfo);

            var title = this.containerEle.children[0];
            equal(title.innerText, "Single-color test");

            var tbl = this.containerEle.children[1];
            var rows = $(tbl).find("tr");
            equal(rows.length, 1);
            var cells = $(rows[0]).children();
            equal(chroma($(cells[0]).css("background")).hex(), darkBrown);
            equal(cells[1].innerText, "hjkl");
        });
        test("addCategoricalKey (error: no categories)", function () {
            var legend = new Legend(this.containerEle);
            throws(function () {
                legend.addCategoricalKey("oops", {});
            }, /Can't create a categorical legend when there are no categories in the info/);
        });
        test("addContinuousKey", function () {
            var legend = new Legend(this.containerEle);
            var refSVG = UtilitiesForTesting.getReferenceSVG();
            legend.addContinuousKey(
                "OMG this is a continuous legend!",
                refSVG,
                false
            );

            // As with addCategoricalKey(), there are two children added to the
            // top level of the container element.
            equal(this.containerEle.children.length, 2);

            // 1. A title
            var title = this.containerEle.children[0];
            ok(title.classList.contains("legend-title"));
            equal(title.innerText, "OMG this is a continuous legend!");

            // 2. A "container SVG" element containing the gradient SVG
            var cSVG = this.containerEle.children[1];
            this.validateRefSVG(cSVG, refSVG);

            // Legend should be visible
            notOk(this.containerEle.classList.contains("hidden"));
        });
        test("addContinuousKey (with non-numeric warning)", function () {
            var legend = new Legend(this.containerEle);
            var refSVG = UtilitiesForTesting.getReferenceSVG();
            legend.addContinuousKey("howdy", refSVG, true);

            // There's a third top-level child element now -- a warning
            // message shown to the user.
            equal(this.containerEle.children.length, 3);

            // 1. Check title
            var title = this.containerEle.children[0];
            ok(title.classList.contains("legend-title"));
            equal(title.innerText, "howdy");

            // 2. Check SVG
            var cSVG = this.containerEle.children[1];
            this.validateRefSVG(cSVG, refSVG);

            // 3. Check non-numeric warning
            var warning = this.containerEle.children[2];
            equal(warning.tagName, "P");
            equal(
                warning.innerText,
                "Some value(s) in this field were not " +
                    "numeric. These value(s) have been left " +
                    "out of the gradient, and no bar(s) " +
                    "have been drawn for them."
            );
            // Verify that the warning <p> has white-space: normal; set so it
            // has line breaks, like normal text
            equal($(warning).css("white-space"), "normal");

            // Legend should be visible
            notOk(this.containerEle.classList.contains("hidden"));
        });
        test("clear", function () {
            var legend = new Legend(this.containerEle);
            var funkyP = this.containerEle.appendChild(
                document.createElement("p")
            );
            funkyP.innerText = "I should be removed when clear is called!";
            var wackyDiv = this.containerEle.appendChild(
                document.createElement("div")
            );
            wackyDiv.innerText =
                "I'm here to test that clear removes all children";
            legend.clear();
            // The legend container should now be hidden
            ok(this.containerEle.classList.contains("hidden"));
            // ... and all of its child elements should be removed
            equal(this.containerEle.firstChild, null);
        });
        test("unhide", function () {
            var legend = new Legend(this.containerEle);
            legend.clear();
            // Legend container is now hidden
            ok(this.containerEle.classList.contains("hidden"));
            legend.unhide();
            // Legend container is now not hidden!
            notOk(this.containerEle.classList.contains("hidden"));
        });
    });
});
