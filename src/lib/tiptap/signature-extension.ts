'use client';

import { Node } from '@tiptap/core';

export interface SignatureOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    signature: {
      setSignature: (options: {
        src: string;
        alt?: string;
        title?: string;
      }) => ReturnType;
    };
  }
}

export const SignatureExtension = Node.create<SignatureOptions>({
  name: 'signature',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  group: 'block',

  content: '',

  atom: true,

  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: (element) => element.getAttribute('src'),
        renderHTML: (attributes) => {
          if (!attributes.src) {
            return {};
          }
          return {
            src: attributes.src,
          };
        },
      },
      alt: {
        default: 'Signature',
        parseHTML: (element) => element.getAttribute('alt'),
        renderHTML: (attributes) => ({
          alt: attributes.alt,
        }),
      },
      title: {
        default: null,
        parseHTML: (element) => element.getAttribute('title'),
        renderHTML: (attributes) => {
          if (!attributes.title) {
            return {};
          }
          return {
            title: attributes.title,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="signature"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes, node }) {
    const { src, alt, title } = node.attrs;

    return [
      'div',
      {
        'data-type': 'signature',
        class: 'signature-block',
        ...this.options.HTMLAttributes,
      },
      [
        'div',
        { class: 'signature-container' },
        [
          'div',
          { class: 'signature-image-wrapper' },
          src
            ? [
                'img',
                {
                  src,
                  alt: alt || 'Signature',
                  title: title || 'Digital Signature',
                  class: 'signature-image',
                  ...HTMLAttributes,
                },
              ]
            : [
                'div',
                {
                  class: 'signature-placeholder',
                },
                'Click to add signature',
              ],
        ],
        ['div', { class: 'signature-line' }],
        [
          'div',
          { class: 'signature-date' },
          `Date: ${new Date().toLocaleDateString()}`,
        ],
      ],
    ];
  },

  addCommands() {
    return {
      setSignature:
        (options: { src: string; alt?: string; title?: string }) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Shift-s': () => this.editor.commands.setSignature({ src: '' }),
    };
  },
});

export default SignatureExtension;
