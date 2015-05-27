define([
	'lodash', 
	'app/components/component'
], function(
	_, 
	Component
) {
	function createTestComponent(settings) {
		var components = settings && settings.components;
		var TestComponent = function() {
			Component.apply(this, arguments);
			this.components = components || [];
		};

		TestComponent.prototype = new Component();
		TestComponent.prototype.initComponent = function() {
			this.initComponentCalled = true;
		};

		return new TestComponent(settings);
	}

	describe('Component', function() {
		it('should create a component', function() {
			var settings = {"foo":"bar", "n": 100};
			var component = createTestComponent(settings);
			var parentComponent = null;

			component.init(parentComponent);
			expect(component.settings).toBe(settings);
			expect(component.components).toBeTruthy();
			expect(component.parentComponent).toBe(parentComponent);
		});

		it('should throw an exception if initComponent() is not implemented', function() {
			var makeComponent = function() {
				var component = new Component();
				component.init(null);
			};
			expect(makeComponent).toThrow(new Error("subclass responsibility"));
		});

		it('should create sub-components', function() {
			var settings = {
				components: [
					createTestComponent(),
					createTestComponent(),
					createTestComponent()
				]
			};
			var component = createTestComponent(settings);
			component.init(null);

			expect(component.components.length).toBe(settings.components.length);

			_.each(settings.components, function(subComponent) {
				expect(subComponent.initComponentCalled).toBe(true);
			});
		});

		it('should be observable and be able to broadcast events', function() {
			var component = createTestComponent();
			var another_component = createTestComponent();

			_.each(['broadcast','subscribe','trigger','bind'], function(method) {
				expect(component[method]).toBeTruthy();
			});

			var spies = {
				foo: function(){},
				bar: function(){}
			};

			spyOn(spies, 'foo');
			spyOn(spies, 'bar');

			component.bind("foo", spies.foo);
			component.subscribe("bar", spies.bar);

			component.trigger("foo");
			another_component.broadcast("bar", "beer me!");

			expect(spies.foo).toHaveBeenCalled();
			expect(spies.bar).toHaveBeenCalled();
			expect(spies.bar).toHaveBeenCalledWith("beer me!");
		});

		it('should know if it has named components', function() {
			var component = createTestComponent();
			var another_component = createTestComponent();
			var another_name = 'foo';

			component.setComponent(another_name, another_component);
			component.init(null);

			expect(component.hasComponent(another_name)).toBe(true);
			expect(component.getComponent(another_name)).toBe(another_component);
		});
	});
});
