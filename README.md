# docsify-namespaced

A [docsify](https://docsify.js.org) plugin that makes dealing with _multi-dimensional_ documentation (_namespaces_) simpler:

- Automatically updates sidebar links to match the current namespace.
- Handles select input interactions (but do not adds `<select>`-s for you).

This plugin was built to support multi-language and multi-version documentation for [AnyCable](https://github.com/anycable/docs.anycable.io) and [TestProf](https://github.com/test-prof/docs).

## Installation

```html
<script src="https://unpkg.com/docsify-namespaced"></script>
```

## Usage

### Minimal example

Register namespaces in you configuration:

```js
window.$docsify = {
  namespaces: [
    {
      // uniq namespace identifier (no used internally yet but maybe in the future)
      id: "lang",
      // recognizable values
      values: ["ru", "de"],
      // whether this namespace must be present in the path or not
      optional: true,
    },
    {
      id: "version",
      values: ["v1", "v2"],
      optional: true,
    }
  ]
}
```

With the configuration above, whenever the page is loaded, with match the current path using the generated regexp (`/^(\/(ru|de))?(\/(v1|v2))?/`),
and update all the links in the sidebar to start with the matching prefix. For example, if the current page is `/ru/v1/getting_started.md`, we make sure that all sidebar links start with `/ru/v1`.

This allows us to use relative paths in namespace-specific documentations and do not care about absolute links in the sidebar (thus, no need to update them when new namespace levels are added).

### Adding selectors

A typical way of switching between namespaces is by adding a `<select>` input. This plugin can integrate with the existing selects.

For example:

```js
window.$docsify = {
  name: '<a id="home-link" class="app-name-link" data-nosearch href="/">Home</a>' +
        '<select id="lang-selector" name="lang">' +
          '<option value="">English</value>' +
          '<option value="ru">Русский</value>' +
          '<option value="de">Deutsch</value>' +
        '</select>',
  // disable automatic linking to avoid navigating when clicking on select
  nameLink: false,
  namespaces: [
    {
      id: "lang",
      values: ["ru", "de"],
      optional: true,
      // Specify select element query selector
      selector: "#lang-selector",
    }
  ],
}
```

Now this plugin takes care of reacting on select changes and also updating the current select value in case of a direct namespaced URL opening.

### Default namespace

You can specify a default namespace to navigate to on page load (in case no namespace is specified in the url) by adding a default option:

```js
window.$docsify = {
  namespaces:
    {
      id: "version",
      values: ["v1", "v2"],
      optional: true,
      default: "v2",
    }
  ]
}
```

## Acknowledgements

The project's scaffold is based on [docsify-copy-code](https://github.com/jperasmus/docsify-copy-code).

## License

This project is licensed under the MIT License. See the [LICENSE](/LICENSE.txt) for details.
