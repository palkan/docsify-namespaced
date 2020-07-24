// Plugin
// =============================================================================
function docsifyNamespaced(hook, vm) {
  let hashMode = true;
  let namespaces, namespacesRegexp, currentNamespace;

  const goToUrl = function(url) {
    if (hashMode) {
      window.location.hash = url;
    } else {
      window.location.href = url;
    }
  };

  const getUrlParts = function(url){
    if (!url) { url = hashMode ? window.location.hash : window.location.pathname; }

    return url.split(/\//);
  };

  const updateUrlNamespace = function(urlParts, namespace, index, val) {
    // Namespace already exists => replace it
    if (namespace.values.includes(urlParts[index + 1])) {
      if (val) {
        urlParts[index + 1] = val;
      } else {
        urlParts.splice(index + 1, 1);
      }
    } else {
      if (val) {
        urlParts.splice(index + 1, 0, val);
      }
    }
  };

  const openNamespace = function(val, index) {
    const parts = getUrlParts();

    updateUrlNamespace(parts, namespaces[index], index, val);

    const url = parts.join('/');

    goToUrl(url);
  };

  const namespaceSidebarLinks = function(html) {
    if (!currentNamespace) { return html; }

    const namespaceRx = new RegExp('^' + currentNamespace);

    html = html.replace(/(href=['"])(#?[^'"]+)(["'])/g, function(match, prefix, path, suffix){
      // Already namespaced links
      if (path.match(namespaceRx)) { return match; }

      path = path.replace(/^#?\//, currentNamespace);

      return [prefix, path, suffix].join('');
    });

    return html;
  };

  hook.mounted(function(){
    namespaces = vm.config.namespaces;

    const namespaceRegexps = namespaces.map((namespace) => {
      let base = `(?:(${namespace.values.join('|')})/)`;

      if(namespace.optional) { base += '?'; }

      return base;
    });

    namespacesRegexp = new RegExp(`^#?/${namespaceRegexps.join('')}`);

    hashMode = vm.router.mode === 'hash';

    const parts = getUrlParts();

    // Only load default namespace for root path
    const loadDefault = (parts.length === 2) && parts[1] === '';

    namespaces.forEach((namespace, index) => {
      if (!namespace.selector) { return; }

      namespace.selectElement = Docsify.dom.find(namespace.selector);

      if (namespace.default) {
        namespace.selectElement.value = namespace.default;

        // Only update parts if no explicit namespace is provided
        if (!namespace.values.includes(parts[index + 1])) {
          updateUrlNamespace(parts, namespace, index, namespace.default);
        }
      }

      // Prevent aside from closing in mobile view
      Docsify.dom.on(namespace.selectElement, 'click', function (e) { return e.stopPropagation(); });

      // Handle select changes
      Docsify.dom.on(namespace.selectElement, 'change', function (e) { return openNamespace(e.target.value, index); });
    });

    // Override sidebar compiler to prefix links with the current namespace
    const origSidebar = vm.compiler.sidebar;

    vm.compiler.sidebar = function() {
      return namespaceSidebarLinks(origSidebar.apply(this, arguments));
    };

    // Load default namespace
    if (loadDefault) { goToUrl(parts.join('/')); }
  });

  hook.afterEach(function(html, next){
    const url = hashMode ? window.location.hash : window.location.pathname;
    const matches = url.match(namespacesRegexp);

    namespaces.forEach((namespace, index) => {
      if (!namespace.selectElement) { return; }

      namespace.selectElement.value = (matches && matches[index + 1]) || '';
    });

    currentNamespace = matches ? matches[0] : '/';

    // Make current namespace available to other plugins
    vm.config.currentNamespace = currentNamespace;

    next(html);
  });
}

window.$docsify = window.$docsify || {};
window.$docsify.plugins = [docsifyNamespaced].concat(window.$docsify.plugins || []);
