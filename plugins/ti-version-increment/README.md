## Overview

ti-increment-version is a Titanium CLI plugin that ties into the
`build.pre.construct` event hook and increments the 3rd digit of the <version> in
the tiapp.xml.

## Installation

Extract this file into your project directory and add the following to your tiapp.xml:

	<plugins>
		<plugin>ti-version-increment</plugin>
	</plugins>
