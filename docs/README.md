# Developer Documentation 

See the [project overview](OVERVIEW.md) for a quick overview of the project layout and structure. Additional high-level project documentation should be added to the [wiki](http://github.com/Harvard-ATG/HarmonyLab/wiki). 

### Code 

Python code should be documented using standard documentation strings described in [PEP8](http://www.python.org/dev/peps/pep-0008/#documentation-strings).

Javascript code should be documented using [JSDoc](http://usejsdoc.org/) syntax. 

To generate javascript docs from jsdoc blocks:

```sh
npm install -g git://github.com/jsdoc3/jsdoc.git
cd harmony
jsdoc -c docs/jsdoc/conf.json
```

#### Methods

Every method should have a free-form description of the purpose of the method and tags to document the parameters, return values, exceptions thrown, and events fired (if any): 

-	**@param** {type} 
-	**@return** {type}
-	**@throws** {type} Will throw exception when...
-	**@fires** eventName

The *type* should be one of the basic javascript types. If a method does not return an explicit value (i.e. the method is called for its side-effects and not its return value), then it should be documented as **@return undefined**.

#### Classes

To document a class, use the **constructor** tag on the javascript constructor function that is intended to be used with the *new* keyword.


### Miscellaneous

Use the **@todo** tag on methods and classes for tasks that need to be done.
