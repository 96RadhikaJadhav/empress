// For exclusive use with Emperor
var colorGroups = {},
    color;
for (var i = 0; i < samples.length; i++) {
    color = samples[i].material.color.getHexString();
    if (colorGroups[color] === undefined) {
        colorGroups[color] = [];
    }
    colorGroups[color].push(samples[i].name);
}
empress.colorSampleGroups(colorGroups);

// 3 seconds before resetting
setTimeout(function () {
    empress.resetTree();
    empress.drawTree();

    samples.forEach(function (sample) {
        sample.material.emissive.set(0x000000);
    });

    plotView.needsUpdate = true;
}, 4000);
