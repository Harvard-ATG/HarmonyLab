# Documentation 

### Project

High-level project documentation should be in the [wiki](http://github.com/Harvard-ATG/HarmonyLab/wiki). 

### Code 

Javascript code should be documented using [JSDoc](http://usejsdoc.org/) syntax. There are a lot of tags that are available, but here's the basic set of tags that should be used in this project:

#### Methods

Every object method should at least use the following tags to document the function name, parameters, and return value along with a general description of the method and its purpose.

-	**@method**
-	**@param** {<type>} 
-	**@return** {<type>}

The type should be one of: {string|number|boolean|function|object|array|undefined}. If a method does not return an explicit value (i.e. the method is called for its side-effects and not its return value), then it should be documented as **@return {undefined}**.

If the method throws an exception it must include the **@throws** tag

Use the **@todo** tag to document outstanding tasks.

#### Classes

To document a class, use the **constructor** tag on the javascript constructor function that is intended to be used with the *new* keyword.
