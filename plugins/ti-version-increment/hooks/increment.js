var DOMParser = require('xmldom').DOMParser,
	fs = require('fs'),
	path = require('path');

exports.id = 'com.appcelerator.ti-version-increment';
exports.version = require('../package.json').version;
exports.cliVersion = '>=3.2.0';

exports.init = function (logger, config, cli, appc) {
	cli.addHook('build.pre.construct', function (builder) {
		var parser = new DOMParser,
			tiappFile = path.join(builder.projectDir, 'tiapp.xml'),
			dom = parser.parseFromString(fs.readFileSync(tiappFile).toString(), 'text/xml'),
			doc = dom.documentElement,
			node = doc.firstChild;

		// find the <version> tag in the tiapp.xml
		for (; node; node = node.nextSibling) {
			if (node.nodeType == appc.xml.ELEMENT_NODE && node.tagName == 'version' && node.firstChild) {
				try {
					// found the <version> tag, try to parse it
					var orig = appc.version.format(node.firstChild.data, 3),
						version = orig.split('.');

					// increment the 3rd digit
					version[2] = parseInt(version[2]) + 1;

					// set both the <version> in the tiapp.xml and the version in the builder's tiapp which is already loaded
					node.firstChild.data = builder.tiapp.version = version = version.join('.');

					logger.info('Incrementing version number from ' + String(orig).cyan + ' to ' + String(version).cyan);

					// write the new tiapp.xml
					fs.writeFileSync(tiappFile, dom.toString());
				} catch (e) {
					logger.error('tiapp.xml has a bad version number!');
				}
				break;
			}
		}
	});
};
