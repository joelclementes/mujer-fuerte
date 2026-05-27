"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";

type EditorMensajeProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function EditorMensaje({ value, onChange }: EditorMensajeProps) {
  const editor = useEditor({
    extensions: [StarterKit, Underline],
    content: value,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "min-h-40 rounded-b-2xl border-x border-b border-amber-200 bg-amber-50/40 p-4 text-lg leading-relaxed text-stone-800 outline-none focus:bg-white",
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  if (!editor) return null;

  const botonBase =
    "rounded-xl px-3 py-2 text-sm font-bold ring-1 transition";
  const botonActivo = "bg-amber-700 text-white ring-amber-700";
  const botonInactivo =
    "bg-white text-stone-700 ring-amber-200 hover:bg-amber-50";

  return (
    <div>
      <div className="flex flex-wrap gap-2 rounded-t-2xl border border-amber-200 bg-amber-100/70 p-3">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`${botonBase} ${
            editor.isActive("bold") ? botonActivo : botonInactivo
          }`}
        >
          Negrita
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`${botonBase} ${
            editor.isActive("italic") ? botonActivo : botonInactivo
          }`}
        >
          Cursiva
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`${botonBase} ${
            editor.isActive("underline") ? botonActivo : botonInactivo
          }`}
        >
          Subrayar
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`${botonBase} ${
            editor.isActive("bulletList") ? botonActivo : botonInactivo
          }`}
        >
          Lista
        </button>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}