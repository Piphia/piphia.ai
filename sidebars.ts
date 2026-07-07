import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

// The docs sidebar mirrors the IA: intro → install → quick start → App Guide →
// Python SDK (per-module API+examples) → Plugin SDK (JS) → Examples → Troubleshooting.
const sidebars: SidebarsConfig = {
  docsSidebar: [
    'intro',
    'installation',
    'quick-start',
    {
      type: 'category',
      label: 'App Guide',
      link: {type: 'doc', id: 'app-guides/start-guide'},
      collapsed: false,
      items: [
        'app-guides/start-guide',
        'app-guides/llm-settings',
        'app-guides/database-guide',
        'app-guides/table-guide',
        'app-guides/agents-guide',
      ],
    },
    {
      type: 'category',
      label: 'Python SDK',
      link: {type: 'doc', id: 'python-sdk/quickstart'},
      items: [
        'python-sdk/quickstart',
        'python-sdk/agents',
        'python-sdk/subagents',
        'python-sdk/notes',
        'python-sdk/ideas',
        'python-sdk/tables',
        'python-sdk/smart_calendar',
        'python-sdk/smart_chart',
        'python-sdk/browser',
        'python-sdk/api',
        'python-sdk/examples',
      ],
    },
    {
      type: 'category',
      label: 'Plugin SDK (JS)',
      link: {type: 'doc', id: 'plugins-sdk/overview'},
      items: [
        'plugins-sdk/overview',
        'plugins-sdk/core-plugins',
        'plugins-sdk/dataview-js',
        'plugins-sdk/agent-js',
      ],
    },
    {
      type: 'category',
      label: 'Integrations',
      link: {type: 'doc', id: 'integrations/google'},
      items: ['integrations/google', 'integrations/services',
              'integrations/custom'],
    },
    {
      type: 'category',
      label: 'Examples',
      link: {type: 'doc', id: 'examples/usage-examples'},
      items: ['examples/usage-examples'],
    },
    'troubleshooting',
  ],
};

export default sidebars;
