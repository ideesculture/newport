###### NOTICE:
This widget is based on com.mcongrove.slideMenu, using big icons, no text, and pushing one down of the screen.

---

Slide Menu Widget
-------------------
A custom slide menu widget for Titanium Alloy.

Example Usage
-------------

###### Alloy View (XML)

	<Alloy>
		<Window id="MainWindow">
			<Require type="widget" src="com.ideesculture.newportSlideMenu" id="SlideMenu" />
			
			<View id="AppWrapper">
				<!-- Content Goes Here -->
			</View>
		</Window>
	</Alloy>

###### Initialize Menu (JS)

	// Create our node items
	var nodes = [
		{ menuHeader: "My Tabs", id: 0, title: "Home", image: "/images/home.png" },
		{ id: 1, title: "Contact", image: "/images/phone.png" },
		{ id: 2, title: "Settings", image: "/images/gear.png" }
	];
	
	// Initialize the slide menu
	$.SlideMenu.init({
		nodes: nodes,
		color: {
			headingBackground: "#000",
			headingText: "#FFF"
		}
	});
	
	// Set the first node as active
	$.SlideMenu.setIndex(0);
	
	// Add an event listener on the nodes
	$.SlideMenu.Nodes.addEventListener("click", handleMenuClick);
	
	// Handle the click event on a node
	function handleMenuClick(_event) {
		if(typeof _event.row.id !== "undefined") {
			// Open the corresponding controller
			openScreen(_event.row.id);
		}
	}

###### Slide Animation Code Example (JS)

	function openMenu() {
		$.AppWrapper.animate({
			left: "200dp",
			duration: 250,
			curve: Ti.UI.ANIMATION_CURVE_EASE_IN_OUT
		});
	}
	
	function closeMenu() {
		$.AppWrapper.animate({
			left: "0dp",
			duration: 250,
			curve: Ti.UI.ANIMATION_CURVE_EASE_IN_OUT
		});
	}
	
	$.AppWrapper.addEventListener("swipe", function(_event) {
		if(_event.direction == "right") {
			openMenu();
		} else if(_event.direction == "left") {
			closeMenu();
		}
	});

Options
-------
Parameter               | Type     | Default |
------------------------|----------|---------|
nodes                   | `Array`  |         |
color                   | `Object` |         | 
color.headingBackground | `String` |         |
color.headingText       | `String` |         |

###### Node Parameters:

Parameter  | Type     | Description      |
-----------|----------|------------------|
menuHeader | `String` | Header row text  |
id         | `Number` | Node ID (unique) |
title      | `String` | Node title       |
image      | `String` | Icon path        |


Methods
-------
Function | Parameters | Description                               |
---------|------------|-------------------------------------------|
clear    |            | Removes all nodes                         |
setIndex | `index`    | The index of the item to mark as selected |

