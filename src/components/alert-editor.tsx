'use client';

import Image from '@tiptap/extension-image';
import { EditorContent, useEditor, useEditorState, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Placeholder } from '@tiptap/extensions';
import { useRef, useState } from 'react';
import { cx } from './ui';

/**
 * Rich-text editor for alert bodies: formatting, hyperlinks and photos.
 * The HTML it produces is sanitized again on the server before it is saved.
 */

const MAX_IMAGE_EDGE = 1600;
const MAX_SOURCE_BYTES = 15 * 1024 * 1024;

export function AlertEditor({
  initialHtml,
  onChange,
}: {
  initialHtml: string;
  onChange: (html: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        // Not useful for town alerts, and the server sanitizer strips them anyway.
        code: false,
        codeBlock: false,
        link: {
          openOnClick: false,
          autolink: true,
          protocols: ['mailto', 'tel'],
          isAllowedUri: (url, ctx) =>
            /^(https?:|mailto:|tel:)/i.test(url) && ctx.defaultValidate(url),
        },
      }),
      Image.configure({ allowBase64: false }),
      Placeholder.configure({ placeholder: 'Write the message residents will see…' }),
    ],
    content: initialHtml,
    editorProps: {
      attributes: {
        class: 'prose-alert min-h-56 px-4 py-3',
        'aria-label': 'Message body',
        role: 'textbox',
        'aria-multiline': 'true',
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  async function uploadPhoto(file: File) {
    setError(null);
    if (file.size > MAX_SOURCE_BYTES) {
      setError('That photo is larger than 15 MB. Choose a smaller one.');
      return;
    }
    setUploading(true);
    try {
      const body = new FormData();
      body.append('file', await downscale(file), 'photo.jpg');
      const res = await fetch('/api/images', { method: 'POST', body });
      const json = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !json.url) throw new Error(json.error ?? 'Upload failed.');
      const alt =
        window.prompt('Short description of the photo (read aloud by screen readers):') ?? '';
      editor?.chain().focus().setImage({ src: json.url, alt }).run();
    } catch (e) {
      setError((e as Error).message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface">
      {editor && (
        <Toolbar
          editor={editor}
          uploading={uploading}
          onPhoto={() => fileInput.current?.click()}
          onError={setError}
        />
      )}
      <input
        ref={fileInput}
        type="file"
        accept="image/png,image/jpeg,image/gif,image/webp"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = '';
          if (file) void uploadPhoto(file);
        }}
      />
      <EditorContent editor={editor} />
      {error && (
        <p role="alert" className="border-t border-border px-4 py-2 text-sm text-emergency">
          {error}
        </p>
      )}
    </div>
  );
}

function Toolbar({
  editor,
  uploading,
  onPhoto,
  onError,
}: {
  editor: Editor;
  uploading: boolean;
  onPhoto: () => void;
  onError: (message: string | null) => void;
}) {
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive('bold'),
      italic: e.isActive('italic'),
      underline: e.isActive('underline'),
      h2: e.isActive('heading', { level: 2 }),
      bullet: e.isActive('bulletList'),
      ordered: e.isActive('orderedList'),
      link: e.isActive('link'),
    }),
  });

  function setLink() {
    const previous = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('Link address (https://…)', previous ?? 'https://');
    if (url === null) return;
    if (url.trim() === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    if (!/^(https?:\/\/|mailto:|tel:)/i.test(url.trim())) {
      onError('Links must start with https://, http://, mailto: or tel:');
      return;
    }
    onError(null);
    const chain = editor.chain().focus().extendMarkRange('link');
    if (editor.state.selection.empty && !state.link) {
      chain
        .insertContent({
          type: 'text',
          text: url.trim(),
          marks: [{ type: 'link', attrs: { href: url.trim() } }],
        })
        .run();
    } else {
      chain.setLink({ href: url.trim() }).run();
    }
  }

  const tb = (active: boolean) =>
    cx(
      'rounded-md border px-2.5 py-1 text-sm',
      active
        ? 'border-brand bg-brand text-brand-contrast'
        : 'border-transparent hover:border-border hover:bg-surface',
    );

  return (
    <div
      role="toolbar"
      aria-label="Formatting"
      className="flex flex-wrap gap-1 border-b border-border bg-surface-2 p-1.5"
    >
      <button
        type="button"
        className={tb(state.bold)}
        aria-pressed={state.bold}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <b>B</b>
        <span className="sr-only">Bold</span>
      </button>
      <button
        type="button"
        className={tb(state.italic)}
        aria-pressed={state.italic}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <i>I</i>
        <span className="sr-only">Italic</span>
      </button>
      <button
        type="button"
        className={tb(state.underline)}
        aria-pressed={state.underline}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <u>U</u>
        <span className="sr-only">Underline</span>
      </button>
      <span className="mx-1 w-px bg-border" />
      <button
        type="button"
        className={tb(state.h2)}
        aria-pressed={state.h2}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        Heading
      </button>
      <button
        type="button"
        className={tb(state.bullet)}
        aria-pressed={state.bullet}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        • List
      </button>
      <button
        type="button"
        className={tb(state.ordered)}
        aria-pressed={state.ordered}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        1. List
      </button>
      <span className="mx-1 w-px bg-border" />
      <button type="button" className={tb(state.link)} aria-pressed={state.link} onClick={setLink}>
        🔗 {state.link ? 'Edit link' : 'Link'}
      </button>
      <button type="button" className={tb(false)} onClick={onPhoto} disabled={uploading}>
        🖼 {uploading ? 'Uploading…' : 'Photo'}
      </button>
    </div>
  );
}

/** Resize large photos in the browser so uploads stay small and fast on any connection. */
async function downscale(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_IMAGE_EDGE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('Could not read that image.'))),
      'image/jpeg',
      0.85,
    ),
  );
}
