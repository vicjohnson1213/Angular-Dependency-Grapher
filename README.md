# Angular Dependency Grapher

> A utility to help visualize the dependencies of an Angular 2+ application.

## Installation

ngdeps can be installed globally with npm:

```
npm install -g git+https://github.com/vicjohnson1213/Angular-Dependency-Grapher.git
```

## Usage

```
ngdeps src/ -e -o outputDir/
```

### Options

| Option | Description |
|--------|-------------|
| -e, -- empty | Excludes any files that don't have any imports in the constructor |
| -o, --output | The output directory for the dependency results. If excluded the script will print the dependency data as json. |

