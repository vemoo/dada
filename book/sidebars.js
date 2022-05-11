/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */

// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  // By default, Docusaurus generates a sidebar from the docs folder structure
  // tutorialSidebar: [{type: 'autogenerated', dirName: '.'}],

  // But you can create a sidebar manually
  tutorialSidebar: [
    {
      type: 'category',
      label: 'Tutorials',
      link: { type: 'doc', id: 'tutorials' },
      items: [{
        type: 'category',
        label: 'Dynamic Dada',
        items: [
          'dyn_tutorial/index',
          'dyn_tutorial/class',
          'dyn_tutorial/labeled_arguments',
          'dyn_tutorial/permissions',
          'dyn_tutorial/my',
          'dyn_tutorial/our',
          'dyn_tutorial/sharing_xor_mutation',
          'dyn_tutorial/field_permissions',
          'dyn_tutorial/any',
          'dyn_tutorial/lease',
          'dyn_tutorial/sublease',
          'dyn_tutorial/shlease',
          'dyn_tutorial/house_party',
          'dyn_tutorial/atomic',
        ],
      },
      {
        type: 'category',
        label: 'Typed Dada',
        items: [
          'typed_tutorial',
        ],
      }],
    }
  ],

  designDocsSidebar: [
    {
      type: 'category',
      label: 'Design Docs',
      link: { type: 'doc', id: 'design_docs' },
      items: [
        'design_docs/goals',
        'design_docs/experience',
        'design_docs/calculus',
        'design_docs/sketchy_ideas',
        'design_docs/sharing_synthesized_values',
      ],
    }
  ],

  contributingSidebar: [
    {
      type: 'category',
      label: 'Contributing',
      link: { type: 'doc', id: 'contributing' },
      items: [
        'contributing/coc',
        'contributing/guidelines',
        'contributing/build',
      ],
    }
  ],

  aboutSidebar: [
    {
      type: 'category',
      label: 'About',
      link: { type: 'doc', id: 'about' },
      items: [
        'about/faq'
      ],
    }
  ]
};

module.exports = sidebars;
