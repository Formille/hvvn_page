"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import ImageExt from "@tiptap/extension-image";
import { useEffect } from "react";

export function HtmlEditor({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Link.configure({ openOnClick: false }),
      ImageExt,
    ],
    content: value,
    editorProps: {
      attributes: {
        class:
          "prose-store min-h-[260px] bg-paper border border-line p-4 focus:outline-none focus:border-ink",
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) editor.commands.setContent(value || "");
  }, [value, editor]);

  if (!editor) return <div className="bg-paper border border-line p-4 min-h-[260px] text-sm text-muted">{placeholder ?? "..."}</div>;

  return (
    <div>
      <div className="flex flex-wrap gap-1 mb-2 text-xs">
        <Btn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")}>B</Btn>
        <Btn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")}>I</Btn>
        <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })}>H2</Btn>
        <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })}>H3</Btn>
        <Btn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")}>• List</Btn>
        <Btn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")}>"</Btn>
        <Btn onClick={() => {
          const url = prompt("링크 URL");
          if (!url) return;
          editor.chain().focus().setLink({ href: url }).run();
        }}>Link</Btn>
        <Btn onClick={() => {
          const url = prompt("이미지 URL");
          if (!url) return;
          editor.chain().focus().setImage({ src: url }).run();
        }}>Image</Btn>
        <Btn onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}>Clear</Btn>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}

function Btn({ children, active, onClick }: { children: React.ReactNode; active?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-2 py-1 border ${active ? "border-ink bg-ink text-paper" : "border-line"}`}
    >
      {children}
    </button>
  );
}
